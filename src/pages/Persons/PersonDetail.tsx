import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import personService from "@/services/personService";
import familyService from "@/services/familyService";
import eventService from "@/services/eventService";
import mediaService from "@/services/mediaService";
import addressService from "@/services/addressService";
import lookupService from "@/services/lookupService";
import treeService from "@/services/treeService";
import type { Person, PersonCreateOrUpdateRequest } from "@/types/person";
import type { PersonFamilyDetail } from "@/types/family";
import type { TreeEvent } from "@/types/event";
import type { MediaFile } from "@/types/media";
import type { Address, AddressCreateRequest } from "@/types/address";
import type { LookupItem } from "@/types/lookup";
import type { TreeSummary } from "@/types/tree";

interface PersonErrors {
  firstName?: string;
  lastName?: string;
}

const validatePerson = (p: PersonCreateOrUpdateRequest): PersonErrors => {
  const e: PersonErrors = {};
  if (!p.firstName?.trim()) e.firstName = "Họ không được để trống.";
  if (!p.lastName?.trim()) e.lastName = "Tên không được để trống.";
  return e;
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

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const personId = id!;
  const navigate = useNavigate();

  const [person, setPerson] = useState<Person | null>(null);
  const [family, setFamily] = useState<PersonFamilyDetail | null>(null);
  const [events, setEvents] = useState<TreeEvent[]>([]);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [mediaTypes, setMediaTypes] = useState<LookupItem[]>([]);

  const [treeIdInput, setTreeIdInput] = useState("");
  const [myTrees, setMyTrees] = useState<TreeSummary[]>([]);

  const [form, setForm] = useState<PersonCreateOrUpdateRequest>({
    firstName: "",
    lastName: "",
    gender: "MALE",
    dateOfBirth: "",
    dateOfDeath: "",
    citizenIdentificationNumber: "",
    avatarUrl: "",
  });
  const [errors, setErrors] = useState<PersonErrors>({});
  const [saving, setSaving] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTypeId, setUploadTypeId] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");

  useEffect(() => {
    if (!personId) return;
    loadPerson();
    lookupService
      .getMediaFileTypes()
      .then((r) => setMediaTypes(r.data))
      .catch(() => undefined);
    treeService
      .getMyTrees()
      .then((r) => setMyTrees(r.data))
      .catch(() => undefined);
  }, [personId]);

  const loadPerson = async () => {
    try {
      const res = await personService.getById(personId);
      setPerson(res.data);
      setForm({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        gender: res.data.gender,
        dateOfBirth: res.data.dateOfBirth,
        dateOfDeath: res.data.dateOfDeath,
        citizenIdentificationNumber: res.data.citizenIdentificationNumber,
        avatarUrl: res.data.avatarUrl,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không lấy được thông tin person.";
      toast.error(msg);
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validatePerson(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      toast.error("Vui lòng kiểm tra lại thông tin.");
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const res = await personService.update(personId, form);
      setPerson(res.data);
      toast.success("Cập nhật person thành công.");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Cập nhật thất bại.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const currentTreeLabel = useMemo(() => {
    if (!treeIdInput) return "";
    const t = myTrees.find((x) => x.id === treeIdInput);
    if (!t) return treeIdInput;
    return `${t.name} (${t.myRole})`;
  }, [myTrees, treeIdInput]);

  const onLoadTreeData = async () => {
    if (!treeIdInput.trim()) {
      toast.error("Vui lòng nhập treeId để tải family/events/media/address.");
      return;
    }
    const treeId = treeIdInput.trim();
    try {
      const [familyRes, eventsRes, mediaRes, addrRes] = await Promise.all([
        familyService.getPersonFamily(treeId, personId),
        eventService.getEventsOfPerson(treeId, personId),
        mediaService.getPersonMedia(treeId, personId),
        addressService.getPersonAddresses(treeId, personId),
      ]);
      setFamily(familyRes.data);
      setEvents(eventsRes.data);
      setMedia(mediaRes.data);
      setAddresses(addrRes.data);
      toast.success("Đã tải dữ liệu liên quan trong tree.");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không tải được family/events/media.";
      toast.error(msg);
    }
  };

  const onUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    const treeId = treeIdInput.trim();
    if (!treeId) {
      toast.error("Cần nhập treeId.");
      return;
    }
    if (!uploadFile) {
      toast.error("Vui lòng chọn file.");
      return;
    }
    if (!uploadTypeId) {
      toast.error("Vui lòng chọn loại media.");
      return;
    }
    try {
      const res = await mediaService.uploadPersonMedia(
        treeId,
        personId,
        uploadFile,
        uploadTypeId,
        uploadDesc || undefined,
      );
      toast.success("Upload media thành công.");
      setMedia((prev) => [res.data, ...prev]);
      setUploadFile(null);
      setUploadTypeId("");
      setUploadDesc("");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Upload media thất bại.";
      toast.error(msg);
    }
  };

  const onAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AddressCreateRequest = {
      formattedAddress: "Địa chỉ person",
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
      isPrimary: false,
      description: "",
    };
    try {
      const treeId = treeIdInput.trim();
      if (!treeId) {
        toast.error("Cần nhập treeId để thêm địa chỉ trong tree.");
        return;
      }
      const res = await addressService.createPersonAddress(treeId, personId, payload);
      toast.success("Thêm địa chỉ thành công.");
      setAddresses((prev) => [res.data, ...prev]);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không thêm được địa chỉ.";
      toast.error(msg);
    }
  };

  const onDeletePerson = async () => {
    if (!window.confirm("Xóa person này?")) return;
    try {
      await personService.remove(personId);
      toast.success("Đã xóa person.");
      navigate("/persons");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không xóa được person.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <button
          type="button"
          onClick={() => navigate("/persons")}
          className="text-xs text-blue-600 hover:underline"
        >
          ← Quay lại tìm kiếm
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {person ? person.fullName : "Chi tiết nhân vật"}
        </h1>

        {/* Edit person */}
        <section className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Thông tin cơ bản</h2>
          <form onSubmit={onSave} className="grid gap-3 text-xs md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] text-gray-600">Họ</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none focus:border-blue-500"
              />
              {errors.firstName && (
                <p className="mt-1 text-[11px] text-red-500">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-gray-600">Tên</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none focus:border-blue-500"
              />
              {errors.lastName && (
                <p className="mt-1 text-[11px] text-red-500">{errors.lastName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-gray-600">Giới tính</label>
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm((s) => ({ ...s, gender: e.target.value as any }))
                }
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-gray-600">Ngày sinh</label>
              <input
                type="datetime-local"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm((s) => ({ ...s, dateOfBirth: e.target.value }))
                }
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-gray-600">Ngày mất</label>
              <input
                type="datetime-local"
                value={form.dateOfDeath}
                onChange={(e) =>
                  setForm((s) => ({ ...s, dateOfDeath: e.target.value }))
                }
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-gray-600">CCCD</label>
              <input
                type="text"
                value={form.citizenIdentificationNumber}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    citizenIdentificationNumber: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] text-gray-600">Avatar URL</label>
              <input
                type="text"
                value={form.avatarUrl}
                onChange={(e) =>
                  setForm((s) => ({ ...s, avatarUrl: e.target.value }))
                }
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between pt-1">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-600 px-4 py-1.5 text-[11px] font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={onDeletePerson}
                className="rounded-md bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-700 hover:bg-red-100"
              >
                Xóa person
              </button>
            </div>
          </form>
        </section>

        {/* Tree-related data */}
        <section className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Dữ liệu trong một cây cụ thể
            </h2>
          </div>
          <div className="mb-3 flex flex-col gap-2 text-xs md:flex-row md:items-center">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] text-gray-600">
                Chọn cây gia phả chứa person này
              </label>
              <select
                value={treeIdInput}
                onChange={(e) => setTreeIdInput(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
              >
                <option value="">— Chọn một cây của bạn —</option>
                {myTrees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.myRole}) • Nhân vật: {t.totalPersons}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={onLoadTreeData}
              className="mt-2 rounded-md bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-black md:mt-6"
            >
              Tải family / events / media / address
            </button>
          </div>

          {currentTreeLabel && (
            <p className="mb-3 text-[11px] text-gray-500">
              Đang xem dữ liệu trong cây: <span className="font-semibold">{currentTreeLabel}</span>
            </p>
          )}

          {family && (
            <div className="mb-3 rounded-lg bg-gray-50 p-3 text-xs">
              <p className="mb-2 text-[11px] font-semibold text-gray-700">Gia đình</p>

              {family.parentFamily && (
                <div className="mb-2">
                  <p className="mb-1 text-[11px] font-semibold text-gray-600">Cha mẹ</p>
                  <div className="flex flex-col gap-1">
                    <div className="rounded border border-gray-100 bg-white px-2 py-1">
                      <p className="text-xs font-semibold text-gray-900">
                        {family.parentFamily.parent1.fullName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {family.parentFamily.parent1.gender} • Sinh:{" "}
                        {formatDate(family.parentFamily.parent1.dateOfBirth)}
                      </p>
                    </div>
                    <div className="rounded border border-gray-100 bg-white px-2 py-1">
                      <p className="text-xs font-semibold text-gray-900">
                        {family.parentFamily.parent2.fullName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {family.parentFamily.parent2.gender} • Sinh:{" "}
                        {formatDate(family.parentFamily.parent2.dateOfBirth)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {family.spouseFamilies.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-gray-600">
                    Vợ / chồng và con cái
                  </p>
                  {family.spouseFamilies.map((f) => {
                    const spouse =
                      f.parent1.id === family.person.id ? f.parent2 : f.parent1;
                    return (
                      <div
                        key={f.id}
                        className="rounded border border-gray-100 bg-white px-2 py-2"
                      >
                        <p className="text-xs font-semibold text-gray-900">
                          Vợ / chồng: {spouse.fullName}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {spouse.gender} • Sinh: {formatDate(spouse.dateOfBirth)} • Kiểu
                          quan hệ: {f.unionType}
                        </p>
                        {f.children.length > 0 && (
                          <div className="mt-1">
                            <p className="text-[11px] font-semibold text-gray-600">
                              Con cái:
                            </p>
                            <ul className="mt-1 space-y-0.5">
                              {f.children.map((c) => (
                                <li
                                  key={c.id}
                                  className="flex items-center justify-between text-[11px] text-gray-700"
                                >
                                  <span>{c.fullName}</span>
                                  <span className="text-gray-400">
                                    {c.gender} • Sinh: {formatDate(c.dateOfBirth)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Events list */}
          <div className="mb-3 rounded-lg bg-gray-50 p-3 text-xs">
            <p className="mb-1 text-[11px] font-semibold text-gray-700">Sự kiện tham gia</p>
            {events.length === 0 ? (
              <p className="text-[11px] text-gray-500">Chưa có sự kiện nào.</p>
            ) : (
              <ul className="space-y-1">
                {events.map((ev) => (
                  <li key={ev.id} className="rounded border border-gray-100 bg-white px-2 py-1">
                    <p className="text-xs font-semibold text-gray-900">{ev.name}</p>
                    <p className="text-[11px] text-gray-500">{ev.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Media upload for this person */}
          <div className="mb-3 rounded-lg bg-gray-50 p-3 text-xs">
            <p className="mb-2 text-[11px] font-semibold text-gray-700">
              Media gắn với person (cần treeId)
            </p>
            <form onSubmit={onUploadMedia} className="space-y-2">
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="w-full text-xs"
              />
              <select
                value={uploadTypeId}
                onChange={(e) => setUploadTypeId(e.target.value)}
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
                placeholder="Mô tả"
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-black"
              >
                Upload media cho person
              </button>
            </form>
            <div className="mt-2 space-y-1">
              {media.length === 0 && (
                <p className="text-[11px] text-gray-500">Chưa có media nào.</p>
              )}
              {media.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded border border-gray-100 bg-white px-2 py-1"
                >
                  <p className="truncate text-xs text-blue-700">{m.fileName}</p>
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md bg-white px-2 py-1 text-[10px] text-blue-700 hover:bg-blue-50"
                  >
                    Xem
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses of person */}
          <div className="rounded-lg bg-gray-50 p-3 text-xs">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-700">Địa chỉ</p>
              <button
                type="button"
                onClick={onAddAddress}
                className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-100"
              >
                Thêm địa chỉ mẫu
              </button>
            </div>
            <div className="space-y-1">
              {addresses.length === 0 && (
                <p className="text-[11px] text-gray-500">Chưa có địa chỉ nào.</p>
              )}
              {addresses.map((a) => (
                <div
                  key={a.id}
                  className="rounded border border-gray-100 bg-white px-2 py-1"
                >
                  <p className="text-xs text-gray-900">
                    {a.formattedAddress || "Địa chỉ không rõ"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {a.city} {a.province} {a.country}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

