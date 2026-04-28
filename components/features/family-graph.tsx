'use client';

import { useMemo, useCallback, useState, type CSSProperties } from 'react';
import { NodeMouseHandler } from '@xyflow/react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyTreeData } from '@/types/family';
import GraphNode from './graph-node';
import SpouseRingNode from './spouse-ring-node';
import PersonDetailsPanel from './person-details-panel';
import { buildGraphLayout } from '@/lib/family-tree/graphLayout';
import { findMainPersonId, getPersonFullName, findAllAncestorIds, findAllDescendantIds } from '@/lib/utils';
import { treeEdge } from '@/lib/theme';
import { useI18n } from '@/components/providers/i18n-provider';
import { useTheme } from '@/components/providers/theme-provider';

interface Props {
  data: FamilyTreeData;
  className?: string;
  currentUserEmail?: string;
  treeId?: string | null;
  onDeletePerson?: (personId: string) => void;
}

const nodeTypes = { graphNode: GraphNode, spouseRingNode: SpouseRingNode };

export default function FamilyGraph({
  data,
  className = '',
  currentUserEmail,
  treeId,
  onDeletePerson,
}: Props) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const layoutResult = useMemo(() => buildGraphLayout(data), [data]);

  const directLineEdgeIds = useMemo(() => {
    if (!selectedNodeId) return null;
    const ancestorIds = new Set(findAllAncestorIds(selectedNodeId, data.relationships));
    const descendantIds = new Set(findAllDescendantIds(selectedNodeId, data.relationships));
    const direct = new Set<string>();
    layoutResult.edges.forEach((e) => {
      const onAncestorLine = e.target === selectedNodeId || ancestorIds.has(e.target);
      const onDescendantLine = e.source === selectedNodeId || descendantIds.has(e.source);
      if (onAncestorLine || onDescendantLine) direct.add(e.id);
    });
    return direct;
  }, [selectedNodeId, data.relationships, layoutResult.edges]);

  const edgesWithOpacity = useMemo(() => {
    if (!directLineEdgeIds) return layoutResult.edges;
    return layoutResult.edges.map((e) => ({
      ...e,
      style: { ...(e.style ?? {}), opacity: directLineEdgeIds.has(e.id) ? 1 : 0.1},
    }));
  }, [layoutResult.edges, directLineEdgeIds]);

  const nodesWithSelection = useMemo(() => {
    return layoutResult.nodes.map((n) => {
      if (n.type === 'graphNode' && n.data) {
        return { ...n, data: { ...n.data, isSelected: n.id === selectedNodeId } };
      }
      return n;
    });
  }, [layoutResult.nodes, selectedNodeId]);

  const mainPersonId = useMemo(
    () => findMainPersonId(data.persons, data.relationships, currentUserEmail),
    [data.persons, data.relationships, currentUserEmail]
  );
  const selectedPerson = useMemo(
    () => (selectedNodeId ? data.persons.find((p) => p.id === selectedNodeId) ?? null : null),
    [selectedNodeId, data.persons]
  );
  const fullName = selectedPerson ? getPersonFullName(selectedPerson) : '';

  const onInit = useCallback((instance: { fitView: (opts?: { padding?: number }) => void }) => {
    instance?.fitView({ padding: 0.2 });
  }, []);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const reactFlowStyle: CSSProperties = {
    backgroundColor: 'transparent',
    ...(theme === 'dark'
      ? {
          '--xy-controls-button-background-color': '#f1f5f9',
          '--xy-controls-button-background-color-hover': '#ffffff',
          '--xy-controls-button-color': '#0f172a',
          '--xy-controls-button-color-hover': '#020617',
          '--xy-controls-button-border-color': '#94a3b8',
          '--xy-controls-box-shadow': '0 10px 25px -12px rgba(0, 0, 0, 0.45)',
          '--xy-minimap-background-color': 'rgba(241, 245, 249, 0.96)',
          '--xy-minimap-mask-background-color': 'rgba(15, 23, 42, 0.15)',
          '--xy-minimap-mask-stroke-color': '#64748b',
          '--xy-minimap-mask-stroke-width': 1,
          '--xy-minimap-node-background-color': '#94a3b8',
          '--xy-minimap-node-stroke-color': '#475569',
        }
      : {}),
  } as CSSProperties;

  if (data.persons.length === 0) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-stone-100 dark:bg-slate-950 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">{t("familyGraph.empty")}</p>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-stone-100 dark:bg-slate-950 dark:[&_.react-flow\\_\\_background]:opacity-40 dark:[&_.react-flow\\_\\_controls]:overflow-hidden dark:[&_.react-flow\\_\\_controls]:rounded-xl dark:[&_.react-flow\\_\\_controls]:border dark:[&_.react-flow\\_\\_controls]:border-slate-500 dark:[&_.react-flow\\_\\_controls]:bg-slate-100/95 dark:[&_.react-flow\\_\\_controls]:shadow-lg dark:[&_.react-flow\\_\\_controls]:shadow-black/30 dark:[&_.react-flow\\_\\_controls-button]:border-slate-300 dark:[&_.react-flow\\_\\_controls-button]:bg-slate-100 dark:[&_.react-flow\\_\\_controls-button]:text-slate-900 dark:[&_.react-flow\\_\\_controls-button:hover]:bg-white dark:[&_.react-flow\\_\\_controls-button_svg]:text-slate-900 dark:[&_.react-flow\\_\\_controls-button_svg]:fill-none dark:[&_.react-flow\\_\\_controls-button_svg]:stroke-current dark:[&_.react-flow\\_\\_controls-button_svg]:opacity-100 dark:[&_.react-flow\\_\\_controls-button_svg_path]:stroke-current dark:[&_.react-flow\\_\\_controls-button_svg_path]:fill-none dark:[&_.react-flow\\_\\_minimap]:rounded-xl dark:[&_.react-flow\\_\\_minimap]:border dark:[&_.react-flow\\_\\_minimap]:border-slate-500 dark:[&_.react-flow\\_\\_minimap]:bg-slate-100/95 dark:[&_.react-flow\\_\\_minimap]:shadow-lg dark:[&_.react-flow\\_\\_minimap]:shadow-black/30 ${className}`}
    >
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edgesWithOpacity}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        onInit={onInit}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        defaultEdgeOptions={{ type: 'step', style: { stroke: treeEdge, strokeWidth: 2 } }}
        proOptions={{ hideAttribution: true }}
        style={reactFlowStyle}
      >
        <Background color="#94a3b8" gap={20} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {selectedPerson && (
        <PersonDetailsPanel
          person={selectedPerson}
          fullName={fullName}
          onClose={() => setSelectedNodeId(null)}
          isMainPerson={mainPersonId === selectedPerson.id}
          onDelete={onDeletePerson}
          persons={data.persons}
          relationships={data.relationships}
          treeId={treeId}
        />
      )}
    </div>
  );
}
