import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '@/services/authService';
import { RegisterRequest } from '@/types/auth';

interface ValidationErrors {
  userName?: string;
  password?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
}

export const validateRegister = (data: RegisterRequest): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.userName?.trim()) {
    errors.userName = "Tên đăng nhập không được để trống";
  } else if (data.userName.trim().length < 4) {
    errors.userName = "Tên đăng nhập phải từ 4 ký tự trở lên";
  } else if (data.userName.trim().length > 30) {
    errors.userName = "Tên đăng nhập tối đa 30 ký tự";
  }

  if (data.password !== undefined) {
    if (!data.password.trim()) {
      errors.password = "Mật khẩu không được để trống";
    } else if (data.password.length < 8) {
      errors.password = "Mật khẩu phải từ 8 ký tự trở lên";
    } else if (!/[A-Z]/.test(data.password)) {
      errors.password = "Mật khẩu phải có ít nhất 1 chữ cái in hoa";
    } else if (!/[0-9]/.test(data.password)) {
      errors.password = "Mật khẩu phải có ít nhất 1 số";
    }
  }

  if (!data.email?.trim()) {
    errors.email = "Email không được để trống";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "Email không đúng định dạng";
  }

  if (!data.firstName?.trim()) {
    errors.firstName = "Họ không được để trống";
  }
  if (!data.lastName?.trim()) {
    errors.lastName = "Tên không được để trống";
  }

  if (!data.phoneNumber?.trim()) {
    errors.phoneNumber = "Số điện thoại không được để trống";
  } else {
    const cleaned = data.phoneNumber.trim().replace(/\s+/g, '');
    if (!/^(?:\+?84|0)(3[2-9]|5[25689]|7[06-9]|8[1-689]|9[0-9])[0-9]{7}$/.test(cleaned)) {
      errors.phoneNumber = "Số điện thoại không đúng định dạng (ví dụ: 0912345678)";
    }
  }

  if (!data.gender) {
    errors.gender = "Vui lòng chọn giới tính";
  } else if (!['MALE', 'FEMALE', 'OTHER'].includes(data.gender)) {
    errors.gender = "Giới tính không hợp lệ";
  }

  if (!data.dateOfBirth?.trim()) {
    errors.dateOfBirth = "Ngày sinh không được để trống";
  } else {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.dateOfBirth = "Ngày sinh không đúng định dạng";
    } else {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 13) {
        errors.dateOfBirth = "Bạn phải từ 13 tuổi trở lên";
      }
      if (age > 120) {
        errors.dateOfBirth = "Ngày sinh không hợp lý";
      }
    }
  }

  return errors;
};

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    userName: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: 'MALE',
    dateOfBirth: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate trước khi gửi
    const validationErrors = validateRegister(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Vui lòng kiểm tra lại thông tin!');
      return;
    }

    setErrors({}); // xóa lỗi cũ nếu pass

    try {
      const res = await authService.register(formData);
      toast.success(res.message || 'Đăng ký thành công!');
      navigate('/login');
    } catch (err: any) {
      const serverMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(serverMessage);

      // Nếu server trả lỗi chi tiết theo field (tùy chọn xử lý thêm)
      if (err.response?.data?.data) {
        setErrors(err.response.data.data);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleRegister} className="p-8 bg-white shadow-lg rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng Ký Tài Khoản</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="Họ"
              className="w-full p-2 border rounded"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <input
              type="text"
              placeholder="Tên"
              className="w-full p-2 border rounded"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mb-4 border rounded"
            value={formData.userName}
            onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
          />
          {errors.userName && <p className="text-red-500 text-sm -mt-3 mb-4">{errors.userName}</p>}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {errors.email && <p className="text-red-500 text-sm -mt-3 mb-4">{errors.email}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full p-2 mb-4 border rounded"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          {errors.password && <p className="text-red-500 text-sm -mt-3 mb-4">{errors.password}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Số điện thoại"
            className="w-full p-2 mb-4 border rounded"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
          {errors.phoneNumber && <p className="text-red-500 text-sm -mt-3 mb-4">{errors.phoneNumber}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <select
              className="w-full p-2 border rounded"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
            >
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>

          <div>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          Đăng Ký Ngay
        </button>
      </form>
    </div>
  );
};

export default Register;