import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../../shared/components/layout/AppLayout";
import AuthLayout from "../../shared/components/layout/AuthLayout";
import AuthGuard from "../../shared/components/guards/AuthGuard";
import RoleGuard from "../../shared/components/guards/RoleGuard";

// Pages
import LoginPage from "../../features/auth/pages/LoginPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import ProfilePage from "../../features/profile/pages/ProfilePage";
import ClassesListPage from "../../features/classes/pages/ClassListPage";
import ClassDetailPage from "../../features/classes/pages/ClassDetailPage";
import ClassStudentsPage from "../../features/classes/pages/ClassStudentsPage";
import HomeworkListPage from "../../features/homework/pages/HomeworkListPage";
import HomeworkDetailPage from "../../features/homework/pages/HomeworkDetailPage";
import SubmissionPage from "../../features/homework/pages/SubmissionPage";
import GradingPage from "../../features/homework/pages/GradingPage";
import MaterialsListPage from "../../features/materials/pages/MaterialsListPage";
import UploadMaterialPage from "../../features/materials/pages/UploadMaterialPage";
import MaterialDetailPage from "../../features/materials/pages/MaterialDetailPage";

const NotFound = () => (
  <div className="container">
    <h1>404</h1>
    <p>页面不存在</p>
  </div>
);

const Protected = ({ children }) => (
  <AuthGuard>
    <AppLayout>{children}</AppLayout>
  </AuthGuard>
);

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
      </Route>

      {/* Private */}
      <Route
        path="/dashboard"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <ProfilePage />
          </Protected>
        }
      />

      <Route
        path="/classes"
        element={
          <Protected>
            <ClassesListPage />
          </Protected>
        }
      />
      <Route
        path="/classes/:classId"
        element={
          <Protected>
            <ClassDetailPage />
          </Protected>
        }
      />
      <Route
        path="/classes/:classId/students"
        element={
          <Protected>
            <RoleGuard allowedRoles={["teacher"]}>
              <ClassStudentsPage />
            </RoleGuard>
          </Protected>
        }
      />

      <Route
        path="/homework"
        element={
          <Protected>
            <HomeworkListPage />
          </Protected>
        }
      />
      <Route
        path="/homework/assingment"
        element={
          <Protected>
            <HomeworkListPage />
          </Protected>
        }
      />
      <Route
        path="/homework/:homeworkId"
        element={
          <Protected>
            <HomeworkDetailPage />
          </Protected>
        }
      />
      <Route
        path="/homework/:homeworkId/submit"
        element={
          <Protected>
            <SubmissionPage />
          </Protected>
        }
      />
      <Route
        path="/homework/:homeworkId/grade"
        element={
          <Protected>
            <RoleGuard allowedRoles={["teacher"]}>
              <GradingPage />
            </RoleGuard>
          </Protected>
        }
      />

      <Route
        path="/materials"
        element={
          <Protected>
            <MaterialsListPage />
          </Protected>
        }
      />
      <Route
        path="/materials/upload"
        element={
          <Protected>
            <UploadMaterialPage />
          </Protected>
        }
      />
      <Route
        path="/materials/:materialId"
        element={
          <Protected>
            <MaterialDetailPage />
          </Protected>
        }
      />

      <Route
        path="/settings"
        element={
          <Protected>
            <div className="container">
              <h1>设置</h1>
            </div>
          </Protected>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
