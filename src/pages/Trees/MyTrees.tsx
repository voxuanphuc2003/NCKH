import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import treeService from "@/services/treeService";
import type { TreeSummary, TreeUpsertRequest } from "@/types/tree";

interface TreeFormErrors {
  name?: string;
  description?: string;
}

const validateTree = (data: TreeUpsertRequest): TreeFormErrors => {
  const errors: TreeFormErrors = {};
  if (!data.name?.trim()) {
    errors.name = "Tên cây không được để trống";
  } else if (data.name.trim().length < 3) {
    errors.name = "Tên cây phải từ 3 ký tự trở lên";
  }
  if (data.description && data.description.length > 500) {
    errors.description = "Mô tả tối đa 500 ký tự";
  }
  return errors;
};

export default function MyTrees() {
  const navigate = useNavigate();
  const [trees, setTrees] = useState<TreeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<TreeUpsertRequest>({ name: "", description: "" });
  const [errors, setErrors] = useState<TreeFormErrors>({});
  const [roleFilter, setRoleFilter] = useState<"" | "VIEWER" | "EDITOR" | "ADMIN" | "OWNER">(
    "",
  );
  const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt" | "members" | "persons">(
    "updatedAt",
  );

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      toast.info("Vui lòng đăng nhập trước.");
      navigate("/login");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await treeService.getMyTrees();
      setTrees(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không tải được danh sách cây.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateTree(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      toast.error("Vui lòng kiểm tra lại thông tin.");
      return;
    }
    setErrors({});
    setCreating(true);
    try {
      const res = await treeService.create(form);
      toast.success("Tạo cây gia phả thành công.");
      setForm({ name: "", description: "" });
      setTrees((prev) => [res.data, ...prev]);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Tạo cây thất bại.";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (treeId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa cây này?")) return;
    try {
      await treeService.remove(treeId);
      toast.success("Đã xóa cây.");
      setTrees((prev) => prev.filter((t) => t.id !== treeId));
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Xóa cây thất bại.";
      toast.error(msg);
    }
  };

  const handleLeave = async (treeId: string) => {
    if (!window.confirm("Rời khỏi cây này?")) return;
    try {
      await treeService.leave(treeId);
      toast.success("Bạn đã rời khỏi cây.");
      setTrees((prev) => prev.filter((t) => t.id !== treeId));
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không rời khỏi cây được.";
      toast.error(msg);
    }
  };

  const formatDateTime = (value: string) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const filteredAndSortedTrees = useMemo(() => {
    let list = [...trees];
    if (roleFilter) {
      list = list.filter((t) => t.myRole === roleFilter);
    }
    list.sort((a, b) => {
      switch (sortBy) {
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "members":
          return b.totalMembers - a.totalMembers;
        case "persons":
          return b.totalPersons - a.totalPersons;
        case "updatedAt":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    return list;
  }, [trees, roleFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#FFF1D2] to-[#D0D6FF] px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cây gia phả của tôi</h1>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-lg bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-800 shadow hover:bg-white"
          >
            Về trang giới thiệu
          </button>
        </div>

        <form
          onSubmit={handleCreate}
          className="mb-8 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-sm backdrop-blur"
        >
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Tạo cây mới</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                placeholder="Tên cây"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="sm:col-span-2">
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                placeholder="Mô tả (tuỳ chọn)"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description}</p>
              )}
            </div>
          </div>
          <div className="mt-3">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {creating ? "Đang tạo..." : "Tạo cây"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-white/60 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách</h2>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as "" | "VIEWER" | "EDITOR" | "ADMIN" | "OWNER")
                }
                className="rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
              >
                <option value="">Tất cả vai trò</option>
                <option value="OWNER">OWNER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="EDITOR">EDITOR</option>
                <option value="VIEWER">VIEWER</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "createdAt" | "updatedAt" | "members" | "persons",
                  )
                }
                className="rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
              >
                <option value="updatedAt">Mới cập nhật</option>
                <option value="createdAt">Mới tạo</option>
                <option value="members">Nhiều thành viên</option>
                <option value="persons">Nhiều nhân vật</option>
              </select>
              {isLoading && <span className="text-xs text-gray-500">Đang tải...</span>}
            </div>
          </div>
          {filteredAndSortedTrees.length === 0 ? (
            <p className="text-sm text-gray-600">Chưa có cây nào. Hãy tạo cây đầu tiên.</p>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedTrees.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/trees/${t.id}`}
                        className="text-sm font-semibold text-blue-700 hover:underline"
                      >
                        {t.name}
                      </Link>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] uppercase tracking-wide text-gray-600">
                        {t.myRole}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                      {t.description || "Không có mô tả"}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">
                      Thành viên: {t.totalMembers} • Nhân vật: {t.totalPersons}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      Tạo: {formatDateTime(t.createdAt)} • Cập nhật:{" "}
                      {formatDateTime(t.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/trees/${t.id}`)}
                      className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-black"
                    >
                      Quản lý
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLeave(t.id)}
                      className="rounded-lg bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-800 shadow-sm hover:bg-yellow-100"
                    >
                      Rời cây
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm hover:bg-red-100"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

