import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as d3 from "d3";
import { toast } from "react-toastify";
import invitationService from "@/services/invitationService";
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

const ShareGraph = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const SVG_WIDTH = 900;
  const SVG_HEIGHT = 600;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Thiếu share token.");
      navigate("/");
      return;
    }
    loadGraph(token);
  }, [token, navigate]);

  const loadGraph = async (t: string) => {
    setLoading(true);
    try {
      const res = await invitationService.getShareGraph(t);
      renderGraph(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Không tải được cây chia sẻ.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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

    svg.attr("viewBox", `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`);

    const gRoot = svg.append("g").attr("transform", "translate(0,0)");

    const root = d3.hierarchy<TreeNode>(rootData);
    const treeLayout = d3.tree<TreeNode>().size([SVG_WIDTH - 100, SVG_HEIGHT - 100]);
    treeLayout(root);

    const zoomBehaviour = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2])
      .on("zoom", (event) => {
        gRoot.attr("transform", event.transform.toString());
      });

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
      .attr("fill", (d) => (d.depth === 0 ? "#16a34a" : "#4b5563"))
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
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Cây gia phả được chia sẻ (D3)
            </h1>
            <p className="text-xs text-gray-600">
              Hiển thị từ API /v1/share/graph với token chia sẻ.
            </p>
          </div>
          {loading && <span className="text-xs text-gray-500">Đang tải...</span>}
        </div>
        <div className="overflow-auto rounded-2xl border border-white bg-white/90 p-2 shadow">
          <svg ref={svgRef} className="h-[600px] w-full" />
        </div>
      </div>
    </div>
  );
};

export default ShareGraph;
