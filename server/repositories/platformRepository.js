import { db } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const platformRepository = {
  // =========================================================================
  // USERS
  // =========================================================================
  findUserByEmail(email) {
    const normalized = (email || '').toLowerCase().trim();
    return db.table('users').find((u) => u.email.toLowerCase() === normalized) || null;
  },

  findUserById(id) {
    return db.table('users').find((u) => u.id === id) || null;
  },

  createUser({ email, password_hash, role, status = 'ACTIVE' }) {
    const existing = this.findUserByEmail(email);
    if (existing) {
      throw new AppError('An account with this email already exists.', 409, 'EMAIL_ALREADY_EXISTS');
    }
    const now = new Date().toISOString();
    const newUser = {
      id: db.uuid(),
      email: email.toLowerCase().trim(),
      password_hash,
      role,
      status,
      last_login_at: now,
      created_at: now,
      updated_at: now,
    };
    db.table('users').push(newUser);
    db.persist();
    return newUser;
  },

  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates, { updated_at: new Date().toISOString() });
    db.persist();
    return user;
  },

  // =========================================================================
  // CATALOG TABLES (UNIVERSITIES, DEPARTMENTS, FIELDS, SKILLS)
  // =========================================================================
  listUniversities({ includeInactive = false } = {}) {
    const list = db.table('universities');
    return (includeInactive ? list : list.filter((u) => u.is_active !== false)).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  },

  createUniversity(payload) {
    const existing = db
      .table('universities')
      .find((u) => u.name.toLowerCase() === payload.name.toLowerCase().trim());
    if (existing) {
      throw new AppError('University with this name already exists.', 409, 'DUPLICATE_UNIVERSITY');
    }
    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      name: payload.name.trim(),
      short_name: (payload.short_name || payload.name.slice(0, 6)).toUpperCase().trim(),
      city: (payload.city || 'Addis Ababa').trim(),
      region: (payload.region || 'Addis Ababa').trim(),
      website: payload.website || '',
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    db.table('universities').push(record);
    db.persist();
    return record;
  },

  updateUniversity(id, updates) {
    const uni = db.table('universities').find((u) => u.id === id);
    if (!uni) throw new AppError('University not found', 404, 'UNIVERSITY_NOT_FOUND');
    Object.assign(uni, updates, { updated_at: new Date().toISOString() });
    db.persist();
    return uni;
  },

  listDepartments({ includeInactive = false } = {}) {
    const list = db.table('departments');
    return (includeInactive ? list : list.filter((d) => d.is_active !== false)).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  },

  createDepartment(payload) {
    const existing = db
      .table('departments')
      .find((d) => d.name.toLowerCase() === payload.name.toLowerCase().trim());
    if (existing) {
      throw new AppError('Department already exists.', 409, 'DUPLICATE_DEPARTMENT');
    }
    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      name: payload.name.trim(),
      faculty: (payload.faculty || 'College of Engineering and Technology').trim(),
      description: payload.description || '',
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    db.table('departments').push(record);
    if (payload.createField !== false) {
      const existingField = db
        .table('fields_of_study')
        .find((f) => f.name.toLowerCase() === record.name.toLowerCase());
      if (!existingField) {
        db.table('fields_of_study').push({
          id: db.uuid(),
          department_id: record.id,
          name: record.name,
          is_active: true,
          created_at: now,
          updated_at: now,
        });
      }
    }
    db.persist();
    return record;
  },

  updateDepartment(id, updates) {
    const dept = db.table('departments').find((d) => d.id === id);
    if (!dept) throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
    Object.assign(dept, updates, { updated_at: new Date().toISOString() });
    db.persist();
    return dept;
  },

  listFieldsOfStudy() {
    return db
      .table('fields_of_study')
      .filter((f) => f.is_active !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  listSkills({ includeInactive = false } = {}) {
    const list = db.table('skills');
    return (includeInactive ? list : list.filter((s) => s.is_active !== false)).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  },

  findOrCreateSkillByName(name, category = 'Technical') {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;
    const existing = db
      .table('skills')
      .find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    const now = new Date().toISOString();
    const created = {
      id: db.uuid(),
      name: trimmed,
      category,
      is_active: true,
      created_at: now,
      updated_at: now,
    };
    db.table('skills').push(created);
    db.persist();
    return created;
  },

  updateSkill(id, updates) {
    const skill = db.table('skills').find((s) => s.id === id);
    if (!skill) throw new AppError('Skill not found', 404, 'SKILL_NOT_FOUND');
    Object.assign(skill, updates, { updated_at: new Date().toISOString() });
    db.persist();
    return skill;
  },

  // =========================================================================
  // STUDENT PROFILES & RELATIONS
  // =========================================================================
  hydrateStudentProfile(profile) {
    if (!profile) return null;
    const user = this.findUserById(profile.user_id);
    const uni = db.table('universities').find((u) => u.id === profile.university_id);
    const dept = db.table('departments').find((d) => d.id === profile.department_id);
    const fos = db.table('fields_of_study').find((f) => f.id === profile.field_of_study_id);

    const skillLinks = db.table('student_skills').filter((ss) => ss.student_id === profile.id);
    const skills = skillLinks
      .map((ss) => {
        const sk = db.table('skills').find((s) => s.id === ss.skill_id);
        return sk ? { id: sk.id, name: sk.name, category: sk.category, proficiency: ss.proficiency } : null;
      })
      .filter(Boolean);

    const education = db
      .table('student_education')
      .filter((e) => e.student_id === profile.id)
      .sort((a, b) => (b.start_year || 0) - (a.start_year || 0));

    const projects = db
      .table('student_projects')
      .filter((p) => p.student_id === profile.id);

    const certifications = db
      .table('student_certifications')
      .filter((c) => c.student_id === profile.id);

    return {
      ...profile,
      email: user?.email || '',
      account_status: user?.status || 'ACTIVE',
      full_name: [profile.first_name, profile.father_name, profile.grandfather_name]
        .filter(Boolean)
        .join(' '),
      university_name: uni?.name || 'Not specified',
      university_short_name: uni?.short_name || '',
      university_city: uni?.city || '',
      department_name: dept?.name || 'Not specified',
      field_of_study_name: fos?.name || dept?.name || 'Computer Science',
      skills,
      education,
      projects,
      certifications,
    };
  },

  findStudentByUserId(userId) {
    const profile = db.table('student_profiles').find((sp) => sp.user_id === userId);
    return this.hydrateStudentProfile(profile);
  },

  findStudentById(studentId) {
    const profile = db.table('student_profiles').find((sp) => sp.id === studentId);
    return this.hydrateStudentProfile(profile);
  },

  createStudentProfile(payload) {
    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      user_id: payload.user_id,
      first_name: payload.first_name || 'Student',
      father_name: payload.father_name || '',
      grandfather_name: payload.grandfather_name || '',
      phone: payload.phone || '',
      profile_photo: payload.profile_photo || '',
      university_id: payload.university_id || 'uni-aau-002',
      department_id: payload.department_id || 'dept-cse-001',
      field_of_study_id: payload.field_of_study_id || 'fos-001',
      academic_level: payload.academic_level || 'BSc',
      graduation_year: Number(payload.graduation_year) || 2027,
      gpa: payload.gpa ? Number(payload.gpa) : null,
      location: payload.location || 'Addis Ababa',
      bio: payload.bio || '',
      languages: Array.isArray(payload.languages) ? payload.languages : ['Amharic', 'English'],
      experience: Array.isArray(payload.experience) ? payload.experience : [],
      portfolio_url: payload.portfolio_url || '',
      github_url: payload.github_url || '',
      linkedin_url: payload.linkedin_url || '',
      cv_url: payload.cv_url || '',
      availability: payload.availability || 'Immediate - Full-time Intern',
      is_portfolio_public: payload.is_portfolio_public !== false,
      expose_contact_info: Boolean(payload.expose_contact_info),
      created_at: now,
      updated_at: now,
    };
    db.table('student_profiles').push(record);
    db.persist();
    return this.hydrateStudentProfile(record);
  },

  updateStudentProfile(studentId, updates) {
    const profile = db.table('student_profiles').find((sp) => sp.id === studentId);
    if (!profile) throw new AppError('Student profile not found', 404, 'STUDENT_NOT_FOUND');

    const allowedFields = [
      'first_name',
      'father_name',
      'grandfather_name',
      'phone',
      'profile_photo',
      'university_id',
      'department_id',
      'field_of_study_id',
      'academic_level',
      'graduation_year',
      'gpa',
      'location',
      'bio',
      'languages',
      'experience',
      'portfolio_url',
      'github_url',
      'linkedin_url',
      'cv_url',
      'availability',
      'is_portfolio_public',
      'expose_contact_info',
    ];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        profile[key] = updates[key];
      }
    }
    profile.updated_at = new Date().toISOString();

    if (Array.isArray(updates.skills)) {
      this.setStudentSkills(studentId, updates.skills);
    }

    db.persist();
    return this.hydrateStudentProfile(profile);
  },

  setStudentSkills(studentId, skillItems) {
    const table = db.table('student_skills');
    for (let i = table.length - 1; i >= 0; i--) {
      if (table[i].student_id === studentId) {
        table.splice(i, 1);
      }
    }
    const now = new Date().toISOString();
    const seen = new Set();
    for (const item of skillItems) {
      const skillName = typeof item === 'string' ? item : item.name;
      const proficiency = typeof item === 'object' && item.proficiency ? item.proficiency : 'Intermediate';
      const skillRecord = this.findOrCreateSkillByName(skillName);
      if (skillRecord && !seen.has(skillRecord.id)) {
        seen.add(skillRecord.id);
        table.push({
          id: db.uuid(),
          student_id: studentId,
          skill_id: skillRecord.id,
          proficiency,
          created_at: now,
        });
      }
    }
    db.persist();
  },

  addStudentEducation(studentId, edu) {
    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      student_id: studentId,
      institution: edu.institution,
      degree: edu.degree || 'BSc',
      field_of_study: edu.field_of_study,
      start_year: Number(edu.start_year) || 2022,
      end_year: edu.end_year ? Number(edu.end_year) : 2027,
      gpa: edu.gpa || '',
      description: edu.description || '',
      created_at: now,
      updated_at: now,
    };
    db.table('student_education').push(record);
    db.persist();
    return record;
  },

  deleteStudentEducation(studentId, eduId) {
    const table = db.table('student_education');
    const idx = table.findIndex((e) => e.id === eduId && e.student_id === studentId);
    if (idx === -1) throw new AppError('Education entry not found', 404, 'EDUCATION_NOT_FOUND');
    table.splice(idx, 1);
    db.persist();
  },

  addStudentProject(studentId, proj) {
    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      student_id: studentId,
      title: proj.title,
      description: proj.description,
      technologies: Array.isArray(proj.technologies)
        ? proj.technologies
        : (proj.technologies || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
      project_url: proj.project_url || '',
      github_url: proj.github_url || '',
      images: Array.isArray(proj.images) ? proj.images : [],
      created_at: now,
      updated_at: now,
    };
    db.table('student_projects').push(record);
    db.persist();
    return record;
  },

  deleteStudentProject(studentId, projectId) {
    const table = db.table('student_projects');
    const idx = table.findIndex((p) => p.id === projectId && p.student_id === studentId);
    if (idx === -1) throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    table.splice(idx, 1);
    db.persist();
  },

  addStudentCertification(studentId, cert) {
    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      student_id: studentId,
      name: cert.name,
      issuer: cert.issuer,
      issue_date: cert.issue_date || now.slice(0, 10),
      credential_url: cert.credential_url || '',
      certificate_file_url: cert.certificate_file_url || '',
      created_at: now,
      updated_at: now,
    };
    db.table('student_certifications').push(record);
    db.persist();
    return record;
  },

  deleteStudentCertification(studentId, certId) {
    const table = db.table('student_certifications');
    const idx = table.findIndex((c) => c.id === certId && c.student_id === studentId);
    if (idx === -1) throw new AppError('Certification not found', 404, 'CERTIFICATION_NOT_FOUND');
    table.splice(idx, 1);
    db.persist();
  },

  listAllStudents() {
    return db.table('student_profiles').map((sp) => this.hydrateStudentProfile(sp));
  },

  // =========================================================================
  // COMPANIES & VERIFICATIONS
  // =========================================================================
  hydrateCompany(company) {
    if (!company) return null;
    const user = this.findUserById(company.user_id);
    const activeInternshipsCount = db
      .table('internships')
      .filter((i) => i.company_id === company.id && i.status === 'Published').length;
    return {
      ...company,
      account_email: user?.email || company.email,
      account_status: user?.status || 'ACTIVE',
      is_verified: company.verification_status === 'APPROVED',
      active_internships_count: activeInternshipsCount,
    };
  },

  findCompanyByUserId(userId) {
    const company = db.table('companies').find((c) => c.user_id === userId);
    return this.hydrateCompany(company);
  },

  findCompanyById(companyId) {
    const company = db.table('companies').find((c) => c.id === companyId);
    return this.hydrateCompany(company);
  },

  createCompanyProfile(payload) {
    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      user_id: payload.user_id,
      company_name: payload.company_name || 'Organization',
      logo_url: payload.logo_url || '',
      description: payload.description || '',
      industry: payload.industry || 'Technology & Engineering',
      website: payload.website || '',
      email: payload.email || '',
      phone: payload.phone || '',
      location: payload.location || 'Addis Ababa',
      address: payload.address || '',
      company_size: payload.company_size || '10-50 employees',
      founded_year: Number(payload.founded_year) || 2022,
      tin_number: payload.tin_number || '',
      business_license_url: payload.business_license_url || '',
      social_links: payload.social_links || {},
      verification_status: 'PENDING',
      verified_at: null,
      verified_by: null,
      verification_notes: 'Initial registration pending admin verification.',
      created_at: now,
      updated_at: now,
    };
    db.table('companies').push(record);
    db.persist();
    return this.hydrateCompany(record);
  },

  updateCompanyProfile(companyId, updates) {
    const company = db.table('companies').find((c) => c.id === companyId);
    if (!company) throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND');
    const allowed = [
      'company_name',
      'logo_url',
      'description',
      'industry',
      'website',
      'email',
      'phone',
      'location',
      'address',
      'company_size',
      'founded_year',
      'tin_number',
      'business_license_url',
      'social_links',
    ];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        company[key] = updates[key];
      }
    }
    company.updated_at = new Date().toISOString();
    db.persist();
    return this.hydrateCompany(company);
  },

  listCompanies() {
    return db.table('companies').map((c) => this.hydrateCompany(c));
  },

  createVerificationRequest(payload) {
    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      company_id: payload.company_id,
      submitted_by: payload.submitted_by,
      tin_number: payload.tin_number,
      registration_number: payload.registration_number || '',
      document_url: payload.document_url || '',
      notes: payload.notes || '',
      status: 'PENDING',
      reviewed_by: null,
      reviewed_at: null,
      review_notes: null,
      created_at: now,
      updated_at: now,
    };
    db.table('company_verifications').push(record);
    const company = db.table('companies').find((c) => c.id === payload.company_id);
    if (company) {
      company.tin_number = payload.tin_number;
      if (payload.document_url) company.business_license_url = payload.document_url;
      if (company.verification_status !== 'APPROVED') {
        company.verification_status = 'PENDING';
      }
      company.updated_at = now;
    }
    db.persist();
    return record;
  },

  listVerificationRequests() {
    return db
      .table('company_verifications')
      .map((v) => {
        const company = this.findCompanyById(v.company_id);
        return {
          ...v,
          company_name: company?.company_name || 'Unknown Company',
          company_location: company?.location || '',
          company_industry: company?.industry || '',
          company_email: company?.email || '',
          company_website: company?.website || '',
          current_company_status: company?.verification_status || v.status,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // =========================================================================
  // INTERNSHIPS
  // =========================================================================
  hydrateInternship(internship) {
    if (!internship) return null;
    const company = this.findCompanyById(internship.company_id);
    const skillLinks = db
      .table('internship_skills')
      .filter((is) => is.internship_id === internship.id);

    const required_skills = [];
    const preferred_skills = [];
    for (const link of skillLinks) {
      const sk = db.table('skills').find((s) => s.id === link.skill_id);
      if (sk) {
        if (link.is_required) {
          required_skills.push(sk.name);
        } else {
          preferred_skills.push(sk.name);
        }
      }
    }

    const applicationsCount = db
      .table('applications')
      .filter((a) => a.internship_id === internship.id).length;

    return {
      ...internship,
      company_name: company?.company_name || 'Company',
      company_logo: company?.logo_url || '',
      company_industry: company?.industry || '',
      company_location: company?.location || internship.location,
      company_verification_status: company?.verification_status || 'PENDING',
      company_verified: company?.verification_status === 'APPROVED',
      required_skills,
      preferred_skills,
      applications_count: applicationsCount,
    };
  },

  findInternshipById(id) {
    const internship = db.table('internships').find((i) => i.id === id);
    return this.hydrateInternship(internship);
  },

  listInternships() {
    return db.table('internships').map((i) => this.hydrateInternship(i));
  },

  createInternship(payload) {
    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      company_id: payload.company_id,
      category: payload.category || 'Website Development',
      title: payload.title.trim(),
      description: payload.description.trim(),
      department_team: (payload.department_team || 'Engineering & Operations').trim(),
      location: payload.location.trim(),
      work_mode: payload.work_mode || 'On-site',
      duration: payload.duration || '3 Months',
      duration_months: Number(payload.duration_months) || parseInt(payload.duration, 10) || 3,
      start_date: payload.start_date || '2026-11-15',
      application_deadline: payload.application_deadline,
      positions: Number(payload.positions) || 1,
      academic_levels: Array.isArray(payload.academic_levels)
        ? payload.academic_levels
        : ['BSc'],
      fields_of_study: Array.isArray(payload.fields_of_study)
        ? payload.fields_of_study
        : ['Computer Science'],
      minimum_requirements: payload.minimum_requirements || payload.description,
      responsibilities: payload.responsibilities || payload.description,
      benefits: payload.benefits || '',
      stipend_amount: Number(payload.stipend_amount) || 0,
      stipend_currency: 'ETB',
      is_paid: Number(payload.stipend_amount) > 0,
      application_instructions: payload.application_instructions || '',
      status: payload.status || 'Published',
      views_count: 0,
      created_at: now,
      updated_at: now,
    };

    db.table('internships').push(record);
    this.setInternshipSkills(
      record.id,
      payload.required_skills || [],
      payload.preferred_skills || []
    );
    db.persist();
    return this.hydrateInternship(record);
  },

  setInternshipSkills(internshipId, requiredSkills = [], preferredSkills = []) {
    const table = db.table('internship_skills');
    for (let i = table.length - 1; i >= 0; i--) {
      if (table[i].internship_id === internshipId) {
        table.splice(i, 1);
      }
    }
    const now = new Date().toISOString();
    const seen = new Set();

    for (const skillName of requiredSkills) {
      const sk = this.findOrCreateSkillByName(skillName);
      if (sk && !seen.has(sk.id)) {
        seen.add(sk.id);
        table.push({
          id: db.uuid(),
          internship_id: internshipId,
          skill_id: sk.id,
          is_required: true,
          created_at: now,
        });
      }
    }

    for (const skillName of preferredSkills) {
      const sk = this.findOrCreateSkillByName(skillName);
      if (sk && !seen.has(sk.id)) {
        seen.add(sk.id);
        table.push({
          id: db.uuid(),
          internship_id: internshipId,
          skill_id: sk.id,
          is_required: false,
          created_at: now,
        });
      }
    }
  },

  updateInternship(id, updates) {
    const internship = db.table('internships').find((i) => i.id === id);
    if (!internship) throw new AppError('Internship not found', 404, 'INTERNSHIP_NOT_FOUND');

    const allowed = [
      'title',
      'description',
      'department_team',
      'location',
      'work_mode',
      'duration',
      'duration_months',
      'start_date',
      'application_deadline',
      'positions',
      'academic_levels',
      'fields_of_study',
      'minimum_requirements',
      'responsibilities',
      'benefits',
      'stipend_amount',
      'is_paid',
      'application_instructions',
      'status',
    ];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        internship[key] = updates[key];
      }
    }
    if (updates.stipend_amount !== undefined) {
      internship.stipend_amount = Number(updates.stipend_amount) || 0;
      internship.is_paid = internship.stipend_amount > 0;
    }
    internship.updated_at = new Date().toISOString();

    if (updates.required_skills !== undefined || updates.preferred_skills !== undefined) {
      const hydrated = this.hydrateInternship(internship);
      this.setInternshipSkills(
        id,
        updates.required_skills !== undefined ? updates.required_skills : hydrated.required_skills,
        updates.preferred_skills !== undefined ? updates.preferred_skills : hydrated.preferred_skills
      );
    }

    db.persist();
    return this.hydrateInternship(internship);
  },

  deleteInternship(id) {
    const table = db.table('internships');
    const idx = table.findIndex((i) => i.id === id);
    if (idx === -1) throw new AppError('Internship not found', 404, 'INTERNSHIP_NOT_FOUND');
    table.splice(idx, 1);
    db.persist();
  },

  // =========================================================================
  // SAVED INTERNSHIPS
  // =========================================================================
  listSavedInternships(studentId) {
    return db
      .table('saved_internships')
      .filter((s) => s.student_id === studentId)
      .map((s) => {
        const internship = this.findInternshipById(s.internship_id);
        return internship ? { ...internship, saved_at: s.created_at } : null;
      })
      .filter(Boolean);
  },

  toggleSaveInternship(studentId, internshipId) {
    const table = db.table('saved_internships');
    const existingIdx = table.findIndex(
      (s) => s.student_id === studentId && s.internship_id === internshipId
    );
    if (existingIdx !== -1) {
      table.splice(existingIdx, 1);
      db.persist();
      return { saved: false };
    }
    table.push({
      id: db.uuid(),
      student_id: studentId,
      internship_id: internshipId,
      created_at: new Date().toISOString(),
    });
    db.persist();
    return { saved: true };
  },

  // =========================================================================
  // APPLICATIONS
  // =========================================================================
  hydrateApplication(app) {
    if (!app) return null;
    const student = this.findStudentById(app.student_id);
    const internship = this.findInternshipById(app.internship_id);
    const interviews = db
      .table('interviews')
      .filter((iv) => iv.application_id === app.id);

    return {
      ...app,
      student: student
        ? {
            id: student.id,
            user_id: student.user_id,
            full_name: student.full_name,
            first_name: student.first_name,
            father_name: student.father_name,
            email: student.email,
            phone: student.phone,
            profile_photo: student.profile_photo,
            university_name: student.university_name,
            university_short_name: student.university_short_name,
            department_name: student.department_name,
            field_of_study_name: student.field_of_study_name,
            academic_level: student.academic_level,
            graduation_year: student.graduation_year,
            gpa: student.gpa,
            location: student.location,
            skills: student.skills,
            portfolio_url: student.portfolio_url,
            github_url: student.github_url,
            linkedin_url: student.linkedin_url,
            cv_url: app.cv_url || student.cv_url,
          }
        : null,
      internship: internship
        ? {
            id: internship.id,
            title: internship.title,
            company_id: internship.company_id,
            company_name: internship.company_name,
            company_verified: internship.company_verified,
            location: internship.location,
            work_mode: internship.work_mode,
            duration: internship.duration,
            stipend_amount: internship.stipend_amount,
            stipend_currency: internship.stipend_currency,
            application_deadline: internship.application_deadline,
            required_skills: internship.required_skills,
          }
        : null,
      interviews,
    };
  },

  findApplicationById(id) {
    const app = db.table('applications').find((a) => a.id === id);
    return this.hydrateApplication(app);
  },

  findApplicationByStudentAndInternship(studentId, internshipId) {
    return (
      db
        .table('applications')
        .find((a) => a.student_id === studentId && a.internship_id === internshipId) || null
    );
  },

  createApplication(payload) {
    // Enforce PostgreSQL UNIQUE (student_id, internship_id) constraint
    const duplicate = this.findApplicationByStudentAndInternship(
      payload.student_id,
      payload.internship_id
    );
    if (duplicate) {
      throw new AppError(
        'You have already applied to this internship opportunity.',
        409,
        'DUPLICATE_APPLICATION'
      );
    }

    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      student_id: payload.student_id,
      internship_id: payload.internship_id,
      cv_url: payload.cv_url || '/uploads/student-cv.pdf',
      cover_letter: payload.cover_letter,
      availability_note: payload.availability_note || '',
      match_score: Number(payload.match_score) || 0,
      status: 'Submitted',
      company_notes: '',
      submitted_at: now,
      reviewed_at: null,
      updated_at: now,
    };
    db.table('applications').push(record);
    db.persist();
    return this.hydrateApplication(record);
  },

  updateApplication(id, updates) {
    const app = db.table('applications').find((a) => a.id === id);
    if (!app) throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
    Object.assign(app, updates, { updated_at: new Date().toISOString() });
    db.persist();
    return this.hydrateApplication(app);
  },

  listApplications() {
    return db
      .table('applications')
      .map((a) => this.hydrateApplication(a))
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
  },

  // =========================================================================
  // INTERVIEWS
  // =========================================================================
  hydrateInterview(iv) {
    if (!iv) return null;
    const app = this.findApplicationById(iv.application_id);
    return {
      ...iv,
      student: app?.student || null,
      internship: app?.internship || null,
      application_status: app?.status || '',
    };
  },

  findInterviewById(id) {
    const iv = db.table('interviews').find((i) => i.id === id);
    return this.hydrateInterview(iv);
  },

  listInterviews() {
    return db
      .table('interviews')
      .map((iv) => this.hydrateInterview(iv))
      .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
  },

  createInterview(payload) {
    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      application_id: payload.application_id,
      scheduled_date: payload.scheduled_date,
      start_time: payload.start_time,
      end_time: payload.end_time,
      interview_type: payload.interview_type || 'Online',
      meeting_link: payload.meeting_link || '',
      location: payload.location || '',
      notes: payload.notes || '',
      status: 'Scheduled',
      student_response: 'Pending',
      created_at: now,
      updated_at: now,
    };
    db.table('interviews').push(record);
    db.persist();
    return this.hydrateInterview(record);
  },

  updateInterview(id, updates) {
    const iv = db.table('interviews').find((i) => i.id === id);
    if (!iv) throw new AppError('Interview not found', 404, 'INTERVIEWS_NOT_FOUND');
    Object.assign(iv, updates, { updated_at: new Date().toISOString() });
    db.persist();
    return this.hydrateInterview(iv);
  },

  deleteInterview(id) {
    const table = db.table('interviews');
    const idx = table.findIndex((i) => i.id === id);
    if (idx === -1) throw new AppError('Interview not found', 404, 'INTERVIEW_NOT_FOUND');
    table.splice(idx, 1);
    db.persist();
  },

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================
  createNotification({ user_id, type, title, message, link = '' }) {
    const record = {
      id: db.uuid(),
      user_id,
      type,
      title,
      message,
      link,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    db.table('notifications').unshift(record);
    db.persist();
    return record;
  },

  listUserNotifications(userId) {
    return db
      .table('notifications')
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  markNotificationRead(userId, notificationId) {
    const notif = db
      .table('notifications')
      .find((n) => n.id === notificationId && n.user_id === userId);
    if (!notif) throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    notif.is_read = true;
    db.persist();
    return notif;
  },

  markAllNotificationsRead(userId) {
    const list = db.table('notifications').filter((n) => n.user_id === userId);
    for (const n of list) {
      n.is_read = true;
    }
    db.persist();
    return { updatedCount: list.length };
  },

  // =========================================================================
  // REPORTS & ADMIN ACTIONS
  // =========================================================================
  createReport(payload) {
    const now = new Date().toISOString();
    const record = {
      id: db.uuid(),
      reporter_id: payload.reporter_id,
      target_type: payload.target_type,
      target_id: payload.target_id,
      reason: payload.reason,
      details: payload.details,
      status: 'OPEN',
      resolved_by: null,
      resolution_notes: null,
      created_at: now,
      updated_at: now,
    };
    db.table('reports').unshift(record);
    db.persist();
    return record;
  },

  listReports() {
    return db.table('reports').map((r) => {
      const reporter = this.findUserById(r.reporter_id);
      return {
        ...r,
        reporter_email: reporter?.email || 'Unknown',
      };
    });
  },

  updateReport(id, updates) {
    const rep = db.table('reports').find((r) => r.id === id);
    if (!rep) throw new AppError('Report not found', 404, 'REPORT_NOT_FOUND');
    Object.assign(rep, updates, { updated_at: new Date().toISOString() });
    db.persist();
    return rep;
  },

  logAdminAction({ admin_id, action_type, target_type, target_id, details }) {
    const entry = {
      id: db.uuid(),
      admin_id,
      action_type,
      target_type,
      target_id,
      details,
      created_at: new Date().toISOString(),
    };
    db.table('admin_actions').unshift(entry);
    db.persist();
    return entry;
  },
};
