import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import userService from "@/services/userService";
import type { User } from "@/types/user";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      toast.info("Vui lòng đăng nhập.");
      navigate("/login", { replace: true });
      return;
    }
    if (!id) return;

    let cancelled = false;
    setIsLoading(true);
    userService
      .getById(id)
      .then((res) => {
        if (cancelled) return;
        setUser(res.data);
      })
      .catch((err: any) => {
        const status = err?.response?.status;
        const msg =
          err?.response?.data?.message ??
          (status === 403
            ? "Bạn không có quyền (chỉ ADMIN)."
            : "Không lấy được thông tin user.");
        toast.error(msg);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#FFF1D2] to-[#D0D6FF] px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Xem thông tin user</h1>
            <p className="text-sm text-gray-700">{id}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 shadow hover:bg-white"
          >
            Quay lại
          </button>
        </div>

        {isLoading && <p className="text-gray-600">Đang tải...</p>}

        {!isLoading && user && (
          <div className="space-y-2 text-sm text-gray-800">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-gray-500">UserName</div>
                <div className="font-medium">{user.userName}</div>
              </div>
              <div>
                <div className="text-gray-500">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              <div>
                <div className="text-gray-500">Họ tên</div>
                <div className="font-medium">{user.fullName}</div>
              </div>
              <div>
                <div className="text-gray-500">SĐT</div>
                <div className="font-medium">{user.phoneNumber}</div>
              </div>
              <div>
                <div className="text-gray-500">Giới tính</div>
                <div className="font-medium">{user.gender}</div>
              </div>
              <div>
                <div className="text-gray-500">Ngày sinh</div>
                <div className="font-medium">{user.dateOfBirth}</div>
              </div>
              <div>
                <div className="text-gray-500">Trạng thái</div>
                <div className="font-medium">{user.status}</div>
              </div>
              <div>
                <div className="text-gray-500">Role</div>
                <div className="font-medium">{user.role}</div>
              </div>
            </div>

            {user.avatarUrl && (
              <div className="pt-4">
                <div className="mb-2 text-gray-500">Avatar</div>
                <img
                  src={user.avatarUrl}
                  alt="avatar"
                  className="h-24 w-24 rounded-full border border-white object-cover shadow"
                />
              </div>
            )}
          </div>
        )}

        {!isLoading && !user && (
          <p className="text-gray-600">Không có dữ liệu để hiển thị.</p>
        )}
      </div>
    </div>
  );
}

