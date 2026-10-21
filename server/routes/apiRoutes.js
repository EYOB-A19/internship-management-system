import express from 'express';
import { platformController } from '../controllers/platformController.js';
import {
  authenticate,
  optionalAuthenticate,
  authorizeRoles,
} from '../middleware/authMiddleware.js';
import { uploadMemory } from '../middleware/uploadMiddleware.js';
import {
  registerValidation,
  loginValidation,
  internshipValidation,
  applicationValidation,
  interviewValidation,
} from '../validators/requestValidators.js';

const router = express.Router();

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================
router.post('/auth/register', registerValidation, platformController.register);
router.post('/auth/login', loginValidation, platformController.login);
router.post('/auth/logout', platformController.logout);
router.get('/auth/me', authenticate, platformController.me);

// ============================================================================
// CONFIGURABLE ETHIOPIAN CATALOG (UNIVERSITIES, DEPARTMENTS, SKILLS)
// ============================================================================
router.get('/catalog', platformController.getCatalog);

// ============================================================================
// STUDENT ROUTES
// ============================================================================
router.get(
  '/students/profile',
  authenticate,
  authorizeRoles('STUDENT'),
  platformController.getStudentProfile
);
router.put(
  '/students/profile',
  authenticate,
  authorizeRoles('STUDENT'),
  platformController.updateStudentProfile
);
router.post(
  '/students/profile/education',
  authenticate,
  authorizeRoles('STUDENT'),
  platformController.addEducation
);
router.delete(
  '/students/profile/education/:id',
  authenticate,
  authorizeRoles('STUDENT'),
  platformController.deleteEducation
);
router.post(
  '/students/profile/projects',
  authenticate,
  authorizeRoles('STUDENT'),
  platformController.addProject
);
router.delete(
  '/students/profile/projects/:id',
  authenticate,
  authorizeRoles('STUDENT'),
  platformController.deleteProject
);
router.post(
  '/students/profile/certifications',
  authenticate,
  authorizeRoles('STUDENT'),
  platformController.addCertification
);
router.delete(
  '/students/profile/certifications/:id',
  authenticate,
  authorizeRoles('STUDENT'),
  platformController.deleteCertification
);
router.get(
  '/students/saved',
  authenticate,
  authorizeRoles('STUDENT'),
  platformController.getSavedInternships
);
router.post(
  '/students/saved/:internshipId',
  authenticate,
  authorizeRoles('STUDENT'),
  platformController.toggleSaveInternship
);
router.get(
  '/students/recommendations',
  authenticate,
  authorizeRoles('STUDENT'),
  platformController.getStudentRecommendations
);
router.get('/students/:id', optionalAuthenticate, platformController.getPublicStudentPortfolio);

// ============================================================================
// INTERNSHIP ROUTES
// ============================================================================
router.get('/internships', optionalAuthenticate, platformController.listInternships);
router.get('/internships/:id', optionalAuthenticate, platformController.getInternshipById);
router.post(
  '/internships',
  authenticate,
  authorizeRoles('COMPANY', 'ADMIN'),
  internshipValidation,
  platformController.createInternship
);
router.put(
  '/internships/:id',
  authenticate,
  authorizeRoles('COMPANY', 'ADMIN'),
  platformController.updateInternship
);
router.delete(
  '/internships/:id',
  authenticate,
  authorizeRoles('COMPANY', 'ADMIN'),
  platformController.deleteInternship
);
router.post(
  '/internships/:id/apply',
  authenticate,
  authorizeRoles('STUDENT'),
  applicationValidation,
  platformController.applyToInternship
);

// ============================================================================
// APPLICATION ROUTES
// ============================================================================
router.get('/applications', authenticate, platformController.listApplications);
router.get('/applications/:id', authenticate, platformController.getApplicationById);
router.put('/applications/:id/status', authenticate, platformController.updateApplicationStatus);

