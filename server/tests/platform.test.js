import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../app.js';
import { db } from '../config/db.js';

let server;
let baseUrl;

async function apiRequest(path, { method = 'GET', token = null, body = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  return { status: res.status, body: data };
}

test.before(async () => {
  process.env.NODE_ENV = 'test';
  db.resetToSeed();
  const app = createApp();
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

test.after(async () => {
  db.resetToSeed();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('1. Authentication: Register, Login, Invalid Password, Unauthorized Access', async () => {
  // Register a new student
  const regRes = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: {
      email: 'abebe.bikila@aau.edu.et',
      password: 'Password123!',
      role: 'STUDENT',
      first_name: 'Abebe',
      father_name: 'Bikila',
      university_id: 'uni-aau-002',
      department_id: 'dept-cse-001',
      academic_level: 'BSc',
      location: 'Addis Ababa',
      skills: ['React', 'JavaScript', 'Node.js'],
    },
  });
  assert.equal(regRes.status, 201);
  assert.equal(regRes.body.success, true);
  assert.ok(regRes.body.data.token);
  assert.equal(regRes.body.data.user.role, 'STUDENT');

  // Login with valid credentials
  const loginRes = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'eyob.aragie@astu.edu.et',
      password: 'Password123!',
    },
  });
  assert.equal(loginRes.status, 200);
  assert.equal(loginRes.body.success, true);
  assert.ok(loginRes.body.data.token);

  // Invalid password
  const badLogin = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'eyob.aragie@astu.edu.et',
      password: 'WrongPassword999!',
    },
  });
  assert.equal(badLogin.status, 401);
  assert.equal(badLogin.body.success, false);
  assert.equal(badLogin.body.errorCode, 'INVALID_CREDENTIALS');

  // Unauthorized access
  const unauthRes = await apiRequest('/api/students/profile');
  assert.equal(unauthRes.status, 401);
  assert.equal(unauthRes.body.errorCode, 'UNAUTHORIZED');
});

test('2. Internship: Create, Edit, Search, Filter, and Close Internship', async () => {
  const companyLogin = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'careers@chapa.co', password: 'Password123!' },
  });
  const companyToken = companyLogin.body.data.token;

  // Create internship
  const createRes = await apiRequest('/api/internships', {
    method: 'POST',
    token: companyToken,
    body: {
      title: 'Backend Payment Settlement API Intern',
      description: 'Develop high-throughput PostgreSQL settlement services and Node.js webhooks in Addis Ababa.',
      department_team: 'Settlement Engineering',
      location: 'Addis Ababa',
      work_mode: 'Hybrid',
      duration: '4 Months',
      application_deadline: '2026-11-25',
      stipend_amount: 8500,
      required_skills: ['Node.js', 'PostgreSQL', 'JavaScript'],
      preferred_skills: ['Docker'],
      academic_levels: ['BSc'],
      fields_of_study: ['Computer Science'],
    },
  });
  assert.equal(createRes.status, 201);
  const internshipId = createRes.body.data.id;

  // Edit internship
  const editRes = await apiRequest(`/api/internships/${internshipId}`, {
    method: 'PUT',
    token: companyToken,
    body: {
      stipend_amount: 9500,
      positions: 3,
    },
  });
  assert.equal(editRes.status, 200);
  assert.equal(editRes.body.data.stipend_amount, 9500);

  // Search & filter internship
  const searchRes = await apiRequest(
    '/api/internships?keyword=Settlement&location=Addis%20Ababa&work_mode=Hybrid'
  );
  assert.equal(searchRes.status, 200);
  assert.ok(searchRes.body.data.some((i) => i.id === internshipId));

  // Close internship
  const closeRes = await apiRequest(`/api/internships/${internshipId}`, {
    method: 'PUT',
    token: companyToken,
    body: { status: 'Closed' },
  });
  assert.equal(closeRes.status, 200);
  assert.equal(closeRes.body.data.status, 'Closed');
});

test('3. Applications: Apply, Prevent Duplicate, Change Status, and Withdraw', async () => {
  const studentLogin = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'eyob.aragie@astu.edu.et', password: 'Password123!' },
  });
  const studentToken = studentLogin.body.data.token;

  const companyLogin = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'internships@kifiya.com', password: 'Password123!' },
  });
  const kifiyaToken = companyLogin.body.data.token;

  // Apply to Kifiya internship
  const applyRes = await apiRequest('/api/internships/int-data-fintech-007/apply', {
    method: 'POST',
    token: studentToken,
    body: {
      cover_letter: 'I am applying with strong PostgreSQL, SQL, and full-stack data engineering experience from ASTU.',
    },
  });
  assert.equal(applyRes.status, 201);
  const appId = applyRes.body.data.id;

  // Prevent duplicate application
  const dupRes = await apiRequest('/api/internships/int-data-fintech-007/apply', {
    method: 'POST',
    token: studentToken,
    body: {
      cover_letter: 'Second duplicate application attempt to the same internship.',
    },
  });
  assert.equal(dupRes.status, 409);
  assert.equal(dupRes.body.errorCode, 'DUPLICATE_APPLICATION');

  // Company changes application status to Shortlisted
  const statusRes = await apiRequest(`/api/applications/${appId}/status`, {
    method: 'PUT',
    token: kifiyaToken,
    body: {
      status: 'Shortlisted',
      company_notes: 'Great PostgreSQL background.',
    },
  });
  assert.equal(statusRes.status, 200);
  assert.equal(statusRes.body.data.status, 'Shortlisted');

  // Student withdraws application
  const withdrawRes = await apiRequest(`/api/applications/${appId}/status`, {
    method: 'PUT',
    token: studentToken,
    body: { status: 'Withdrawn' },
  });
  assert.equal(withdrawRes.status, 200);
  assert.equal(withdrawRes.body.data.status, 'Withdrawn');
});

