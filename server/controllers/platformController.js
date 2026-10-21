import { platformService } from '../services/platformService.js';
import { platformRepository } from '../repositories/platformRepository.js';
import { storageService } from '../services/storageService.js';
import { db } from '../config/db.js';
import { AppError, asyncHandler } from '../utils/AppError.js';
import { calculateInternshipMatch } from '../utils/skillMatcher.js';

export const platformController = {
  // =========================================================================
  // AUTH
  // =========================================================================
  register: asyncHandler(async (req, res) => {
    const data = await platformService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data,
    });
  }),

  login: asyncHandler(async (req, res) => {
    const data = await platformService.login(req.body);
    res.json({
      success: true,
      message: 'Signed in successfully.',
      data,
    });
  }),

  logout: asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: 'Signed out successfully.',
    });
  }),

  me: asyncHandler(async (req, res) => {
    const data = platformService.getCurrentSession(req.user);
    res.json({
      success: true,
      data,
    });
  }),

  // =========================================================================
  // PUBLIC CATALOG (ETHIOPIAN UNIVERSITIES, DEPARTMENTS, FIELDS, SKILLS)
  // =========================================================================
  getCatalog: asyncHandler(async (req, res) => {
    const universities = platformRepository.listUniversities();
    const departments = platformRepository.listDepartments();
    const fieldsOfStudy = platformRepository.listFieldsOfStudy();
    const skills = platformRepository.listSkills();
    const locations = [
      'Addis Ababa',
      'Adama',
      'Bahir Dar',
      'Hawassa',
      'Jimma',
      'Mekelle',
      'Gondar',
      'Arba Minch',
      'Dire Dawa',
    ];
    const academicLevels = ['Diploma', 'BSc', 'BA', 'MSc', 'MA', 'PhD', 'Other'];
    const categories = [
      'Cybersecurity',
      'Website Development',
      'UI/UX Design',
      'Data Analysis',
    ];

    res.json({
      success: true,
      data: {
        categories,
        universities,
        departments,
        fieldsOfStudy,
        skills,
        locations,
        academicLevels,
      },
    });
  }),

  // =========================================================================
  // STUDENT PROFILE, PORTFOLIO & SAVED
  // =========================================================================
  getStudentProfile: asyncHandler(async (req, res) => {
    const profile = platformRepository.findStudentByUserId(req.user.id);
    if (!profile) {
      throw new AppError('Student profile not found', 404, 'STUDENT_NOT_FOUND');
    }
    res.json({
      success: true,
      data: profile,
    });
  }),

  updateStudentProfile: asyncHandler(async (req, res) => {
    const current = platformRepository.findStudentByUserId(req.user.id);
    if (!current) {
      throw new AppError('Student profile not found', 404, 'STUDENT_NOT_FOUND');
    }
    if (req.body.user_id && req.body.user_id !== req.user.id) {
      throw new AppError('Cannot modify another student profile', 403, 'FORBIDDEN');
    }
    const updated = platformRepository.updateStudentProfile(current.id, req.body);
    res.json({
      success: true,
      message: 'Student profile updated.',
      data: updated,
    });
  }),

  addEducation: asyncHandler(async (req, res) => {
    const current = platformRepository.findStudentByUserId(req.user.id);
    const record = platformRepository.addStudentEducation(current.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Education record added.',
      data: record,
    });
  }),

  deleteEducation: asyncHandler(async (req, res) => {
    const current = platformRepository.findStudentByUserId(req.user.id);
    platformRepository.deleteStudentEducation(current.id, req.params.id);
    res.json({
      success: true,
      message: 'Education record removed.',
    });
  }),

  addProject: asyncHandler(async (req, res) => {
    const current = platformRepository.findStudentByUserId(req.user.id);
    const record = platformRepository.addStudentProject(current.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Project added to portfolio.',
      data: record,
    });
  }),

  deleteProject: asyncHandler(async (req, res) => {
    const current = platformRepository.findStudentByUserId(req.user.id);
    platformRepository.deleteStudentProject(current.id, req.params.id);
    res.json({
      success: true,
      message: 'Project removed.',
    });
  }),

  addCertification: asyncHandler(async (req, res) => {
    const current = platformRepository.findStudentByUserId(req.user.id);
    const record = platformRepository.addStudentCertification(current.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Certification added.',
      data: record,
    });
  }),

  deleteCertification: asyncHandler(async (req, res) => {
    const current = platformRepository.findStudentByUserId(req.user.id);
    platformRepository.deleteStudentCertification(current.id, req.params.id);
    res.json({
      success: true,
      message: 'Certification removed.',
    });
  }),

  getSavedInternships: asyncHandler(async (req, res) => {
    const student = platformRepository.findStudentByUserId(req.user.id);
    const saved = platformRepository.listSavedInternships(student.id).map((item) => {
      const match = calculateInternshipMatch(student, item);
      return {
        ...item,
        match,
        match_score: match.score,
        is_saved: true,
      };
    });
    res.json({
      success: true,
      data: saved,
    });
  }),

  toggleSaveInternship: asyncHandler(async (req, res) => {
    const student = platformRepository.findStudentByUserId(req.user.id);
    const result = platformRepository.toggleSaveInternship(
      student.id,
      req.params.internshipId
    );
    res.json({
      success: true,
      message: result.saved
        ? 'Internship saved to your shortlist.'
        : 'Internship removed from saved list.',
      data: result,
    });
  }),

  getStudentRecommendations: asyncHandler(async (req, res) => {
    const result = platformService.searchInternships(
      { status: 'Published', sort: 'relevant', limit: 20 },
      req.user
    );
    res.json({
      success: true,
      data: result.items,
    });
  }),

  getPublicStudentPortfolio: asyncHandler(async (req, res) => {
    const data = platformService.getPublicStudentPortfolio(req.params.id, req.user);
    res.json({
      success: true,
      data,
    });
  }),

  // =========================================================================
  // INTERNSHIPS
  // =========================================================================
  listInternships: asyncHandler(async (req, res) => {
    const result = platformService.searchInternships(req.query, req.user);
    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }),

  getInternshipById: asyncHandler(async (req, res) => {
    const data = platformService.getInternshipDetails(req.params.id, req.user);
    res.json({
      success: true,
      data,
    });
  }),

  createInternship: asyncHandler(async (req, res) => {
    const company = platformRepository.findCompanyByUserId(req.user.id);
    if (!company) {
      throw new AppError('Company profile not found', 404, 'COMPANY_NOT_FOUND');
    }
    if (company.verification_status === 'SUSPENDED') {
      throw new AppError(
        'Your company is suspended and cannot publish internships.',
        403,
        'COMPANY_SUSPENDED'
      );
    }
    const created = platformRepository.createInternship({
      ...req.body,
      company_id: company.id,
    });
    res.status(201).json({
      success: true,
      message: 'Internship opportunity created.',
      data: created,
    });
  }),

  updateInternship: asyncHandler(async (req, res) => {
    const existing = platformRepository.findInternshipById(req.params.id);
    if (!existing) {
      throw new AppError('Internship not found', 404, 'INTERNSHIP_NOT_FOUND');
    }
    if (req.user.role === 'COMPANY') {
      const company = platformRepository.findCompanyByUserId(req.user.id);
      if (!company || existing.company_id !== company.id) {
        throw new AppError(
          'You cannot modify another company’s internship posting.',
          403,
          'FORBIDDEN_COMPANY_OWNERSHIP'
        );
      }
    }
    const updated = platformRepository.updateInternship(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Internship updated successfully.',
      data: updated,
    });
  }),

  deleteInternship: asyncHandler(async (req, res) => {
    const existing = platformRepository.findInternshipById(req.params.id);
    if (!existing) {
      throw new AppError('Internship not found', 404, 'INTERNSHIP_NOT_FOUND');
    }
    if (req.user.role === 'COMPANY') {
      const company = platformRepository.findCompanyByUserId(req.user.id);
      if (!company || existing.company_id !== company.id) {
        throw new AppError(
          'You cannot delete another company’s internship posting.',
          403,
          'FORBIDDEN_COMPANY_OWNERSHIP'
        );
      }
    }
    platformRepository.deleteInternship(req.params.id);
    res.json({
      success: true,
      message: 'Internship deleted.',
    });
  }),

  // =========================================================================
  // APPLICATIONS
  // =========================================================================
  applyToInternship: asyncHandler(async (req, res) => {
    const data = platformService.applyForInternship(req.user, req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data,
    });
  }),

  listApplications: asyncHandler(async (req, res) => {
    const result = platformService.listApplicationsForUser(req.user, req.query);
    res.json({
      success: true,
      data: result.items,
      counts: result.counts,
    });
  }),

  getApplicationById: asyncHandler(async (req, res) => {
    const app = platformRepository.findApplicationById(req.params.id);
    if (!app) {
      throw new AppError('Application not found', 404, 'APPLICATION_NOT_FOUND');
    }
    if (req.user.role === 'STUDENT') {
      const student = platformRepository.findStudentByUserId(req.user.id);
      if (!student || app.student_id !== student.id) {
        throw new AppError('Forbidden access to application', 403, 'FORBIDDEN');
      }
    } else if (req.user.role === 'COMPANY') {
      const company = platformRepository.findCompanyByUserId(req.user.id);
      if (!company || app.internship?.company_id !== company.id) {
        throw new AppError('Forbidden access to application', 403, 'FORBIDDEN');
      }
    }
    res.json({
      success: true,
      data: app,
    });
  }),

  updateApplicationStatus: asyncHandler(async (req, res) => {
    const updated = platformService.updateApplicationStatus(
      req.user,
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      message: `Application status updated to ${updated.status}.`,
      data: updated,
    });
  }),

  // =========================================================================
  // COMPANIES & STUDENT DISCOVERY
  // =========================================================================
  listCompanies: asyncHandler(async (req, res) => {
    let companies = platformRepository.listCompanies();
    if (req.query.search) {
      const q = req.query.search.toLowerCase().trim();
      companies = companies.filter(
        (c) =>
          c.company_name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }
    if (req.query.verified_only === 'true') {
      companies = companies.filter((c) => c.verification_status === 'APPROVED');
    }
    res.json({
      success: true,
      data: companies,
    });
  }),

  getCompanyById: asyncHandler(async (req, res) => {
    const company = platformRepository.findCompanyById(req.params.id);
    if (!company) {
      throw new AppError('Company not found', 404, 'COMPANY_NOT_FOUND');
    }
    const internships = platformRepository
      .listInternships()
      .filter((i) => i.company_id === company.id && i.status === 'Published');
    res.json({
      success: true,
      data: {
        ...company,
        internships,
      },
    });
  }),

  getMyCompanyProfile: asyncHandler(async (req, res) => {
    const company = platformRepository.findCompanyByUserId(req.user.id);
    if (!company) {
      throw new AppError('Company profile not found', 404, 'COMPANY_NOT_FOUND');
    }
    const verifications = platformRepository
      .listVerificationRequests()
      .filter((v) => v.company_id === company.id);
    res.json({
      success: true,
      data: {
        ...company,
        verifications,
      },
    });
  }),

  updateMyCompanyProfile: asyncHandler(async (req, res) => {
    const company = platformRepository.findCompanyByUserId(req.user.id);
    if (!company) {
      throw new AppError('Company profile not found', 404, 'COMPANY_NOT_FOUND');
    }
    const updated = platformRepository.updateCompanyProfile(company.id, req.body);
    res.json({
      success: true,
      message: 'Company profile updated.',
      data: updated,
    });
  }),

  submitCompanyVerification: asyncHandler(async (req, res) => {
    const company = platformRepository.findCompanyByUserId(req.user.id);
    if (!company) {
      throw new AppError('Company profile not found', 404, 'COMPANY_NOT_FOUND');
    }
    if (!req.body.tin_number) {
      throw new AppError('Ethiopian TIN number is required for verification', 400, 'TIN_REQUIRED');
    }
    const record = platformRepository.createVerificationRequest({
      company_id: company.id,
      submitted_by: req.user.id,
      tin_number: req.body.tin_number,
      registration_number: req.body.registration_number,
      document_url: req.body.document_url,
      notes: req.body.notes,
    });
    res.status(201).json({
      success: true,
      message: 'Verification request submitted for administrator review.',
      data: record,
    });
  }),

  discoverStudents: asyncHandler(async (req, res) => {
    const result = platformService.discoverStudents(req.query, req.user);
    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }),

  // =========================================================================
  // INTERVIEWS
  // =========================================================================
  listInterviews: asyncHandler(async (req, res) => {
    let interviews = platformRepository.listInterviews();
    if (req.user.role === 'STUDENT') {
      const student = platformRepository.findStudentByUserId(req.user.id);
      interviews = interviews.filter((iv) => iv.student?.id === student?.id);
    } else if (req.user.role === 'COMPANY') {
      const company = platformRepository.findCompanyByUserId(req.user.id);
      interviews = interviews.filter((iv) => iv.internship?.company_id === company?.id);
    }
    res.json({
      success: true,
      data: interviews,
    });
  }),

  createInterview: asyncHandler(async (req, res) => {
    const created = platformService.scheduleInterview(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Interview scheduled and student notified.',
      data: created,
    });
  }),

  updateInterview: asyncHandler(async (req, res) => {
    const updated = platformService.updateInterview(req.user, req.params.id, req.body);
    res.json({
      success: true,
      message: 'Interview updated.',
      data: updated,
    });
  }),

  deleteInterview: asyncHandler(async (req, res) => {
    const existing = platformRepository.findInterviewById(req.params.id);
    if (!existing) {
      throw new AppError('Interview not found', 404, 'INTERVIEW_NOT_FOUND');
    }
    if (req.user.role === 'COMPANY') {
      const company = platformRepository.findCompanyByUserId(req.user.id);
      if (!company || existing.internship?.company_id !== company.id) {
        throw new AppError('Forbidden', 403, 'FORBIDDEN');
      }
    }
    platformRepository.deleteInterview(req.params.id);
    res.json({
      success: true,
      message: 'Interview cancelled and removed.',
    });
  }),

  // =========================================================================
  // NOTIFICATIONS
  // =========================================================================
  listNotifications: asyncHandler(async (req, res) => {
    let items = platformRepository.listUserNotifications(req.user.id);
    if (req.query.filter === 'unread') {
      items = items.filter((n) => !n.is_read);
    } else if (req.query.filter === 'read') {
      items = items.filter((n) => n.is_read);
    }
    const unreadCount = platformRepository
      .listUserNotifications(req.user.id)
      .filter((n) => !n.is_read).length;

    res.json({
      success: true,
      data: items,
      unreadCount,
    });
  }),

  markNotificationRead: asyncHandler(async (req, res) => {
    const updated = platformRepository.markNotificationRead(req.user.id, req.params.id);
    res.json({
      success: true,
      data: updated,
    });
  }),

  markAllNotificationsRead: asyncHandler(async (req, res) => {
    const result = platformRepository.markAllNotificationsRead(req.user.id);
    res.json({
      success: true,
      message: 'All notifications marked as read.',
      data: result,
    });
  }),

  // =========================================================================
  // FILE UPLOADS
  // =========================================================================
  uploadFile: asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('Please select a file to upload.', 400, 'FILE_REQUIRED');
    }
    const category = req.body.category || 'documents';
    const stored = await storageService.storeFile(req.file, category);

    if (category === 'cv' && req.user.role === 'STUDENT') {
      const student = platformRepository.findStudentByUserId(req.user.id);
      if (student) {
        platformRepository.updateStudentProfile(student.id, { cv_url: stored.url });
      }
    }

    res.status(201).json({
      success: true,
      message: 'File uploaded and validated.',
      data: stored,
    });
  }),

  // =========================================================================
  // REPORTS
  // =========================================================================
  createReport: asyncHandler(async (req, res) => {
    if (!req.body.target_type || !req.body.target_id || !req.body.reason) {
      throw new AppError('Target and reason are required to submit a report.', 400, 'INVALID_REPORT');
    }
    const report = platformRepository.createReport({
      reporter_id: req.user.id,
      target_type: req.body.target_type,
      target_id: req.body.target_id,
      reason: req.body.reason,
      details: req.body.details || req.body.reason,
    });
    res.status(201).json({
      success: true,
      message: 'Report submitted to platform trust & safety administrators.',
      data: report,
    });
  }),

  // =========================================================================
  // ADMIN ENDPOINTS
  // =========================================================================
  getAdminAnalytics: asyncHandler(async (req, res) => {
    const data = platformService.getAdminAnalytics();
    res.json({
      success: true,
      data,
    });
  }),

  adminListStudents: asyncHandler(async (req, res) => {
    const data = platformRepository.listAllStudents();
    res.json({
      success: true,
      data,
    });
  }),

  adminUpdateUserStatus: asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      throw new AppError('Status must be ACTIVE or SUSPENDED', 400, 'INVALID_STATUS');
    }
    const updated = platformRepository.updateUser(req.params.id, { status });
    if (!updated) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    platformRepository.logAdminAction({
      admin_id: req.user.id,
      action_type: `USER_${status}`,
      target_type: 'USER',
      target_id: updated.id,
      details: `Updated account status of ${updated.email} to ${status}`,
    });
    res.json({
      success: true,
      message: `User account status updated to ${status}.`,
      data: updated,
    });
  }),

  adminListCompanies: asyncHandler(async (req, res) => {
    const data = platformRepository.listCompanies();
    res.json({
      success: true,
      data,
    });
  }),

  adminListVerifications: asyncHandler(async (req, res) => {
    const data = platformRepository.listVerificationRequests();
    res.json({
      success: true,
      data,
    });
  }),

  adminReviewCompanyVerification: asyncHandler(async (req, res) => {
    const data = platformService.reviewCompanyVerification(
      req.user,
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      message: `Company verification updated to ${data.verification_status}.`,
      data,
    });
  }),

  adminListInternships: asyncHandler(async (req, res) => {
    const data = platformRepository.listInternships();
    res.json({
      success: true,
      data,
    });
  }),

  adminUpdateInternshipStatus: asyncHandler(async (req, res) => {
    const { status } = req.body;
    const updated = platformRepository.updateInternship(req.params.id, { status });
    platformRepository.logAdminAction({
      admin_id: req.user.id,
      action_type: `INTERNSHIP_${status.toUpperCase()}`,
      target_type: 'INTERNSHIP',
      target_id: updated.id,
      details: `Changed status of "${updated.title}" (${updated.company_name}) to ${status}`,
    });
    res.json({
      success: true,
      message: `Internship status updated to ${status}.`,
      data: updated,
    });
  }),

  adminListUniversities: asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: platformRepository.listUniversities({ includeInactive: true }),
    });
  }),

  adminCreateUniversity: asyncHandler(async (req, res) => {
    if (!req.body.name) {
      throw new AppError('University name is required', 400, 'NAME_REQUIRED');
    }
    const created = platformRepository.createUniversity(req.body);
    platformRepository.logAdminAction({
      admin_id: req.user.id,
      action_type: 'CREATE_UNIVERSITY',
      target_type: 'UNIVERSITY',
      target_id: created.id,
      details: `Added university: ${created.name} (${created.city})`,
    });
    res.status(201).json({
      success: true,
      message: 'University added.',
      data: created,
    });
  }),

  adminUpdateUniversity: asyncHandler(async (req, res) => {
    const updated = platformRepository.updateUniversity(req.params.id, req.body);
    res.json({
      success: true,
      message: 'University updated.',
      data: updated,
    });
  }),

  adminListDepartments: asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: platformRepository.listDepartments({ includeInactive: true }),
    });
  }),

  adminCreateDepartment: asyncHandler(async (req, res) => {
    if (!req.body.name) {
      throw new AppError('Department name is required', 400, 'NAME_REQUIRED');
    }
    const created = platformRepository.createDepartment(req.body);
    platformRepository.logAdminAction({
      admin_id: req.user.id,
      action_type: 'CREATE_DEPARTMENT',
      target_type: 'DEPARTMENT',
      target_id: created.id,
      details: `Added department: ${created.name}`,
    });
    res.status(201).json({
      success: true,
      message: 'Department added.',
      data: created,
    });
  }),

  adminUpdateDepartment: asyncHandler(async (req, res) => {
    const updated = platformRepository.updateDepartment(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Department updated.',
      data: updated,
    });
  }),

  adminListSkills: asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: platformRepository.listSkills({ includeInactive: true }),
    });
  }),

  adminCreateSkill: asyncHandler(async (req, res) => {
    if (!req.body.name) {
      throw new AppError('Skill name is required', 400, 'NAME_REQUIRED');
    }
    const created = platformRepository.findOrCreateSkillByName(
      req.body.name,
      req.body.category || 'Technical'
    );
    res.status(201).json({
      success: true,
      message: 'Skill added to platform catalog.',
      data: created,
    });
  }),

  adminUpdateSkill: asyncHandler(async (req, res) => {
    const updated = platformRepository.updateSkill(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Skill updated.',
      data: updated,
    });
  }),

  adminListReports: asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: platformRepository.listReports(),
    });
  }),

  adminUpdateReport: asyncHandler(async (req, res) => {
    const updated = platformRepository.updateReport(req.params.id, {
      status: req.body.status || 'RESOLVED',
      resolution_notes: req.body.resolution_notes || 'Reviewed by administrator.',
      resolved_by: req.user.id,
    });
    res.json({
      success: true,
      message: 'Report updated.',
      data: updated,
    });
  }),

  // =========================================================================
  // SYSTEM HEALTH & DATABASE CONNECTION STATUS
  // =========================================================================
  healthCheck: asyncHandler(async (req, res) => {
    const dbTest = await db.testConnection();
    res.json({
      status: 'ok',
      service: 'EthioIntern Platform API',
      timestamp: new Date().toISOString(),
      database: dbTest,
    });
  }),

  getDbStatus: asyncHandler(async (req, res) => {
    const dbTest = await db.testConnection();
    res.json({
      success: true,
      data: dbTest,
    });
  }),

  // =========================================================================
  // USER SECURITY & SESSIONS
  // =========================================================================
  getSecurityOverview: asyncHandler(async (req, res) => {
    const data = platformService.getUserSecurityOverview(req.user.id, req);
    res.json({
      success: true,
      data,
    });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const result = await platformService.changePassword(req.user.id, {
      currentPassword: req.body.current_password,
      newPassword: req.body.new_password,
    });
    res.json({
      success: true,
      message: result.message,
    });
  }),

  generate2FASetup: asyncHandler(async (req, res) => {
    const data = platformService.generate2FASetup(req.user.id);
    res.json({
      success: true,
      data,
    });
  }),

  verify2FA: asyncHandler(async (req, res) => {
    const result = platformService.verifyAndEnable2FA(req.user.id, {
      token: req.body.token,
      secret: req.body.secret,
      recoveryCodes: req.body.recovery_codes,
    });
    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  }),

  disable2FA: asyncHandler(async (req, res) => {
    const result = await platformService.disable2FA(req.user.id, {
      password: req.body.password,
    });
    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  }),

  revokeOtherSessions: asyncHandler(async (req, res) => {
    const result = platformService.revokeOtherSessions(req.user.id);
    res.json({
      success: true,
      message: result.message,
    });
  }),

  simulateSecurityScan: asyncHandler(async (req, res) => {
    const data = platformService.simulateVulnerabilityAudit({
      targetUrl: req.body.target_url,
      scanType: req.body.scan_type,
    });
    res.json({
      success: true,
      data,
    });
  }),
};
