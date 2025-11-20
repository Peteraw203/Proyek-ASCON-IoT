import { lazy } from 'react';

import AdminLayout from 'layouts/AdminLayout';
import GuestLayout from 'layouts/GuestLayout';

// Dashboard
const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));

// Authentication
const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register')); // <--- TAMBAHAN 1

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <AdminLayout />,
      children: [
        {
          path: '/dashboard/sales',
          element: <DashboardSales />
        }
      ]
    },
    {
      path: '/',
      element: <GuestLayout />,
      children: [
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/register',     // <--- TAMBAHAN 2: Rute untuk register
          element: <Register />
        }
      ]
    }
  ]
};

export default MainRoutes;