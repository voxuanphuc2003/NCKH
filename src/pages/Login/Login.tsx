import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '@/store/slices/authSlice';
import { AppDispatch, RootState } from '@/store';
import authService from '@/services/authService';
import { toast } from 'react-toastify';
import { LoginRequest } from '@/types/auth';
import { useNavigate } from 'react-router-dom';

// ── Validation Errors Interface ──
interface ValidationErrors {
  userName?: string;
  password?: string;
}

// ── Validate function (giữ nguyên như bạn đã có) ──
export const validateLogin = (data: LoginRequest): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.userName?.trim()) {
    errors.userName = "Tên đăng nhập không được để trống";
  } else if (data.userName.trim().length < 3) {
    errors.userName = "Tên đăng nhập phải từ 3 ký tự trở lên";
  } else if (data.userName.trim().length > 50) {
    errors.userName = "Tên đăng nhập tối đa 50 ký tự";
  }

  if (!data.password?.trim()) {
    errors.password = "Mật khẩu không được để trống";
  } else if (data.password.length < 6) {
    errors.password = "Mật khẩu phải từ 6 ký tự trở lên";
  }

  return errors;
};

const Login = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    userName: '',
    password: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error: reduxError } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate trước khi dispatch
    const validationErrors = validateLogin(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Vui lòng kiểm tra lại thông tin!');
      return;
    }

    setErrors({}); // xóa lỗi cũ nếu validate pass

    try {
      await dispatch(loginThunk(formData)).unwrap();
      toast.success('Đăng nhập thành công!');
      navigate('/trees');
    } catch (err: any) {
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại!';

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast.error(errorMessage);

      // Nếu server trả lỗi chi tiết theo field (tùy chọn)
      if (err?.response?.data?.data) {
        setErrors(err.response.data.data);
      }
    }
  };

  const handleLoginGoogle = () => {
    window.location.href = authService.getGoogleAuthorizeUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng Nhập</h2>

        {/* Lỗi từ Redux (nếu có) */}
        {reduxError && <p className="text-red-500 text-sm mb-4">{reduxError}</p>}

        <div>
          <input
            type="text"
            placeholder="Tên đăng nhập"
            className="w-full p-2 mb-4 border rounded"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
          />
          {errors.userName && <p className="text-red-500 text-sm -mt-3 mb-4">{errors.userName}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full p-2 mb-6 border rounded"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          {errors.password && <p className="text-red-500 text-sm -mt-3 mb-4">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleLoginGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Đăng nhập bằng Google
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;