// ============================================================================
// COMPANY & STUDENT DISCOVERY ROUTES
// ============================================================================
router.get('/companies', platformController.listCompanies);
router.get(
  '/companies/profile/me',
  authenticate,
  authorizeRoles('COMPANY'),
  platformController.getMyCompanyProfile
);
router.put(
  '/companies/profile/me',
  authenticate,
  authorizeRoles('COMPANY'),
  platformController.updateMyCompanyProfile
);
router.get(
  '/companies/students',
  authenticate,
  authorizeRoles('COMPANY', 'ADMIN'),
  platformController.discoverStudents
);
router.post(
  '/companies/verify',
  authenticate,
  authorizeRoles('COMPANY'),
  platformController.submitCompanyVerification
);
router.get('/companies/:id', platformController.getCompanyById);

// ============================================================================
// INTERVIEW ROUTES
// ============================================================================
router.get('/interviews', authenticate, platformController.listInterviews);
router.post(
  '/interviews',
  authenticate,
  authorizeRoles('COMPANY', 'ADMIN'),
  interviewValidation,
  platformController.createInterview
);
router.put('/interviews/:id', authenticate, platformController.updateInterview);
router.delete(
  '/interviews/:id',
  authenticate,
  authorizeRoles('COMPANY', 'ADMIN'),
  platformController.deleteInterview
);

// ============================================================================
// NOTIFICATION ROUTES
// ============================================================================
router.get('/notifications', authenticate, platformController.listNotifications);
router.put('/notifications/read-all', authenticate, platformController.markAllNotificationsRead);
router.put('/notifications/:id/read', authenticate, platformController.markNotificationRead);

// ============================================================================
// FILE UPLOAD & REPORT ROUTES
// ============================================================================
router.post(
  '/uploads',
  authenticate,
  uploadMemory.single('file'),
  platformController.uploadFile
);
router.post('/reports', authenticate, platformController.createReport);

// ============================================================================
// ADMIN ROUTES
// ============================================================================
router.get(
  '/admin/analytics',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.getAdminAnalytics
);
router.get(
  '/admin/students',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminListStudents
);
router.put(
  '/admin/users/:id/status',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminUpdateUserStatus
);
router.get(
  '/admin/companies',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminListCompanies
);
router.get(
  '/admin/verifications',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminListVerifications
);
router.put(
  '/admin/companies/:id/verify',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminReviewCompanyVerification
);
router.get(
  '/admin/internships',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminListInternships
);
router.put(
  '/admin/internships/:id/status',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminUpdateInternshipStatus
);
router.get(
  '/admin/universities',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminListUniversities
);
router.post(
  '/admin/universities',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminCreateUniversity
);
router.put(
  '/admin/universities/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminUpdateUniversity
);
router.get(
  '/admin/departments',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminListDepartments
);
router.post(
  '/admin/departments',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminCreateDepartment
);
router.put(
  '/admin/departments/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminUpdateDepartment
);
router.get(
  '/admin/skills',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminListSkills
);
router.post(
  '/admin/skills',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminCreateSkill
);
router.put(
  '/admin/skills/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminUpdateSkill
);
router.get(
  '/admin/reports',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminListReports
);
router.put(
  '/admin/reports/:id',
  authenticate,
  authorizeRoles('ADMIN'),
  platformController.adminUpdateReport
);

// ============================================================================
// SECURITY, 2FA & SESSIONS
// ============================================================================
router.get('/security/overview', authenticate, platformController.getSecurityOverview);
router.post('/security/change-password', authenticate, platformController.changePassword);
router.post('/security/2fa/generate', authenticate, platformController.generate2FASetup);
router.post('/security/2fa/verify', authenticate, platformController.verify2FA);
router.post('/security/2fa/disable', authenticate, platformController.disable2FA);
router.post('/security/sessions/revoke-others', authenticate, platformController.revokeOtherSessions);
router.post('/security/simulate-scan', optionalAuthenticate, platformController.simulateSecurityScan);

// ============================================================================
// SYSTEM HEALTH & DATABASE DIAGNOSTIC ROUTES
// ============================================================================
router.get('/health', platformController.healthCheck);
router.get('/system/db-status', platformController.getDbStatus);

export default router;