test('4. Authorization: Role Isolation & Resource Ownership Enforcement', async () => {
  const studentLogin = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'eyob.aragie@astu.edu.et', password: 'Password123!' },
  });
  const studentToken = studentLogin.body.data.token;

  const gebeyaLogin = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'talent@gebeya.com', password: 'Password123!' },
  });
  const gebeyaToken = gebeyaLogin.body.data.token;

  const adminLogin = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@ethiointern.et', password: 'Password123!' },
  });
  const adminToken = adminLogin.body.data.token;

  // 1) Student cannot access admin routes
  const studentAdminAttempt = await apiRequest('/api/admin/analytics', {
    token: studentToken,
  });
  assert.equal(studentAdminAttempt.status, 403);
  assert.equal(studentAdminAttempt.body.errorCode, 'FORBIDDEN_ROLE');

  // 2) Company cannot modify another company's internship (Gebeya trying to edit Chapa's internship)
  const crossCompanyEdit = await apiRequest('/api/internships/int-web-fullstack-003', {
    method: 'PUT',
    token: gebeyaToken,
    body: { title: 'Unauthorized Title Hijack' },
  });
  assert.equal(crossCompanyEdit.status, 403);
  assert.equal(crossCompanyEdit.body.errorCode, 'FORBIDDEN_COMPANY_OWNERSHIP');

  // 3) Student cannot modify another student's profile
  const crossStudentEdit = await apiRequest('/api/students/profile', {
    method: 'PUT',
    token: studentToken,
    body: {
      user_id: 'usr-student-selam',
      first_name: 'Hijacked',
    },
  });
  assert.equal(crossStudentEdit.status, 403);

  // 4) Admin can manage authorized resources (approve pending company verification & view analytics)
  const adminAnalytics = await apiRequest('/api/admin/analytics', {
    token: adminToken,
  });
  assert.equal(adminAnalytics.status, 200);
  assert.ok(adminAnalytics.body.data.kpis.totalStudents >= 2);

  const verifyRes = await apiRequest('/api/admin/companies/comp-bluenile-005/verify', {
    method: 'PUT',
    token: adminToken,
    body: {
      status: 'APPROVED',
      verification_notes: 'Verified commercial license in automated test.',
    },
  });
  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.body.data.verification_status, 'APPROVED');
});

test('5. Security: Two-Factor Auth, Session Overview, Password Complexity, and DB Health', async () => {
  const loginRes = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'eyob.aragie@astu.edu.et', password: 'Password123!' },
  });
  const token = loginRes.body.data.token;

  // 1) Test health endpoint
  const healthRes = await apiRequest('/api/health');
  assert.equal(healthRes.status, 200);
  assert.equal(healthRes.body.status, 'ok');
  assert.ok(healthRes.body.database);

  // 2) Test security overview endpoint
  const secRes = await apiRequest('/api/security/overview', { token });
  assert.equal(secRes.status, 200);
  assert.ok(Array.isArray(secRes.body.data.sessions));
  assert.ok(Array.isArray(secRes.body.data.security_logs));

  // 3) Test 2FA generation and verification
  const gen2fa = await apiRequest('/api/security/2fa/generate', {
    method: 'POST',
    token,
  });
  assert.equal(gen2fa.status, 200);
  assert.ok(gen2fa.body.data.secret);
  assert.ok(Array.isArray(gen2fa.body.data.recoveryCodes));

  const verify2fa = await apiRequest('/api/security/2fa/verify', {
    method: 'POST',
    token,
    body: {
      token: '123456',
      secret: gen2fa.body.data.secret,
      recovery_codes: gen2fa.body.data.recoveryCodes,
    },
  });
  assert.equal(verify2fa.status, 200);
  assert.equal(verify2fa.body.data.two_factor_enabled, true);

  // 4) Test password complexity validation
  const weakPwdRes = await apiRequest('/api/security/change-password', {
    method: 'POST',
    token,
    body: {
      current_password: 'Password123!',
      new_password: 'short',
    },
  });
  assert.equal(weakPwdRes.status, 400);

  // 5) Test simulate scan endpoint
  const scanRes = await apiRequest('/api/security/simulate-scan', {
    method: 'POST',
    token,
    body: { target_url: 'https://ethiointern.et/api' },
  });
  assert.equal(scanRes.status, 200);
  assert.equal(scanRes.body.data.status, 'SECURE');
  assert.ok(scanRes.body.data.findings.length >= 4);
});

