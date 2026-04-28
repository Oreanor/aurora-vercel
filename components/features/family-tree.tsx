'use client';

import type { CSSProperties } from 'react';

import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyTreeData } from '@/types/family';
import FamilyNode from './family-node';
import SpouseRingNode from './spouse-ring-node';
import PersonDetailsPanel from './person-details-panel';
import AddPersonPanel from './add-person-panel';
import { useFamilyTree } from './family-tree/useFamilyTree';
import FlowContent from './family-tree/FlowContent';
import RootUserDialog from './family-tree/RootUserDialog';
import FamilyTreeToolbar from './family-tree/FamilyTreeToolbar';
import { useTheme } from '@/components/providers/theme-provider';

interface Props {
  data: FamilyTreeData;
  className?: string;
  currentUserEmail?: string;
  treeId?: string | null;
}

const nodeTypes = {
  familyNode: FamilyNode,
  spouseRingNode: SpouseRingNode,
};

export default function FamilyTree({
  data: initialData,
  className = '',
  currentUserEmail,
  treeId,
}: Props) {
  const { theme } = useTheme();
  const {
    data,
    nodes,
    edges,
    branchNodes,
    branchEdges,
    viewport,
    setViewport,
    isFitted,
    handleFitted,
    showDescendants,
    setShowDescendants,
    setSelectedNodeId,
    selectedPerson,
    mainPersonId,
    expandedSiblingId,
    expandedSiblingPerson,
    isAddPanelOpen,
    setIsAddPanelOpen,
    isEditPanelOpen,
    setIsEditPanelOpen,
    personToEdit,
    setPersonToEdit,
    isRootUserDialogOpen,
    tempSelectedRootPersonId,
    setTempSelectedRootPersonId,
    onNodeClick,
    onPaneClick,
    handleAddPerson,
    handleDeletePerson,
    handleEditPerson,
    handleUpdatePerson,
    handleRebuildTree,
    handleCancelRootUser,
    handleCloseSiblingBranch,
    openRootDialog,
    fullName,
  } = useFamilyTree({ initialData, currentUserEmail });

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

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-stone-100 dark:bg-slate-950 dark:[&_.react-flow\\_\\_background]:opacity-40 dark:[&_.react-flow\\_\\_controls]:overflow-hidden dark:[&_.react-flow\\_\\_controls]:rounded-xl dark:[&_.react-flow\\_\\_controls]:border dark:[&_.react-flow\\_\\_controls]:border-slate-500 dark:[&_.react-flow\\_\\_controls]:bg-slate-100/95 dark:[&_.react-flow\\_\\_controls]:shadow-lg dark:[&_.react-flow\\_\\_controls]:shadow-black/30 dark:[&_.react-flow\\_\\_controls-button]:border-slate-300 dark:[&_.react-flow\\_\\_controls-button]:bg-slate-100 dark:[&_.react-flow\\_\\_controls-button]:text-slate-900 dark:[&_.react-flow\\_\\_controls-button:hover]:bg-white dark:[&_.react-flow\\_\\_controls-button_svg]:text-slate-900 dark:[&_.react-flow\\_\\_controls-button_svg]:fill-none dark:[&_.react-flow\\_\\_controls-button_svg]:stroke-current dark:[&_.react-flow\\_\\_controls-button_svg]:opacity-100 dark:[&_.react-flow\\_\\_controls-button_svg_path]:stroke-current dark:[&_.react-flow\\_\\_controls-button_svg_path]:fill-none dark:[&_.react-flow\\_\\_minimap]:rounded-xl dark:[&_.react-flow\\_\\_minimap]:border dark:[&_.react-flow\\_\\_minimap]:border-slate-500 dark:[&_.react-flow\\_\\_minimap]:bg-slate-100/95 dark:[&_.react-flow\\_\\_minimap]:shadow-lg dark:[&_.react-flow\\_\\_minimap]:shadow-black/30 ${className}`}
    >
      <FamilyTreeToolbar
        expandedSiblingPerson={expandedSiblingPerson}
        showDescendants={showDescendants}
        onAddPerson={() => {
          setIsAddPanelOpen(true);
          setSelectedNodeId(null);
        }}
        onFlipTree={() => setShowDescendants((prev) => !prev)}
        onSetRoot={openRootDialog}
        onCloseBranch={handleCloseSiblingBranch}
        flipDisabled={!!expandedSiblingId}
      />

      <div className="relative h-full w-full bg-gradient-to-b from-amber-100 via-stone-100 to-stone-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView={false}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
            viewport={viewport}
            onViewportChange={setViewport}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            style={{
              ...reactFlowStyle,
              opacity: isFitted ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
          >
            <FlowContent nodes={nodes} onFitted={handleFitted} />
            <Background color="#94a3b8" gap={20} size={1} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {expandedSiblingId && branchNodes.length > 0 && (
          <div
            className="pointer-events-none absolute inset-0 bg-stone-100/70 dark:bg-slate-950/60"
            aria-hidden
          />
        )}

        {expandedSiblingId && branchNodes.length > 0 && (
          <div className="absolute inset-0 pointer-events-none [&_.react-flow__node]:pointer-events-auto">
            <ReactFlow
              nodes={branchNodes}
              edges={branchEdges}
              nodeTypes={nodeTypes}
              fitView={false}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable
              viewport={viewport}
              onViewportChange={setViewport}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              proOptions={{ hideAttribution: true }}
            />
          </div>
        )}
      </div>

      {selectedPerson && !isAddPanelOpen && !isEditPanelOpen && (
        <PersonDetailsPanel
          person={selectedPerson}
          fullName={fullName}
          onClose={() => setSelectedNodeId(null)}
          isMainPerson={mainPersonId === selectedPerson.id}
          onDelete={handleDeletePerson}
          onEdit={handleEditPerson}
          persons={data.persons}
          relationships={data.relationships}
          treeId={treeId}
        />
      )}

      {isAddPanelOpen && !isEditPanelOpen && (
        <AddPersonPanel
          onClose={() => setIsAddPanelOpen(false)}
          onSave={handleAddPerson}
          persons={data.persons}
          relationships={data.relationships}
          mainPersonId={mainPersonId}
        />
      )}

      {isEditPanelOpen && personToEdit && (
        <AddPersonPanel
          onClose={() => {
            setIsEditPanelOpen(false);
            setPersonToEdit(null);
          }}
          onSave={handleAddPerson}
          onUpdate={handleUpdatePerson}
          persons={data.persons}
          relationships={data.relationships}
          mainPersonId={mainPersonId}
          personToEdit={personToEdit}
        />
      )}

      {isRootUserDialogOpen && (
        <RootUserDialog
          persons={data.persons}
          tempSelectedRootPersonId={tempSelectedRootPersonId}
          onSelect={setTempSelectedRootPersonId}
          onConfirm={handleRebuildTree}
          onCancel={handleCancelRootUser}
        />
      )}
    </div>
  );
}
