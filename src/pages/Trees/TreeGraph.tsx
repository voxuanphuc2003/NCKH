import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as d3 from "d3";
import { toast } from "react-toastify";
import familyService from "@/services/familyService";
import type { GraphData } from "@/types/family";

interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}

const buildHierarchy = (graph: GraphData): TreeNode | null => {
  const personMap = new Map(graph.persons.map((p) => [p.id, p]));

  const childrenByParent = new Map<string, string[]>();
  graph.families.forEach((f) => {
    const parents = [f.parent1Id, f.parent2Id].filter(Boolean) as string[];
    parents.forEach((pid) => {
      const current = childrenByParent.get(pid) ?? [];
      childrenByParent.set(pid, [...current, ...f.childrenIds]);
    });
  });

  const visited = new Set<string>();

  const buildNode = (personId: string): TreeNode | null => {
    const p = personMap.get(personId);
    if (!p || visited.has(personId)) return null;
    visited.add(personId);

    const childIds = childrenByParent.get(personId) ?? [];
    const children: TreeNode[] = [];
    childIds.forEach((cid) => {
      const childNode = buildNode(cid);
      if (childNode) children.push(childNode);
    });

    return {
      id: p.id,
      name: p.fullName || `${p.firstName} ${p.lastName}`,
      children,
    };
  };

  return buildNode(graph.meta.rootPersonId) ?? null;
};

const TreeGraph = () => {
  const { id } = useParams<{ id: string }>();
  const treeId = id!;
  const navigate = useNavigate();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const graphRef = useRef<GraphData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      toast.info("Vui lòng đăng nhập.");
      navigate("/login");
      return;
    }
    loadGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeId]);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const res = await familyService.getGraph(treeId);
      graphRef.current = res.data;
      renderGraph(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không tải được dữ liệu cây gia phả.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fitToView = () => {
    const svgEl = svgRef.current;
    const graph = graphRef.current;
    const zoom = zoomRef.current;
    if (!svgEl || !graph || !zoom) return;

    const svg = d3.select(svgEl);
    const g = svg.select<SVGGElement>("g.__graph_root");
    if (g.empty()) return;

    const bbox = (g.node() as SVGGElement).getBBox();
    const width = 900;
    const height = 600;
    const padding = 40;

    if (bbox.width === 0 || bbox.height === 0) {
      svg.transition().duration(250).call(zoom.transform as any, d3.zoomIdentity);
      return;
    }

    const scale = Math.max(
      0.3,
      Math.min(2, Math.min((width - padding * 2) / bbox.width, (height - padding * 2) / bbox.height)),
    );

    const tx = (width - bbox.width * scale) / 2 - bbox.x * scale;
    const ty = (height - bbox.height * scale) / 2 - bbox.y * scale;
    const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);
    svg.transition().duration(300).call(zoom.transform as any, transform);
  };

  const zoomBy = (factor: number) => {
    const svgEl = svgRef.current;
    const zoom = zoomRef.current;
    if (!svgEl || !zoom) return;
    d3.select(svgEl).transition().duration(150).call(zoom.scaleBy as any, factor);
  };

  const resetZoom = () => {
    const svgEl = svgRef.current;
    const zoom = zoomRef.current;
    if (!svgEl || !zoom) return;
    d3.select(svgEl).transition().duration(200).call(zoom.transform as any, d3.zoomIdentity);
  };

  const renderGraph = (graph: GraphData) => {
    const rootData = buildHierarchy(graph);
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (!rootData) {
      svg
        .append("text")
        .attr("x", 20)
        .attr("y", 40)
        .attr("fill", "#6b7280")
        .text("Không có dữ liệu để vẽ cây gia phả.");
      return;
    }

    const width = 900;
    const height = 600;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const gRoot = svg
      .append("g")
      .attr("class", "__graph_root")
      .attr("transform", "translate(0,0)");

    const root = d3.hierarchy<TreeNode>(rootData);
    const treeLayout = d3.tree<TreeNode>().size([width - 100, height - 100]);
    treeLayout(root);

    const zoomBehaviour = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2])
      .on("zoom", (event) => {
        gRoot.attr("transform", event.transform.toString());
      });

    zoomRef.current = zoomBehaviour;
    svg.call(zoomBehaviour as any);

    gRoot
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#cbd5f5")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links() as any)
      .enter()
      .append("path")
      .attr("d", (d: any) => {
        const source: any = d.source || { x: 0, y: 0 };
        const target: any = d.target || { x: 0, y: 0 };
        const sx = (typeof source.x === "number" ? source.x : 0) + 50;
        const sy = (typeof source.y === "number" ? source.y : 0) + 40;
        const tx = (typeof target.x === "number" ? target.x : 0) + 50;
        const ty = (typeof target.y === "number" ? target.y : 0) + 40;
        return `M${sx},${sy}L${tx},${ty}`;
      });

    const node = gRoot
      .append("g")
      .selectAll("g")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("transform", (d: any) => `translate(${(d.x ?? 0) + 50},${(d.y ?? 0) + 40})`);

    node
      .append("circle")
      .attr("r", 18)
      .attr("fill", (d) => (d.depth === 0 ? "#2563eb" : "#4b5563"))
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1.5);

    node
      .append("text")
      .attr("dy", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#111827")
      .attr("font-size", 10)
      .text((d) => d.data.name);

    node
      .append("title")
      .text((d) => {
        const person = graph.persons.find((p) => p.id === d.data.id);
        if (!person) return d.data.name;
        const gen = typeof person.generation === "number" ? person.generation : undefined;
        return [
          person.fullName || d.data.name,
          gen !== undefined ? `Thế hệ: ${gen}` : "",
          person.dateOfBirth ? `Sinh: ${person.dateOfBirth}` : "",
          person.dateOfDeath ? `Mất: ${person.dateOfDeath}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      });

    // Initial fit so users see the whole tree
    queueMicrotask(() => fitToView());
  };

  const hintText = useMemo(() => {
    return "Kéo để pan • Lăn chuột để zoom • Dùng nút +/−/Fit/Reset";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(`/trees/${treeId}`)}
              className="mb-1 text-xs text-blue-600 hover:underline"
            >
              ← Quay lại chi tiết cây
            </button>
            <h1 className="text-xl font-bold text-gray-900">Sơ đồ cây gia phả (D3)</h1>
            <p className="text-xs text-gray-600">
              Cây được vẽ từ API /v1/trees/{treeId}/graph
            </p>
            <p className="mt-1 text-[11px] text-gray-500">{hintText}</p>
          </div>
          {loading && <span className="text-xs text-gray-500">Đang tải...</span>}
        </div>
        <div className="relative overflow-auto rounded-2xl border border-white bg-white/90 p-2 shadow">
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => zoomBy(1.2)}
              className="rounded-md bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white shadow hover:bg-black"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => zoomBy(0.8)}
              className="rounded-md bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white shadow hover:bg-black"
            >
              −
            </button>
            <button
              type="button"
              onClick={fitToView}
              className="rounded-md bg-white px-3 py-2 text-[11px] font-semibold text-slate-800 shadow hover:bg-slate-50"
            >
              Fit
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="rounded-md bg-white px-3 py-2 text-[11px] font-semibold text-slate-800 shadow hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
          <svg ref={svgRef} className="h-[600px] w-full" />
        </div>
      </div>
    </div>
  );
};

export default TreeGraph;
