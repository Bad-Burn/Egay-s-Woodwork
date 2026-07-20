import AdminPanel from '@/components/AdminPanel';

// Access to this route is enforced by middleware.js (valid session cookie
// required). If the cookie is missing/invalid the user is redirected to
// /admin/login before this ever renders.
export default function AdminDashboard() {
  return <AdminPanel />;
}
