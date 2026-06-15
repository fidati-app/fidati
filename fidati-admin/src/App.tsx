import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { PermissionRoute } from '@/components/auth/PermissionGate';
import { ProtectedAdminRoute } from '@/components/auth/ProtectedAdminRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { PermissionProvider } from '@/hooks/usePermissions';
import { AccountingPage } from '@/pages/accounting/AccountingPage';
import { AuditPage } from '@/pages/audit/AuditPage';
import { ChatsPage } from '@/pages/chats/ChatsPage';
import { ChatDetailPage } from '@/pages/chats/ChatDetailPage';
import { CustomerDetailPage } from '@/pages/customers/CustomerDetailPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProfessionalDetailPage } from '@/pages/professionals/ProfessionalDetailPage';
import { ProfessionalsPage } from '@/pages/professionals/ProfessionalsPage';
import { ReportDetailPage } from '@/pages/reports/ReportDetailPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { RequestDetailPage } from '@/pages/requests/RequestDetailPage';
import { RequestsPage } from '@/pages/requests/RequestsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { StaffPage } from '@/pages/staff/StaffPage';
import { VerificationReviewPage } from '@/pages/verifications/VerificationReviewPage';
import { VerificationsPage } from '@/pages/verifications/VerificationsPage';

export default function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedAdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<PermissionRoute permission="dashboard.view"><DashboardPage /></PermissionRoute>} />
                <Route path="professionals" element={<PermissionRoute permission="professionals.view"><ProfessionalsPage /></PermissionRoute>} />
                <Route path="professionals/:id" element={<PermissionRoute permission="professionals.view"><ProfessionalDetailPage /></PermissionRoute>} />
                <Route path="verifications" element={<PermissionRoute permission="verifications.view"><VerificationsPage /></PermissionRoute>} />
                <Route path="verifications/:id" element={<PermissionRoute permission="verifications.view"><VerificationReviewPage /></PermissionRoute>} />
                <Route path="customers" element={<PermissionRoute permission="customers.view"><CustomersPage /></PermissionRoute>} />
                <Route path="customers/:id" element={<PermissionRoute permission="customers.view"><CustomerDetailPage /></PermissionRoute>} />
                <Route path="requests" element={<PermissionRoute permission="requests.view"><RequestsPage /></PermissionRoute>} />
                <Route path="requests/:id" element={<PermissionRoute permission="requests.view"><RequestDetailPage /></PermissionRoute>} />
                <Route path="chats" element={<PermissionRoute permission="chats.view"><ChatsPage /></PermissionRoute>} />
                <Route path="chats/:id" element={<PermissionRoute permission="chats.view"><ChatDetailPage /></PermissionRoute>} />
                <Route path="reports" element={<PermissionRoute permission="reports.view"><ReportsPage /></PermissionRoute>} />
                <Route path="reports/:id" element={<PermissionRoute permission="reports.view"><ReportDetailPage /></PermissionRoute>} />
                <Route path="accounting" element={<PermissionRoute permission="accounting.view"><AccountingPage /></PermissionRoute>} />
                <Route path="staff" element={<PermissionRoute permission="staff.view"><StaffPage /></PermissionRoute>} />
                <Route path="audit" element={<PermissionRoute permission="audit.view"><AuditPage /></PermissionRoute>} />
                <Route path="settings" element={<PermissionRoute permission="settings.view"><SettingsPage /></PermissionRoute>} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </PermissionProvider>
    </AuthProvider>
  );
}
