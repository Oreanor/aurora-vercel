'use client';

import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { NodeMouseHandler } from '@xyflow/react';
import { FamilyTreeData } from '@/types/family';
import { findMainPersonId, getPersonFullName } from '@/lib/utils';
import { transformToFlowData } from '@/lib/family-tree/transformToFlowData';
import { useTreePanels } from './useTreePanels';
import { useTreeRootUser } from './useTreeRootUser';

interface UseFamilyTreeProps {
  initialData: FamilyTreeData;
  currentUserEmail?: string;
}

export function useFamilyTree({ initialData, currentUserEmail }: UseFamilyTreeProps) {
  const [data, setData] = useState<FamilyTreeData>(initialData);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedRootPersonId, setSelectedRootPersonId] = useState<string | null>(null);
  const [isFitted, setIsFitted] = useState(false);
  const [showDescendants, setShowDescendants] = useState(false);
  const [expandedSiblingId, setExpandedSiblingId] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const prevPersonsCountRef = useRef(0);
  const nodesCountRef = useRef(0);

  useEffect(() => {
    const personsCount = initialData.persons.length;
    const prev = prevPersonsCountRef.current;
    setData(initialData);
    if (personsCount !== prev) {
      prevPersonsCountRef.current = personsCount;
      setIsFitted(false);
    }
  }, [initialData]);

  const handleFitted = useCallback(() => setIsFitted(true), []);
  const resetFit = useCallback(() => setIsFitted(false), []);
  const clearExpandedSibling = useCallback(() => setExpandedSiblingId(null), []);

  const rootUserEmail = useMemo(() => {
    if (selectedRootPersonId) {
      const p = data.persons.find((x) => x.id === selectedRootPersonId);
      return p?.email ?? undefined;
    }
    return currentUserEmail;
  }, [selectedRootPersonId, data.persons, currentUserEmail]);

  const mainPersonId = useMemo(
    () => findMainPersonId(data.persons, data.relationships, rootUserEmail),
    [data.persons, data.relationships, rootUserEmail]
  );

  const panels = useTreePanels({ data, setData, selectedNodeId, setSelectedNodeId });

  const rootUser = useTreeRootUser({
    selectedNodeId,
    mainPersonId,
    selectedRootPersonId,
    setSelectedRootPersonId,
    onResetFit: resetFit,
    onClearExpandedSibling: clearExpandedSibling,
  });

  const handleSiblingExpand = useCallback(
    (personId: string) => {
      const willClose = expandedSiblingId === personId;
      setExpandedSiblingId(willClose ? null : personId);
      setSelectedNodeId(willClose ? null : personId);
    },
    [expandedSiblingId]
  );

  const flowData = useMemo(
    () =>
      transformToFlowData(
        data,
        rootUserEmail,
        selectedNodeId ?? undefined,
        selectedRootPersonId ?? undefined,
        showDescendants,
        handleSiblingExpand,
        expandedSiblingId
      ),
    [data, rootUserEmail, selectedNodeId, selectedRootPersonId, showDescendants, handleSiblingExpand, expandedSiblingId]
  );

  const { nodes, edges, branchNodes = [], branchEdges = [] } = flowData;

  useEffect(() => {
    if (nodes.length !== nodesCountRef.current) {
      nodesCountRef.current = nodes.length;
      setIsFitted(false);
    }
  }, [nodes.length]);

  useEffect(() => { setIsFitted(false); }, [selectedRootPersonId]);
  useEffect(() => { if (expandedSiblingId) setIsFitted(false); }, [expandedSiblingId]);

  const selectedPerson = useMemo(
    () => (selectedNodeId ? data.persons.find((p) => p.id === selectedNodeId) ?? null : null),
    [selectedNodeId, data.persons]
  );

  const expandedSiblingPerson = expandedSiblingId
    ? data.persons.find((p) => p.id === expandedSiblingId) ?? null
    : null;

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (panels.isEditPanelOpen) {
        panels.setIsEditPanelOpen(false);
        panels.setPersonToEdit(null);
      }
      if (selectedNodeId === node.id) setSelectedNodeId(null);
      else setSelectedNodeId(node.id);
    },
    [selectedNodeId, panels]
  );

  const onPaneClick = useCallback(() => {
    if (expandedSiblingId) {
      setExpandedSiblingId(null);
      return;
    }
    setSelectedNodeId(null);
    if (panels.isEditPanelOpen) {
      panels.setIsEditPanelOpen(false);
      panels.setPersonToEdit(null);
    }
  }, [expandedSiblingId, panels]);

  return {
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
    selectedNodeId,
    setSelectedNodeId,
    selectedPerson,
    mainPersonId,
    expandedSiblingId,
    expandedSiblingPerson,
    onNodeClick,
    onPaneClick,
    handleCloseSiblingBranch: clearExpandedSibling,
    fullName: selectedPerson ? getPersonFullName(selectedPerson) : '',
    ...panels,
    ...rootUser,
  };
}
