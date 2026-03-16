import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import treeService from "@/services/treeService";
import treeMemberService, { TreeMember, TreeMemberRole } from "@/services/treeMemberService";
import invitationService from "@/services/invitationService";
import lookupService from "@/services/lookupService";
import eventService from "@/services/eventService";
import mediaService from "@/services/mediaService";
import addressService from "@/services/addressService";
import type { TreeDetail, TreeRole } from "@/types/tree";
import type { ShareLink } from "@/types/invitation";
import type { LookupItem } from "@/types/lookup";
import type { TreeEvent, TreeEventCreateRequest } from "@/types/event";
import type { MediaFile } from "@/types/media";
import type { Address, TreeAddressRequest } from "@/types/address";

interface ShareFormErrors {
  permission?: string;
  expiredAt?: string;
}

interface InvitationFormErrors {
  email?: string;
  role?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateShare = (p: { permission: string; expiredAt: string }): ShareFormErrors => {
  const e: ShareFormErrors = {};
  if (!p.permission) e.permission = "Vui lòng chọn quyền.";
  if (!p.expiredAt) e.expiredAt = "Vui lòng chọn ngày hết hạn.";
  return e;
};

const validateInvitation = (p: { email: string; role: string }): InvitationFormErrors => {
  const e: InvitationFormErrors = {};
  if (!p.email?.trim()) e.email = "Email không được để trống.";
  else if (!emailRegex.test(p.email.trim())) e.email = "Email không đúng định dạng.";
  if (!p.role) e.role = "Vui lòng chọn role.";
  return e;
};

const formatDateTime = (value?: string | null) => {
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

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};

const roleBadgeClass = (role: TreeRole | string) => {
  switch (role) {
    case "OWNER":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "ADMIN":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "EDITOR":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "VIEWER":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

type DetailTabKey = "members" | "share" | "events" | "media" | "addresses" | "persons";

export default function TreeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const treeId = id!;
  const navigate = useNavigate();

  const [tree, setTree] = useState<TreeDetail | null>(null);
  const [members, setMembers] = useState<TreeMember[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [events, setEvents] = useState<TreeEvent[]>([]);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [mediaTypes, setMediaTypes] = useState<LookupItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailTabKey>("members");

  const [shareForm, setShareForm] = useState({ permission: "VIEW", expiredAt: "" });
  const [shareErrors, setShareErrors] = useState<ShareFormErrors>({});

  const [inviteForm, setInviteForm] = useState({ email: "", role: "VIEWER" as TreeMemberRole });
  const [inviteErrors, setInviteErrors] = useState<InvitationFormErrors>({});

  const [eventForm, setEventForm] = useState<TreeEventCreateRequest>({
    event: { name: "", description: "", startedAt: "", endedAt: "" },
    treeEvent: { addressId: "", name: "" },
  });

  const [uploadingTreeMedia, setUploadingTreeMedia] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMediaTypeId, setUploadMediaTypeId] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      toast.info("Vui lòng đăng nhập.");
      navigate("/login");
      return;
    }
    if (!treeId) return;
    loadAll();
  }, [treeId, navigate]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [treeRes, memberRes, shareRes, eventRes, mediaRes, addressRes, mediaTypeRes] =
        await Promise.all([
          treeService.getById(treeId),
          treeMemberService.getMembers(treeId),
          invitationService.getShareLinks(treeId),
          eventService.getTreeEvents(treeId),
          mediaService.getTreeMedia(treeId),
          addressService.getTreeAddresses(treeId),
          lookupService.getMediaFileTypes(),
        ]);
      setTree(treeRes.data);
      setMembers(memberRes.data);
      setShareLinks(shareRes.data);
      setEvents(eventRes.data);
      setMedia(mediaRes.data);
      setAddresses(addressRes.data);
      setMediaTypes(mediaTypeRes.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không tải được thông tin cây.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onChangeRole = async (m: TreeMember, role: TreeMemberRole) => {
    try {
      await treeMemberService.changeRole(treeId, m.userId, role);
      toast.success("Cập nhật role thành viên thành công.");
      setMembers((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, role } : x)),
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không đổi được role.";
      toast.error(msg);
    }
  };

  const onRemoveMember = async (m: TreeMember) => {
    if (!window.confirm("Xóa thành viên này khỏi tree?")) return;
    try {
      await treeMemberService.removeMember(treeId, m.userId);
      toast.success("Đã xóa thành viên.");
      setMembers((prev) => prev.filter((x) => x.id !== m.id));
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không xóa được thành viên.";
      toast.error(msg);
    }
  };

