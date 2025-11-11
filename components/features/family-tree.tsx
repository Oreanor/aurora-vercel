'use client';

import { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyTreeData, Person } from '@/types/family';
import FamilyNode from './family-node';

interface Props {
  data: FamilyTreeData;
  className?: string;
}

/**
 * Преобразует данные семейного дерева в формат React Flow
 */
function transformToFlowData(data: FamilyTreeData) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Создаем карту для быстрого доступа к персоне по ID
  const personMap = new Map<string, Person>();
  data.persons.forEach((person) => {
    personMap.set(person.id, person);
  });

  // Создаем карту детей для каждого родителя
  const childrenMap = new Map<string, string[]>();
  data.relationships.forEach((rel) => {
    if (!childrenMap.has(rel.parentId)) {
      childrenMap.set(rel.parentId, []);
    }
    childrenMap.get(rel.parentId)!.push(rel.childId);
  });

  // Функция для получения глубины от корня (0 = бабушки/дедушки, увеличивается вниз)
  const getDepthFromRoot = (personId: string, visited = new Set<string>()): number => {
    if (visited.has(personId)) return -1; // Цикл обнаружен
    visited.add(personId);

    // Находим родителей
    const parents = data.relationships
      .filter((rel) => rel.childId === personId)
      .map((rel) => rel.parentId);

    if (parents.length === 0) {
      return 0; // Корневой уровень (бабушки/дедушки)
    }

    const parentDepths = parents
      .map((parentId) => getDepthFromRoot(parentId, new Set(visited)))
      .filter((depth) => depth >= 0);

    if (parentDepths.length === 0) return 0;

    return Math.max(...parentDepths) + 1;
  };

  // Вычисляем глубину от корня для всех персон
  const depthsFromRoot = new Map<string, number>();
  data.persons.forEach((person) => {
    const depth = getDepthFromRoot(person.id);
    depthsFromRoot.set(person.id, depth);
  });

  // Находим максимальную глубину (главный человек)
  const maxDepth = Math.max(...Array.from(depthsFromRoot.values()), 0);

  // Находим ID главного человека (с максимальной глубиной)
  const mainPersonId = Array.from(depthsFromRoot.entries())
    .find(([_, depth]) => depth === maxDepth)?.[0] || '';

  // Инвертируем: главный человек (maxDepth) -> уровень 0 (внизу), бабушки/дедушки (0) -> уровень maxDepth (вверху)
  const levels = new Map<string, number>();
  depthsFromRoot.forEach((depth, personId) => {
    levels.set(personId, maxDepth - depth);
  });

  // Группируем персон по уровням
  const personsByLevel = new Map<number, Person[]>();
  data.persons.forEach((person) => {
    const level = levels.get(person.id) || 0;
    if (!personsByLevel.has(level)) {
      personsByLevel.set(level, []);
    }
    personsByLevel.get(level)!.push(person);
  });

  // Создаем узлы с позиционированием
  // Уровень 0 (главный человек) внизу, больший уровень выше
  const nodeSpacing = 300; // Расстояние между узлами по горизонтали
  const levelSpacing = 250; // Расстояние между уровнями по вертикали (уполовинено)
  const startY = 500; // Начальная позиция снизу (больше, чтобы узлы были видны)
  const maxLevel = Math.max(...Array.from(levels.values()), 0);
  const centerX = 0; // Центр по горизонтали
  
  personsByLevel.forEach((persons, level) => {
    // Уровень 0 внизу, больший уровень выше (инвертируем)
    const y = startY + (maxLevel - level) * levelSpacing;
    
    // Распределяем узлы равномерно по горизонтали от центра
    const totalWidth = persons.length > 1 ? (persons.length - 1) * nodeSpacing : 0;
    const startX = centerX - totalWidth / 2;
    
    persons.forEach((person, index) => {
      const x = startX + index * nodeSpacing;

      // Определяем, является ли это главным человеком (уровень 0)
      const isMainPerson = level === 0;

      nodes.push({
        id: person.id,
        type: 'familyNode',
        position: { x, y },
        data: {
          person,
          isMainPerson,
          relationships: data.relationships,
          mainPersonId,
          persons: data.persons,
        },
        width: 200,
        height: isMainPerson ? 450 : 180, // Больше для главного человека из-за trunk
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
    });
  });

  // Создаем связи с толщиной, зависящей от уровня
  // Функция для вычисления толщины связи на основе уровня родителя
  const getStrokeWidth = (parentLevel: number): number => {
    // Уровень 0 (главный человек) -> 50px, каждый следующий уровень вдвое тоньше
    const width = 40 / Math.pow(2, parentLevel);
    // Минимум 4px
    return Math.max(Math.round(width), 4);
  };

  data.relationships.forEach((rel) => {
    const parentLevel = levels.get(rel.parentId) || 0;
    const strokeWidth = getStrokeWidth(parentLevel);
    
    edges.push({
      id: rel.id,
      source: rel.parentId,
      target: rel.childId,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#793333', strokeWidth },
    });
  });

  return { nodes, edges };
}

const nodeTypes = {
  familyNode: FamilyNode,
};

function FlowContent({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const { fitView } = useReactFlow();

  // Автоматически подгоняем вид после загрузки
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, maxZoom: 1.5 });
      }, 100);
    }
  }, [fitView, nodes.length]);

  return null;
}

export default function FamilyTree({ data, className = '' }: Props) {
  const { nodes, edges } = useMemo(() => transformToFlowData(data), [data]);

  // Отладка: выводим информацию о узлах
  console.log('FamilyTree nodes:', nodes);
  console.log('FamilyTree edges:', edges);
  console.log('Nodes count:', nodes.length);

  return (
    <div className={`w-full h-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <FlowContent nodes={nodes} edges={edges} />
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

