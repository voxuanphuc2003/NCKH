import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { AppDispatch } from "@/store";
import { setAuthFromOAuth } from "@/store/slices/authSlice";

/**
 * Trang xử lý sau khi backend OAuth2 callback redirect về frontend kèm JWT.
 * Backend redirect tới /auth/callback?accessToken=... (hoặc token=...).
 */
const OAuth2Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken") ?? searchParams.get("token");
    if (accessToken) {
      dispatch(setAuthFromOAuth({ accessToken }));
      toast.success("Đăng nhập Google thành công!");
      navigate("/", { replace: true });
    } else {
      toast.error("Không nhận được token từ đăng nhập Google.");
      navigate("/login", { replace: true });
    }
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default OAuth2Callback;