  const onCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateShare(shareForm);
    if (Object.keys(v).length > 0) {
      setShareErrors(v);
      toast.error("Vui lòng kiểm tra thông tin share link.");
      return;
    }
    setShareErrors({});
    try {
      const res = await invitationService.createShareLink(treeId, shareForm);
      setShareLinks((prev) => [res.data, ...prev]);
      toast.success("Tạo share link thành công.");
      setShareForm({ permission: "VIEW", expiredAt: "" });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không tạo được share link.";
      toast.error(msg);
    }
  };

  const onRevokeShare = async (link: ShareLink) => {
    if (!window.confirm("Thu hồi share link này?")) return;
    try {
      await invitationService.revokeShareLink(treeId, link.id);
      toast.success("Đã thu hồi share link.");
      setShareLinks((prev) => prev.filter((x) => x.id !== link.id));
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không thu hồi được share link.";
      toast.error(msg);
    }
  };

  const onSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateInvitation(inviteForm);
    if (Object.keys(v).length > 0) {
      setInviteErrors(v);
      toast.error("Vui lòng kiểm tra thông tin lời mời.");
      return;
    }
    setInviteErrors({});
    try {
      await invitationService.sendInvitation(treeId, inviteForm);
      toast.success("Đã gửi lời mời.");
      setInviteForm({ email: "", role: "VIEWER" });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không gửi được lời mời.";
      toast.error(msg);
    }
  };

  const onCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.event.name.trim()) {
      toast.error("Tên sự kiện không được để trống.");
      return;
    }
    try {
      const res = await eventService.createTreeEvent(treeId, eventForm);
      toast.success("Tạo sự kiện thành công.");
      setEvents((prev) => [res.data, ...prev]);
      setEventForm({
        event: { name: "", description: "", startedAt: "", endedAt: "" },
        treeEvent: { addressId: "", name: "" },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không tạo được sự kiện.";
      toast.error(msg);
    }
  };

  const onDeleteEvent = async (ev: TreeEvent) => {
    if (!window.confirm("Xóa sự kiện này?")) return;
    try {
      await eventService.deleteEvent(treeId, ev.id);
      toast.success("Đã xóa sự kiện.");
      setEvents((prev) => prev.filter((x) => x.id !== ev.id));
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không xóa được sự kiện.";
      toast.error(msg);
    }
  };

  const onUploadTreeMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Vui lòng chọn file.");
      return;
    }
    if (!uploadMediaTypeId) {
      toast.error("Vui lòng chọn loại media.");
      return;
    }
    setUploadingTreeMedia(true);
    try {
      const res = await mediaService.uploadTreeMedia(
        treeId,
        uploadFile,
        uploadMediaTypeId,
        uploadDescription || undefined,
      );
      toast.success("Upload media thành công.");
      setMedia((prev) => [res.data, ...prev]);
      setUploadFile(null);
      setUploadMediaTypeId("");
      setUploadDescription("");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Upload media thất bại.";
      toast.error(msg);
    } finally {
      setUploadingTreeMedia(false);
    }
  };

  const onDeleteMedia = async (file: MediaFile) => {
    if (!window.confirm("Xóa file media này?")) return;
    try {
      await mediaService.deleteTreeMedia(treeId, file.id);
      toast.success("Đã xóa media.");
      setMedia((prev) => prev.filter((x) => x.id !== file.id));
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không xóa được media.";
      toast.error(msg);
    }
  };

  const onCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: TreeAddressRequest = {
      formattedAddress: "Địa chỉ chung của cây",
      addressLine: "",
      ward: "",
      district: "",
      city: "",
      province: "",
      country: "",
      latitude: 0,
      longitude: 0,
      placeId: "",
      addressTypeId: "",
      fromDate: new Date().toISOString(),
      toDate: new Date().toISOString(),
      description: "",
    };
    try {
      const res = await addressService.createTreeAddress(treeId, payload);
      toast.success("Thêm địa chỉ thành công (mẫu đơn giản).");
      setAddresses((prev) => [res.data, ...prev]);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không thêm được địa chỉ.";
      toast.error(msg);
    }
  };

  const onDeleteAddress = async (addr: Address) => {
    if (!window.confirm("Xóa địa chỉ này?")) return;
    try {
      await addressService.deleteTreeAddress(treeId, addr.id);
      toast.success("Đã xóa địa chỉ.");
      setAddresses((prev) => prev.filter((x) => x.id !== addr.id));
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không xóa được địa chỉ.";
      toast.error(msg);
    }
  };

  const headerMeta = useMemo(() => {
    if (!tree) return null;
    return {
      createdAt: formatDateTime(tree.createdAt),
      updatedAt: formatDateTime(tree.updatedAt),
    };
  }, [tree]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => navigate("/trees")}
              className="mb-1 text-xs text-blue-600 hover:underline"
            >
              ← Quay lại danh sách cây
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {tree?.name ?? "Chi tiết cây gia phả"}
            </h1>
            {tree && (
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-600">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${roleBadgeClass(
                    tree.myRole,
                  )}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  Vai trò của bạn: {tree.myRole}
                </span>
                <span>Thành viên: {tree.totalMembers}</span>
                <span>Nhân vật: {tree.totalPersons}</span>
                {headerMeta && (
                  <>
                    <span>• Tạo: {headerMeta.createdAt}</span>
                    <span>• Cập nhật: {headerMeta.updatedAt}</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/trees/${treeId}/graph`)}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white shadow hover:bg-emerald-700"
            >
              Xem cây gia phả (D3)
            </button>
            {loading && <span className="text-xs text-gray-500">Đang tải...</span>}
          </div>
        </div>

        <div className="rounded-2xl border border-white bg-white/90 p-2 shadow-sm">
          <div className="flex flex-wrap gap-1 border-b border-slate-100 px-1 pb-1 text-[11px] font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab("members")}
              className={`rounded-md px-3 py-1 ${
                activeTab === "members"
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-100"
              }`}
            >
              Thành viên
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("share")}
              className={`rounded-md px-3 py-1 ${
                activeTab === "share" ? "bg-slate-900 text-white" : "hover:bg-slate-100"
              }`}
            >
              Chia sẻ & lời mời
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className={`rounded-md px-3 py-1 ${
                activeTab === "events"
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-100"
              }`}
            >
              Sự kiện
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`rounded-md px-3 py-1 ${
                activeTab === "media" ? "bg-slate-900 text-white" : "hover:bg-slate-100"
              }`}
            >
              Media
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("addresses")}
              className={`rounded-md px-3 py-1 ${
                activeTab === "addresses"
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-100"
              }`}
            >
              Địa chỉ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("persons")}
              className={`rounded-md px-3 py-1 ${
                activeTab === "persons"
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-100"
              }`}
            >
              Nhân vật trong cây
            </button>
          </div>

          <div className="p-3 space-y-3 text-xs">
            {activeTab === "members" && (
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">Thành viên</h2>
                </div>
                {members.length === 0 ? (
                  <p className="text-xs text-gray-600">Chưa có thành viên nào.</p>
                ) : (
                  <div className="space-y-2">
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                      >
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-900">
                              {m.fullName}
                            </span>
                            <span className="text-gray-500">@{m.userName}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-gray-500">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${roleBadgeClass(
                                m.role,
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {m.role}
                            </span>
                            <span>Trạng thái: {m.status}</span>
                            {m.joinedAt && (
                              <span>• Tham gia: {formatDate(m.joinedAt)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={m.role}
                            onChange={(e) =>
                              onChangeRole(m, e.target.value as TreeMemberRole)
                            }
                            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] outline-none"
                          >
                            <option value="VIEWER">VIEWER</option>
                            <option value="EDITOR">EDITOR</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="OWNER">OWNER</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => onRemoveMember(m)}
                            className="rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "share" && (
              <section className="grid gap-4 md:grid-cols-2">
                <div>
                  <h2 className="mb-2 text-sm font-semibold text-gray-900">Share links</h2>
                  <form onSubmit={onCreateShare} className="mb-3 space-y-2 text-xs">
                    <div className="flex gap-2">
                      <select
                        value={shareForm.permission}
                        onChange={(e) =>
                          setShareForm((s) => ({ ...s, permission: e.target.value }))
                        }
                        className="w-1/3 rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
                      >
                        <option value="VIEW">VIEW</option>
                      </select>
                      <input
                        type="datetime-local"
                        value={shareForm.expiredAt}
                        onChange={(e) =>
                          setShareForm((s) => ({ ...s, expiredAt: e.target.value }))
                        }
                        className="w-2/3 rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
                      />
                    </div>
                    {(shareErrors.permission || shareErrors.expiredAt) && (
                      <p className="text-[11px] text-red-500">
                        {shareErrors.permission || shareErrors.expiredAt}
                      </p>
                    )}
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700"
                    >
                      Tạo share link
                    </button>
                  </form>
                  <div className="space-y-1 text-xs">
                    {shareLinks.length === 0 && (
                      <p className="text-gray-600">Chưa có share link nào.</p>
                    )}
                    {shareLinks.map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between gap-2 rounded-md border border-gray-100 bg-gray-50 px-2 py-1"
                      >
                        <div className="flex-1">
                          <p className="truncate text-[11px] text-blue-700">
                            {l.shareUrl}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Quyền: {l.permission} • Hết hạn:{" "}
                            {formatDateTime(l.expiresAt)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRevokeShare(l)}
                          className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700 hover:bg-red-100"
                        >
                          Thu hồi
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="mb-2 text-sm font-semibold text-gray-900">Gửi lời mời</h2>
                  <form onSubmit={onSendInvitation} className="space-y-2 text-xs">
                    <input
                      type="email"
                      placeholder="Email người được mời"
                      value={inviteForm.email}
                      onChange={(e) =>
                        setInviteForm((s) => ({ ...s, email: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
                    />
                    {inviteErrors.email && (
                      <p className="text-[11px] text-red-500">{inviteErrors.email}</p>
                    )}
                    <select
                      value={inviteForm.role}
                      onChange={(e) =>
                        setInviteForm((s) => ({
                          ...s,
                          role: e.target.value as TreeMemberRole,
                        }))
                      }
                      className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
                    >
                      <option value="VIEWER">VIEWER</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="OWNER">OWNER</option>
                    </select>
                    {inviteErrors.role && (
                      <p className="text-[11px] text-red-500">{inviteErrors.role}</p>
                    )}
                    <button
                      type="submit"
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-700"
                    >
                      Gửi lời mời
                    </button>
                  </form>
                </div>
              </section>
            )}

            {activeTab === "events" && (
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">Sự kiện của cây</h2>
                </div>
                <form
                  onSubmit={onCreateEvent}
                  className="mb-3 grid gap-2 text-xs md:grid-cols-4"
                >
                  <input
                    type="text"
                    value={eventForm.event.name}
                    onChange={(e) =>
                      setEventForm((s) => ({
                        ...s,
                        event: { ...s.event, name: e.target.value },
                      }))
                    }
                    placeholder="Tên sự kiện"
                    className="rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
                  />
                  <input
                    type="text"
                    value={eventForm.event.description}
                    onChange={(e) =>
                      setEventForm((s) => ({
                        ...s,
                        event: { ...s.event, description: e.target.value },
                      }))
                    }
                    placeholder="Mô tả"
                    className="rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
                  />
                  <input
                    type="datetime-local"
                    value={eventForm.event.startedAt}
                    onChange={(e) =>
                      setEventForm((s) => ({
                        ...s,
                        event: { ...s.event, startedAt: e.target.value },
                      }))
                    }
                    className="rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-700"
                  >
                    Tạo sự kiện
                  </button>
                </form>
                <div className="space-y-2 text-xs">
                  {events.length === 0 && (
                    <p className="text-gray-600">Chưa có sự kiện nào cho cây này.</p>
                  )}
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{ev.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {ev.description || "Không có mô tả"} • Bắt đầu:{" "}
                          {formatDateTime(ev.startedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onDeleteEvent(ev)}
                          className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700 hover:bg-red-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "media" && (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-gray-900">Media của cây</h2>
                <form onSubmit={onUploadTreeMedia} className="mb-3 space-y-2 text-xs">
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                    className="w-full text-xs"
                  />
                  <select
                    value={uploadMediaTypeId}
                    onChange={(e) => setUploadMediaTypeId(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
                  >
                    <option value="">Chọn loại media</option>
                    {mediaTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Mô tả (tuỳ chọn)"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={uploadingTreeMedia}
                    className="rounded-md bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {uploadingTreeMedia ? "Đang upload..." : "Upload media"}
                  </button>
                </form>
                <div className="space-y-2 text-xs">
                  {media.length === 0 && (
                    <p className="text-gray-600">Chưa có media nào.</p>
                  )}
                  {media.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <div className="flex-1">
                        <p className="truncate text-xs text-blue-700">{m.fileName}</p>
                        <p className="text-[11px] text-gray-500">
                          Loại: {m.mediaFileType} • Kích thước: {m.fileSize} bytes
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md bg-white px-2 py-1 text-[10px] text-blue-700 hover:bg-blue-50"
                        >
                          Xem
                        </a>
                        <button
                          type="button"
                          onClick={() => onDeleteMedia(m)}
                          className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700 hover:bg-red-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "addresses" && (
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">Địa chỉ của cây</h2>
                  <button
                    type="button"
                    onClick={onCreateAddress}
                    className="rounded-md bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100"
                  >
                    Thêm địa chỉ mẫu
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {addresses.length === 0 && (
                    <p className="text-gray-600">Chưa có địa chỉ nào.</p>
                  )}
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-xs text-gray-900">
                          {a.formattedAddress || "Địa chỉ không rõ"}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {a.city} {a.province} {a.country}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteAddress(a)}
                        className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700 hover:bg-red-100"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "persons" && (
              <section className="rounded-xl border border-dashed border-gray-200 bg-slate-50 px-3 py-3 text-xs text-gray-700">
                <p>
                  Để quản lý nhân vật, media và sự kiện theo từng person, hãy dùng trang{" "}
                  <Link
                    to="/persons"
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Persons
                  </Link>{" "}
                  và chi tiết person. Tại đó bạn có thể xem family, sự kiện, địa chỉ và media
                  trong phạm vi từng cây gia phả.
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

