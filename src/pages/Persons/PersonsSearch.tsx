import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import personService from "@/services/personService";
import type { Person, PersonPage } from "@/types/person";

export default function PersonsSearch() {
  const [keyword, setKeyword] = useState("");
  const [pageData, setPageData] = useState<PersonPage | null>(null);
  const [loading, setLoading] = useState(false);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await personService.search(keyword, 0, 10);
      setPageData(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không tìm được nhân vật.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const persons: Person[] = pageData?.content ?? [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Tìm kiếm nhân vật</h1>
        <form onSubmit={onSearch} className="flex gap-2 text-sm">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Nhập tên hoặc CMND/CCCD..."
            className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </form>

        <div className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
          {persons.length === 0 ? (
            <p className="text-sm text-gray-600">Chưa có kết quả.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {persons.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{p.fullName}</p>
                    <p className="text-[11px] text-gray-500">
                      {p.gender} • Sinh: {p.dateOfBirth}
                    </p>
                  </div>
                  <Link
                    to={`/persons/${p.id}`}
                    className="rounded-md bg-gray-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-black"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

