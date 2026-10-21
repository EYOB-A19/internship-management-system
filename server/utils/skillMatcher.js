/**
 * Transparent Rule-Based Skill & Profile Matching Engine
 * Evaluates student skills and academic profile against internship requirements.
 * Designed as a modular strategy so a future ML recommendation engine can plug in seamlessly.
 */
export function calculateInternshipMatch(studentProfile, internship) {
  if (!studentProfile || !internship) {
    return {
      score: 0,
      requiredMatchedCount: 0,
      requiredTotalCount: 0,
      preferredMatchedCount: 0,
      preferredTotalCount: 0,
      matchedSkills: [],
      missingSkills: [],
      preferredMatches: [],
      checklist: [],
      breakdown: {
        requiredSkillsRatio: 0,
        fieldCompatible: false,
        levelCompatible: false,
        locationCompatible: false,
      },
    };
  }

  const studentSkillNames = new Set(
    (studentProfile.skills || []).map((s) => (typeof s === 'string' ? s : s.name).toLowerCase().trim())
  );

  const requiredSkills = (internship.required_skills || []).map((s) =>
    typeof s === 'string' ? s : s.name
  );
  const preferredSkills = (internship.preferred_skills || []).map((s) =>
    typeof s === 'string' ? s : s.name
  );

  const matchedSkills = [];
  const missingSkills = [];
  const checklist = [];

  for (const skillName of requiredSkills) {
    const isMatched = studentSkillNames.has(skillName.toLowerCase().trim());
    if (isMatched) {
      matchedSkills.push(skillName);
    } else {
      missingSkills.push(skillName);
    }
    checklist.push({
      name: skillName,
      isRequired: true,
      matched: isMatched,
    });
  }

  const preferredMatches = [];
  for (const skillName of preferredSkills) {
    const isMatched = studentSkillNames.has(skillName.toLowerCase().trim());
    if (isMatched) {
      preferredMatches.push(skillName);
    }
    checklist.push({
      name: skillName,
      isRequired: false,
      matched: isMatched,
    });
  }

  const requiredTotalCount = requiredSkills.length;
  const requiredMatchedCount = matchedSkills.length;
  const preferredTotalCount = preferredSkills.length;
  const preferredMatchedCount = preferredMatches.length;

  // Pure skill ratio when all required skills are met = 100% if criteria align
  const requiredRatio =
    requiredTotalCount > 0 ? requiredMatchedCount / requiredTotalCount : 1;
  const preferredRatio =
    preferredTotalCount > 0 ? preferredMatchedCount / preferredTotalCount : 1;

  // Field of study compatibility
  const studentField = (studentProfile.field_of_study_name || studentProfile.department_name || '').toLowerCase();
  const targetFields = (internship.fields_of_study || []).map((f) => f.toLowerCase());
  const fieldCompatible =
    targetFields.length === 0 ||
    targetFields.some((f) => studentField.includes(f) || f.includes(studentField));

  // Academic level compatibility
  const targetLevels = (internship.academic_levels || []).map((l) => l.toLowerCase());
  const levelCompatible =
    targetLevels.length === 0 ||
    targetLevels.includes((studentProfile.academic_level || 'BSc').toLowerCase());

  // Location / Work Mode compatibility
  const locationCompatible =
    internship.work_mode === 'Remote' ||
    !studentProfile.location ||
    (internship.location || '').toLowerCase() === (studentProfile.location || '').toLowerCase();

  // Transparent weighted calculation:
  // If student matches 100% of required skills AND field/level match, score is 100% (or 95-100% based on preferred skills)
  let rawScore = requiredRatio * 75;
  rawScore += preferredRatio * 10;
  if (fieldCompatible) rawScore += 7;
  if (levelCompatible) rawScore += 5;
  if (locationCompatible) rawScore += 3;

  // Also honor exact skill ratio clarity when all required skills match
  if (requiredTotalCount > 0 && requiredMatchedCount === requiredTotalCount && fieldCompatible && levelCompatible) {
    rawScore = Math.max(rawScore, preferredMatchedCount > 0 || preferredTotalCount === 0 ? 100 : 95);
  }

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    score,
    requiredMatchedCount,
    requiredTotalCount,
    preferredMatchedCount,
    preferredTotalCount,
    matchedSkills,
    missingSkills,
    preferredMatches,
    checklist,
    breakdown: {
      requiredSkillsRatio: Math.round(requiredRatio * 100),
      fieldCompatible,
      levelCompatible,
      locationCompatible,
    },
  };
}

/**
 * Calculates how well a student matches a company discovery search query / filter set
 */
export function calculateStudentSearchMatch(studentProfile, filterSkills = []) {
  const normalizedFilterSkills = filterSkills
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean);

  const studentSkillNames = (studentProfile.skills || []).map((s) =>
    (typeof s === 'string' ? s : s.name).toLowerCase().trim()
  );
  const studentSkillSet = new Set(studentSkillNames);

  if (normalizedFilterSkills.length === 0) {
    // Baseline profile completeness & skill richness score
    const skillPoints = Math.min(60, studentSkillNames.length * 10);
    const projectPoints = Math.min(20, (studentProfile.projects || []).length * 10);
    const certPoints = Math.min(10, (studentProfile.certifications || []).length * 5);
    const bioPoints = studentProfile.bio ? 10 : 0;
    return {
      score: Math.min(98, Math.max(65, skillPoints + projectPoints + certPoints + bioPoints)),
      matchedSkills: (studentProfile.skills || []).map((s) => s.name || s),
      missingSkills: [],
    };
  }

  const matchedSkills = [];
  const missingSkills = [];
  for (const reqSkill of normalizedFilterSkills) {
    if (studentSkillSet.has(reqSkill)) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  const score = Math.round((matchedSkills.length / normalizedFilterSkills.length) * 100);
  return {
    score,
    matchedSkills,
    missingSkills,
  };
}
