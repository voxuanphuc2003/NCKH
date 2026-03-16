import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import userService from "@/services/userService";
import type { ChangePasswordRequest, Gender, UpdateMeRequest, UserMe } from "@/types/user";

const genders: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

const emptyProfile: UpdateMeRequest = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  gender: "OTHER",
  dateOfBirth: "",
  avatarUrl: "",
};

export default function Profile() {
  const navigate = useNavigate();

  const [me, setMe] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [profileForm, setProfileForm] = useState<UpdateMeRequest>(emptyProfile);
  const [pwdForm, setPwdForm] = useState<ChangePasswordRequest>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isAuthed = useMemo(() => Boolean(localStorage.getItem("accessToken")), []);

  useEffect(() => {
    if (!isAuthed) {
      toast.info("Vui lòng đăng nhập để xem thông tin cá nhân.");
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    userService
      .getMe()
      .then((res) => {
        if (cancelled) return;
        setMe(res.data);
        setProfileForm({
          firstName: res.data.firstName ?? "",
          lastName: res.data.lastName ?? "",
          phoneNumber: res.data.phoneNumber ?? "",
          gender: (res.data.gender as Gender) ?? "OTHER",
          dateOfBirth: res.data.dateOfBirth ?? "",
          avatarUrl: res.data.avatarUrl ?? "",
        });
      })
      .catch((err: any) => {
        const msg = err?.response?.data?.message ?? "Không lấy được thông tin người dùng.";
        toast.error(msg);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthed, navigate]);

  const onSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await userService.updateMe(profileForm);
      setMe(res.data);
      toast.success("Cập nhật thông tin thành công.");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Cập nhật thất bại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }
    setIsLoading(true);
    try {
      await userService.changePassword(pwdForm);
      toast.success("Đổi mật khẩu thành công.");
      setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Đổi mật khẩu thất bại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#FFF1D2] to-[#D0D6FF] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-sm text-gray-700">
              {me ? `@${me.userName} • ${me.email}` : "Đang tải..."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/", { replace: false })}
            className="rounded-lg bg-white/70 px-4 py-2 text-sm font-medium text-gray-800 shadow hover:bg-white"
          >
            Về trang chủ
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Hồ sơ</h2>

            <form onSubmit={onSubmitProfile} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-gray-700">Họ</span>
                  <input
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((s) => ({ ...s, lastName: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                    placeholder="Nguyễn"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-700">Tên</span>
                  <input
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((s) => ({ ...s, firstName: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                    placeholder="Văn A"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm text-gray-700">Số điện thoại</span>
                <input
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm((s) => ({ ...s, phoneNumber: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="090..."
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-gray-700">Giới tính</span>
                  <select
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm((s) => ({ ...s, gender: e.target.value as Gender }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                  >
                    {genders.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-gray-700">Ngày sinh</span>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm((s) => ({ ...s, dateOfBirth: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm text-gray-700">Avatar URL</span>
                <input
                  value={profileForm.avatarUrl}
                  onChange={(e) => setProfileForm((s) => ({ ...s, avatarUrl: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </label>

              <button
                disabled={isLoading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Đổi mật khẩu</h2>

            <form onSubmit={onSubmitPassword} className="space-y-4">
              <label className="block">
                <span className="text-sm text-gray-700">Mật khẩu cũ</span>
                <input
                  type="password"
                  value={pwdForm.oldPassword}
                  onChange={(e) => setPwdForm((s) => ({ ...s, oldPassword: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Mật khẩu mới</span>
                <input
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm((s) => ({ ...s, newPassword: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Xác nhận mật khẩu mới</span>
                <input
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
                />
              </label>

              <button
                disabled={isLoading}
                className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white shadow hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

