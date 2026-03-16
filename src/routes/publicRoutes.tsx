// src/routes/index.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login/Login'; // Tùy vị trí bạn đặt file
import Register from '../pages/Register/Register';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Các route khác */}
      </Routes>
    </BrowserRouter>
  );
};