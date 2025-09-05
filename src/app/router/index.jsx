import React from "react";
import { Button, Result } from "antd";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AppLayout from "../../shared/components/layout/AppLayout";
import AuthLayout from "../../shared/components/layout/AuthLayout";
import AuthGuard from "../../shared/components/guards/AuthGuard";
import RoleGuard from "../../shared/components/guards/RoleGuard";

// Pages
import LoginPage from "../../features/auth/pages/LoginPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import ProfilePage from "../../features/profile/pages/ProfilePage";
import ClassesListPage from "../../features/classes/pages/ClassListPage";
import HomeworkListPage from "../../features/homework/pages/HomeworkListPage";
import SubmissionPage from "../../features/homework/pages/SubmissionPage";
import GradingPage from "../../features/homework/pages/GradingPage";
import MaterialsListPage from "../../features/materials/pages/MaterialsListPage";
import HomeworkTeacher from "../../features/homework/pages/HomeworkTeacher";
import SettingPage from "../../features/setting/pages/settingPage";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="container">
      <Result
        status="404"
        title="404"
        subTitle="对不起，该页面不存在"
        extra={
          <Button
            type="primary"
            onClick={() => navigate("/dashboard", { replace: true })}
          >
            返回主页
          </Button>
        }
      />
    </div>
  );
};

const Protected = ({ children }) => (
  <AuthGuard>
    <AppLayout>{children}</AppLayout>
  </AuthGuard>
);

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
        path="/homework"
        element={
          <Protected>
            <RoleGuard allowedRoles={["student"]}>
              <HomeworkListPage />
            </RoleGuard>
          </Protected>
        }
      />

      <Route
        path="/thomework"
        element={
          <Protected>
            <RoleGuard allowedRoles={["teacher"]}>
              <HomeworkTeacher />
            </RoleGuard>
          </Protected>
        }
      />

      <Route
        path="/homework/:classId/:lessonId/submit"
        element={
          <Protected>
            <SubmissionPage />
          </Protected>
        }
      />

      <Route
        path="/homework/grade/:classId/:lessonId/:studentId/:studentName"
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
        path="/settings"
        element={
          <Protected>
            <SettingPage />
          </Protected>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
