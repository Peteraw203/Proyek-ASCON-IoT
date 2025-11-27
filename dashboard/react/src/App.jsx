// src/App.jsx
import { RouterProvider } from 'react-router-dom';
import router from 'routes';

import { AuthProvider } from 'contexts/AuthContext';
import { MqttProvider } from 'contexts/MqttContext';

export default function App() {
  return (
    <AuthProvider>
      <MqttProvider>
        <RouterProvider router={router} />
      </MqttProvider>
    </AuthProvider>
  );
}