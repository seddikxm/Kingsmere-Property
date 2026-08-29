import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { ListingPage } from '@/pages/ListingPage';
import { PropertiesPage } from '@/pages/PropertiesPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { LoginPage } from '@/pages/admin/LoginPage';
import { OverviewPage } from '@/pages/admin/OverviewPage';
import { AppointmentsPage } from '@/pages/admin/AppointmentsPage';
import { ServicesPage } from '@/pages/admin/ServicesPage';
import { BusinessHoursPage } from '@/pages/admin/BusinessHoursPage';
import { BlockedDatesPage } from '@/pages/admin/BlockedDatesPage';
import { BusinessSettingsPage } from '@/pages/admin/BusinessSettingsPage';
import { ListingsIndexPage } from '@/pages/admin/ListingsIndexPage';
import { EditListingPage } from '@/pages/admin/EditListingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listing" element={<ListingPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="hours" element={<BusinessHoursPage />} />
          <Route path="blocked" element={<BlockedDatesPage />} />
          <Route path="listing" element={<ListingsIndexPage />} />
          <Route path="listing/edit" element={<EditListingPage />} />
          <Route path="settings" element={<BusinessSettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
