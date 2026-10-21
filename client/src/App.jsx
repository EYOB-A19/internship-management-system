import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

// Public Pages
import { HomePage } from "./pages/public/HomePage.jsx";
import { InternshipsPage } from "./pages/public/InternshipsPage.jsx";
import { InternshipDetailsPage } from "./pages/public/InternshipDetailsPage.jsx";
import { CompaniesPage } from "./pages/public/CompaniesPage.jsx";
import { CompanyDetailsPage } from "./pages/public/CompanyDetailsPage.jsx";
import { PublicPortfolioPage } from "./pages/public/PublicPortfolioPage.jsx";
import { LoginPage } from "./pages/public/LoginPage.jsx";
import { RegisterPage } from "./pages/public/RegisterPage.jsx";
import { AboutPage } from "./pages/public/AboutPage.jsx";

// Student Pages
import {
  StudentDashboardPage,
  StudentApplicationsPage,
  StudentSavedPage,
  StudentRecommendationsPage,
  StudentInterviewsPage,
  NotificationsCenterPage,
  StudentPortfolioManagePage,
  AccountSettingsPage,
} from "./pages/student/StudentDashboardPages.jsx";
import { StudentProfilePage } from "./pages/student/StudentProfilePage.jsx";
import { StudentCvBuilderPage } from "./pages/student/StudentCvBuilderPage.jsx";

// Company Pages
import {
  CompanyDashboardPage,
  CompanyProfilePage,
  CompanyInternshipsPage,
  CompanyInternshipFormPage,
  CompanyApplicationsPage,
  CompanyStudentDiscoveryPage,
  CompanyInterviewsPage,
} from "./pages/company/CompanyDashboardPages.jsx";

// Admin Pages
import {
  AdminDashboardPage,
  AdminVerificationsPage,
  AdminStudentsPage,
  AdminInternshipsPage,
  AdminUniversitiesPage,
  AdminDepartmentsPage,
  AdminSkillsPage,
  AdminReportsPage,
} from "./pages/admin/AdminDashboardPages.jsx";

function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-xs font-mono text-slate-500">
        Loading EthioIntern workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback =
      user.role === "ADMIN"
        ? "/admin/dashboard"
        : user.role === "COMPANY"
          ? "/company/dashboard"
          : "/student/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/internships/:id" element={<InternshipDetailsPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id" element={<CompanyDetailsPage />} />
          <Route path="/students/:id" element={<PublicPortfolioPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Student Portal Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/saved"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentSavedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/recommendations"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentRecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/portfolio"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentPortfolioManagePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/cv-builder"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentCvBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/interviews"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentInterviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <NotificationsCenterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/settings"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <AccountSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Company Portal Routes */}
          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute allowedRoles={["COMPANY"]}>
                <CompanyDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/profile"
            element={
              <ProtectedRoute allowedRoles={["COMPANY"]}>
                <CompanyProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/internships"
            element={
              <ProtectedRoute allowedRoles={["COMPANY"]}>
                <CompanyInternshipsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/internships/create"
            element={
              <ProtectedRoute allowedRoles={["COMPANY"]}>
                <CompanyInternshipFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/internships/:id"
            element={
              <ProtectedRoute allowedRoles={["COMPANY"]}>
                <CompanyInternshipFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/applications"
            element={
              <ProtectedRoute allowedRoles={["COMPANY"]}>
                <CompanyApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/students"
            element={
              <ProtectedRoute allowedRoles={["COMPANY", "ADMIN"]}>
                <CompanyStudentDiscoveryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/interviews"
            element={
              <ProtectedRoute allowedRoles={["COMPANY"]}>
                <CompanyInterviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/notifications"
            element={
              <ProtectedRoute allowedRoles={["COMPANY"]}>
                <NotificationsCenterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/settings"
            element={
              <ProtectedRoute allowedRoles={["COMPANY"]}>
                <AccountSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Portal Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboardPage fullAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verifications"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminVerificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminVerificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminStudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/internships"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminInternshipsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/universities"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUniversitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDepartmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/skills"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminSkillsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AccountSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
