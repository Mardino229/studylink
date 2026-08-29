import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, ChevronDown, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { MindMapNode } from '../../types/workspace';
import { renderMarkdown } from '../../utils/mk';
import ReactMarkdown from 'react-markdown';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkToc from 'remark-toc';
import Mermaid from '../ui/Mermaid';

// ── Layout constants ──────────────────────────────────────
const NODE_W = 168;
const LEAF_H = 68;
const LEVEL_W = 240;
const PAD_X = 32;
const PAD_Y = 40;
const MIN_H = 400;
const NODE_VH = 44;

// ── Minimap constants ─────────────────────────────────────
const MM_W = 180;
const MM_H = 110;

// ── Branch colour palette ─────────────────────────────────
const PALETTE = [
    { line: '#6366f1', cls: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200' },
    { line: '#10b981', cls: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200' },
    { line: '#f59e0b', cls: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200' },
    { line: '#ec4899', cls: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-700 text-pink-800 dark:text-pink-200' },
    { line: '#06b6d4', cls: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-700 text-cyan-800 dark:text-cyan-200' },
    { line: '#8b5cf6', cls: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-700 text-violet-800 dark:text-violet-200' },
    { line: '#f97316', cls: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-200' },
    { line: '#14b8a6', cls: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-200' },
];

// ── Tree layout helpers ───────────────────────────────────
function countLeaves(node: MindMapNode, collapsed: ReadonlySet<string>): number {
    if (collapsed.has(node.id) || node.children.length === 0) return 1;
    return node.children.reduce((s, c) => s + countLeaves(c, collapsed), 0);
}

interface Placed {
    node: MindMapNode;
    x: number;
    y: number;
    colorIdx: number;
    parentId: string | null;
}

function placeTree(
    node: MindMapNode,
    x: number,
    yTop: number,
    yBot: number,
    colorIdx: number,
    parentId: string | null,
    collapsed: ReadonlySet<string>,
    out: Placed[],
) {
    out.push({ node, x, y: (yTop + yBot) / 2, colorIdx, parentId });
    if (collapsed.has(node.id) || !node.children.length) return;
    const total = countLeaves(node, collapsed);
    let off = yTop;
    node.children.forEach((child, i) => {
        const leaves = countLeaves(child, collapsed);
        const slot = (yBot - yTop) * (leaves / total);
        const childColor = colorIdx < 0 ? i % PALETTE.length : colorIdx;
        placeTree(child, x + LEVEL_W, off, off + slot, childColor, node.id, collapsed, out);
        off += slot;
    });
}

function layoutDimensions(nodes: Placed[]) {
    return {
        w: Math.max(...nodes.map(p => p.x)) + NODE_W + PAD_X * 2,
        h: Math.max(...nodes.map(p => p.y)) + NODE_VH / 2 + PAD_Y,
    };
}

// ── Component ─────────────────────────────────────────────
export interface MindmapRendererProps {
    root: MindMapNode;
}

export default function MindmapRenderer({ root }: MindmapRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: PAD_X, y: PAD_Y });
    const dragging = useRef(false);
    const dragOrigin = useRef({ x: 0, y: 0 });
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const prevRootIdRef = useRef<string | undefined>(undefined);

    // Build layout
    const placed = useMemo(() => {
        const nodes: Placed[] = [];
        const leaves = countLeaves(root, collapsed);
        const totalH = Math.max(leaves * LEAF_H, MIN_H);
        placeTree(root, PAD_X, 0, totalH, -1, null, collapsed, nodes);
        return nodes;
    }, [root, collapsed]);

    const canvasW = useMemo(() => layoutDimensions(placed).w, [placed]);
    const canvasH = useMemo(() => layoutDimensions(placed).h, [placed]);

    const byId = useMemo(() => {
        const m = new Map<string, Placed>();
        placed.forEach(p => m.set(p.node.id, p));
        return m;
    }, [placed]);

    // Fit tree to visible container area
    const fitToContainer = useCallback(() => {
        const container = containerRef.current;
        if (!container || canvasW <= 0 || canvasH <= 0) return;
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const z = Math.max(0.25, Math.min(2.5, Math.min(cw / canvasW, ch / canvasH) * 0.88));
        setPan({ x: (cw - canvasW * z) / 2, y: (ch - canvasH * z) / 2 });
        setZoom(z);
    }, [canvasW, canvasH]);

    // Auto-fit and reset collapse when root changes (new mindmap selected)
    useEffect(() => {
        if (prevRootIdRef.current === root.id) return;
        prevRootIdRef.current = root.id;
        setCollapsed(new Set());
        // Compute full-expanded layout to get true canvas size before fitToContainer runs
        const frameId = requestAnimationFrame(() => {
            const container = containerRef.current;
            if (!container) return;
            const emptySet = new Set<string>();
            const nodes: Placed[] = [];
            const leaves = countLeaves(root, emptySet);
            placeTree(root, PAD_X, 0, Math.max(leaves * LEAF_H, MIN_H), -1, null, emptySet, nodes);
            const { w: cW, h: cH } = layoutDimensions(nodes);
            const cw = container.clientWidth;
            const ch = container.clientHeight;
            const z = Math.max(0.25, Math.min(2.5, Math.min(cw / cW, ch / cH) * 0.88));
            setPan({ x: (cw - cW * z) / 2, y: (ch - cH * z) / 2 });
            setZoom(z);
        });
        return () => cancelAnimationFrame(frameId);
    }, [root]);

    // Pan handlers
    const onPointerDown = useCallback((e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-node]')) return;
        dragging.current = true;
        dragOrigin.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }, [pan]);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragging.current) return;
        setPan({ x: e.clientX - dragOrigin.current.x, y: e.clientY - dragOrigin.current.y });
    }, []);

    const onPointerUp = useCallback(() => { dragging.current = false; }, []);

    // Zoom on wheel
    const onWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.1 : 0.91;
        const rect = containerRef.current!.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        setZoom(z => {
            const next = Math.max(0.25, Math.min(2.5, z * factor));
            const s = next / z;
            setPan(p => ({ x: mx - s * (mx - p.x), y: my - s * (my - p.y) }));
            return next;
        });
    }, []);

    const toggleCollapse = (id: string) => {
        setCollapsed(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const collapseAll = () => {
        const ids = new Set<string>();
        function walk(n: MindMapNode) { if (n.children.length) { ids.add(n.id); n.children.forEach(walk); } }
        root.children.forEach(walk);
        setCollapsed(ids);
    };
    const expandAll = () => setCollapsed(new Set());

    // ── Minimap ───────────────────────────────────────────
    const mmScale = Math.min(MM_W / canvasW, MM_H / canvasH) * 0.9;
    const mmOffX = (MM_W - canvasW * mmScale) / 2;
    const mmOffY = (MM_H - canvasH * mmScale) / 2;
    const contW = containerRef.current?.clientWidth ?? 0;
    const contH = containerRef.current?.clientHeight ?? 0;
    const mmVpX = mmOffX + (-pan.x / zoom) * mmScale;
    const mmVpY = mmOffY + (-pan.y / zoom) * mmScale;
    const mmVpW = (contW / zoom) * mmScale;
    const mmVpH = (contH / zoom) * mmScale;

    const onMinimapPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left - mmOffX;
        const my = e.clientY - rect.top - mmOffY;
        const cx = mx / mmScale;
        const cy = my / mmScale;
        const container = containerRef.current;
        if (!container) return;
        setPan({
            x: -(cx * zoom) + container.clientWidth / 2,
            y: -(cy * zoom) + container.clientHeight / 2,
        });
    };

    return (
        <div className="flex flex-col h-full gap-2">
            {/* Toolbar */}
            <div className="flex shrink-0 items-center gap-2 px-1">
                <div className="flex items-center rounded-xl border border-border bg-background">
                    <button onClick={() => setZoom(z => Math.max(0.25, z - 0.15))} className="flex h-8 w-8 items-center justify-center rounded-l-xl text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-all disabled:opacity-30" disabled={zoom <= 0.25}><ZoomOut size={15} /></button>
                    <span className="min-w-[3.5rem] text-center text-xs font-medium text-foreground/60 tabular-nums">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(2.5, z + 0.15))} className="flex h-8 w-8 items-center justify-center rounded-r-xl text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-all disabled:opacity-30" disabled={zoom >= 2.5}><ZoomIn size={15} /></button>
                </div>
                <button onClick={fitToContainer} className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-all" title="Ajuster à l'écran"><Maximize2 size={14} /></button>
                <div className="h-4 w-px bg-border" />
                <button onClick={expandAll} className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-foreground/5 transition-all">Tout développer</button>
                <button onClick={collapseAll} className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-foreground/5 transition-all">Tout réduire</button>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-gray-50/50 dark:bg-gray-900/40 cursor-grab active:cursor-grabbing select-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onWheel={onWheel}
                style={{ touchAction: 'none' }}
            >
                <div
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: '0 0',
                        width: canvasW,
                        height: canvasH,
                        position: 'relative',
                    }}
                >
                    {/* SVG edges */}
                    <svg
                        style={{ position: 'absolute', inset: 0, width: canvasW, height: canvasH, overflow: 'visible', pointerEvents: 'none' }}
                    >
                        {placed.map(({ node, x, y, colorIdx, parentId }) => {
                            if (!parentId) return null;
                            const parent = byId.get(parentId);
                            if (!parent) return null;
                            const x1 = parent.x + NODE_W;
                            const y1 = parent.y;
                            const x2 = x;
                            const y2 = y;
                            const cx = (x1 + x2) / 2;
                            const color = colorIdx >= 0 ? PALETTE[colorIdx].line : '#94a3b8';
                            return (
                                <path
                                    key={node.id}
                                    d={`M ${x1} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={1.5}
                                    strokeOpacity={0.7}
                                />
                            );
                        })}
                    </svg>

                    {/* Nodes */}
                    {placed.map(({ node, x, y, colorIdx }) => {
                        const isRoot = colorIdx < 0;
                        const hasChildren = node.children.length > 0;
                        const isCollapsed = collapsed.has(node.id);
                        const isHovered = hoveredId === node.id;
                        const palette = colorIdx >= 0 ? PALETTE[colorIdx] : null;

                        return (
                            <div
                                key={node.id}
                                data-node="1"
                                style={{
                                    position: 'absolute',
                                    left: x,
                                    top: y - NODE_VH / 2,
                                    width: NODE_W,
                                    minHeight: NODE_VH,
                                    zIndex: isHovered ? 10 : 1,
                                }}
                                onMouseEnter={() => setHoveredId(node.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {/* Node box */}
                                <div
                                    className={`relative flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm transition-shadow ${
                                        isRoot
                                            ? 'bg-blue-600 border-blue-700 text-white shadow-md'
                                            : palette
                                                ? `${palette.cls} shadow-sm`
                                                : 'bg-white dark:bg-gray-800 border-border text-foreground'
                                    } ${hasChildren ? 'cursor-pointer hover:shadow-md' : ''}`}
                                    onClick={hasChildren ? () => toggleCollapse(node.id) : undefined}
                                    style={{ minHeight: NODE_VH }}
                                >
                                    <span className={`flex-1 text-xs font-semibold leading-tight ${isRoot ? 'text-white' : ''}`}>
                                        {renderMarkdown(node.label)}
                                    </span> 
                                    {hasChildren && ( 
                                        <span className={`shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                            isRoot ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10 text-current'
                                        }`}>
                                            {isCollapsed
                                                ? <ChevronRight size={11} />
                                                : <ChevronDown size={11} />
                                            }
                                        </span>
                                    )}
                                </div>

                                {/* Description tooltip */}
                                {isHovered && node.description && (
                                    <div
                                        className="absolute left-0 top-full mt-1.5 z-50 w-56 rounded-xl border border-border bg-white dark:bg-gray-900 px-3 py-2 shadow-xl"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        <p className="text-xs text-foreground/70 leading-relaxed">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkMath, remarkGfm, remarkBreaks, remarkEmoji, [remarkToc, { heading: "sommaire|toc|table of contents" }]]}
                                                rehypePlugins={[rehypeKatex, rehypeSlug, rehypeAutolinkHeadings, rehypeRaw]}
                                                components={{
                                                    code({ node, className, children, ...props }: any) {
                                                        const match = /language-(\w+)/.exec(className || "");
                                                        return match && match[1] === "mermaid" ? (
                                                            <Mermaid chart={String(children).replace(/\n$/, "")} />
                                                        ) : (
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                }} 
                                            >
                                                {node.description}

                                            </ReactMarkdown>
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Minimap */}
                <svg
                    width={MM_W}
                    height={MM_H}
                    onPointerDown={onMinimapPointerDown}
                    className="absolute bottom-8 right-4 rounded-xl border border-border bg-white/85 dark:bg-gray-950/85 backdrop-blur-sm shadow-lg cursor-pointer"
                    style={{ pointerEvents: 'all' }}
                >
                    {placed.map(({ node, x, y, colorIdx }) => {
                        const color = colorIdx < 0 ? '#3b82f6' : PALETTE[colorIdx].line;
                        return (
                            <rect
                                key={node.id}
                                x={mmOffX + x * mmScale}
                                y={mmOffY + (y - NODE_VH / 2) * mmScale}
                                width={Math.max(1, NODE_W * mmScale)}
                                height={Math.max(1, NODE_VH * mmScale)}
                                rx={2}
                                fill={color}
                                opacity={0.65}
                            />
                        );
                    })}
                    {/* Viewport indicator */}
                    <rect
                        x={mmVpX}
                        y={mmVpY}
                        width={Math.max(4, mmVpW)}
                        height={Math.max(4, mmVpH)}
                        fill="#6366f1"
                        fillOpacity={0.08}
                        stroke="#6366f1"
                        strokeWidth={1.5}
                        rx={3}
                    />
                </svg>

                {/* Hint */}
                <p className="pointer-events-none absolute bottom-3 left-4 text-[10px] text-foreground/30 select-none">
                    Scroll pour zoomer · Glisser pour déplacer · Clic pour développer
                </p>
            </div>
        </div>
    );
}
