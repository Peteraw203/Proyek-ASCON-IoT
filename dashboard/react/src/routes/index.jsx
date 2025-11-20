import { createBrowserRouter, Navigate } from 'react-router-dom';

// project import
import MainRoutes from './MainRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to="/login" replace />,
    },
    // Memuat sisa rute lainnya (Dashboard & Login) dari MainRoutes
    MainRoutes
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;