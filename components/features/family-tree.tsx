'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  useReactFlow,
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyTreeData, Person, Relationship } from '@/types/family';
import { findMainPersonId, getPersonFullName, canAddParent, relationshipExists } from '@/lib/utils';
import FamilyNode from './family-node';
import SpouseRingNode from './spouse-ring-node';
import PersonDetailsPanel from './person-details-panel';
import AddPersonPanel from './add-person-panel';

interface Props {
  data: FamilyTreeData;
  className?: string;
  currentUserEmail?: string; // Email текущего пользователя для отображения дерева относительно него
}

/**
 * Преобразует данные семейного дерева в формат React Flow
 * @param data - данные семейного дерева
 * @param currentUserEmail - email текущего пользователя (опционально). Если передан, дерево будет отображаться относительно этого пользователя
 * @param selectedNodeId - ID выбранного узла (опционально)
 */
function transformToFlowData(data: FamilyTreeData, currentUserEmail?: string, selectedNodeId?: string) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Определяем главного человека (корневой узел дерева)
  const mainPersonId = findMainPersonId(
    data.persons,
    data.relationships,
    currentUserEmail
  );
  
  // Правильный алгоритм: строим дерево от главного человека вверх и вниз
  // Главный человек = уровень 0, его родители = уровень 1, дедушки = уровень 2, и т.д.
  // Дети главного человека = уровень -1, внуки = уровень -2, и т.д.
  const levelsFromMain = new Map<string, number>();
  
  // Главный человек на уровне 0
  levelsFromMain.set(mainPersonId, 0);
  
  // BFS от главного человека: вычисляем уровни всех предков (вверх)
  // Главный человек = уровень 0, его родители = уровень 1, дедушки = уровень 2, и т.д.
  let currentLevel = 0;
  let toProcess = [mainPersonId];
  const processed = new Set<string>([mainPersonId]);
  
  while (toProcess.length > 0) {
    const nextLevel: string[] = [];
    
    // Обрабатываем всех людей на текущем уровне
    toProcess.forEach((personId) => {
      // Находим всех родителей этого человека (вверх)
      const parents = data.relationships
        .filter((rel) => rel.childId === personId)
        .map((rel) => rel.parentId)
        .filter((pid) => !processed.has(pid));
      
      parents.forEach((parentId) => {
        // Устанавливаем уровень родителя
        const parentLevel = currentLevel + 1;
        const existingLevel = levelsFromMain.get(parentId);
        
        // Если уровень еще не установлен или меньше нужного, устанавливаем
        if (existingLevel === undefined || existingLevel < parentLevel) {
          levelsFromMain.set(parentId, parentLevel);
        }
        
        if (!processed.has(parentId)) {
          nextLevel.push(parentId);
          processed.add(parentId);
        }
      });
    });
    
    toProcess = nextLevel;
    currentLevel++;
  }
  
  // BFS от главного человека: вычисляем уровни всех потомков (вниз)
  // Дети главного человека = уровень -1, внуки = уровень -2, и т.д.
  currentLevel = 0;
  toProcess = [mainPersonId];
  processed.clear();
  processed.add(mainPersonId);
  
  while (toProcess.length > 0) {
    const nextLevel: string[] = [];
    
    // Обрабатываем всех людей на текущем уровне
    toProcess.forEach((personId) => {
      // Находим всех детей этого человека (вниз)
      const children = data.relationships
        .filter((rel) => rel.parentId === personId)
        .map((rel) => rel.childId)
        .filter((childId) => !processed.has(childId));
      
      children.forEach((childId) => {
        // Устанавливаем уровень ребенка
        const childLevel = currentLevel - 1;
        const existingLevel = levelsFromMain.get(childId);
        
        // Если уровень еще не установлен или больше нужного (ближе к 0), устанавливаем
        if (existingLevel === undefined || existingLevel > childLevel) {
          levelsFromMain.set(childId, childLevel);
        }
        
        if (!processed.has(childId)) {
          nextLevel.push(childId);
          processed.add(childId);
        }
      });
    });
    
    toProcess = nextLevel;
    currentLevel--;
  }
  
  // Обрабатываем оставшихся людей (если есть изолированные узлы)
  data.persons.forEach((person) => {
    if (!levelsFromMain.has(person.id)) {
      // Если у человека нет связи с главным человеком, устанавливаем высокий уровень
      levelsFromMain.set(person.id, 999);
    }
  });
  
  // Выравниваем уровни родителей одного ребенка
  // Если у ребенка есть два родителя, они должны быть на одном уровне
  let changed = true;
  let iterations = 0;
  const maxIterations = data.persons.length * 2;
  
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    
    // Группируем по детям
    const childrenByParents = new Map<string, Set<string>>();
  data.relationships.forEach((rel) => {
      const childId = rel.childId;
      if (!childrenByParents.has(childId)) {
        childrenByParents.set(childId, new Set());
      }
      childrenByParents.get(childId)!.add(rel.parentId);
    });
    
    childrenByParents.forEach((parentIds, childId) => {
      if (parentIds.size <= 1) return; // Один родитель - не нужно выравнивать
      
      const parentLevels = Array.from(parentIds)
        .map((pid) => levelsFromMain.get(pid))
        .filter((d): d is number => d !== undefined);
      
      if (parentLevels.length === parentIds.size && parentLevels.length > 0) {
        const maxParentLevel = Math.max(...parentLevels);
        const minParentLevel = Math.min(...parentLevels);
        
        if (maxParentLevel !== minParentLevel) {
          // Выравниваем всех родителей на максимальный уровень
          parentIds.forEach((pid) => {
            const currentLevel = levelsFromMain.get(pid);
            if (currentLevel !== undefined && currentLevel < maxParentLevel) {
              levelsFromMain.set(pid, maxParentLevel);
              changed = true;
            }
          });
          
          // Пересчитываем уровень ребенка
          const childLevel = maxParentLevel + 1;
          const currentChildLevel = levelsFromMain.get(childId);
          if (currentChildLevel === undefined || currentChildLevel !== childLevel) {
            levelsFromMain.set(childId, childLevel);
            changed = true;
          }
        }
      }
    });
    
    // Пересчитываем уровни всех потомков измененных родителей
    if (changed) {
      const recalculateDescendants = (personId: string, visited = new Set<string>()) => {
        if (visited.has(personId)) return;
    visited.add(personId);

        const children = data.relationships
          .filter((rel) => rel.parentId === personId)
          .map((rel) => rel.childId);
        
        children.forEach((childId) => {
          const allParents = data.relationships
            .filter((rel) => rel.childId === childId)
      .map((rel) => rel.parentId);

          if (allParents.length > 0) {
            const parentLevels = allParents
              .map((pid) => levelsFromMain.get(pid))
              .filter((d): d is number => d !== undefined);
            
            if (parentLevels.length === allParents.length && parentLevels.length > 0) {
              const maxParentLevel = Math.max(...parentLevels);
              // Если родитель на отрицательном уровне (потомок), ребенок должен быть еще ниже
              // Если родитель на положительном уровне (предок), ребенок должен быть выше
              // Определяем направление: если maxParentLevel < 0, то идем вниз (уменьшаем), иначе вверх (увеличиваем)
              const childLevel = maxParentLevel < 0 ? maxParentLevel - 1 : maxParentLevel + 1;
              
              const currentLevel = levelsFromMain.get(childId);
              // Обновляем уровень, если он не установлен или не соответствует вычисленному
              if (currentLevel === undefined || 
                  (maxParentLevel < 0 && currentLevel > childLevel) || 
                  (maxParentLevel >= 0 && currentLevel < childLevel)) {
                levelsFromMain.set(childId, childLevel);
                recalculateDescendants(childId, new Set(visited));
              }
            }
          }
        });
      };
      
      // Пересчитываем всех потомков измененных родителей
  data.persons.forEach((person) => {
        recalculateDescendants(person.id);
      });
    }
  }
  
  // Нормализуем уровни: главный человек всегда на уровне 0
  // Потомки получают отрицательные уровни, предки - положительные
  // Не сдвигаем уровни, оставляем главного человека на уровне 0
  const normalizedLevels = new Map<string, number>();
  levelsFromMain.forEach((level, personId) => {
    if (level === 999) {
      normalizedLevels.set(personId, 999);
    } else {
      // Оставляем уровни как есть: главный человек = 0, потомки = -1, -2, ..., предки = 1, 2, ...
      normalizedLevels.set(personId, level);
    }
  });

  // Группируем персон по уровням
  const personsByLevel = new Map<number, Person[]>();
  data.persons.forEach((person) => {
    const level = normalizedLevels.get(person.id);
    if (level !== undefined && level !== 999) {
    if (!personsByLevel.has(level)) {
      personsByLevel.set(level, []);
    }
    personsByLevel.get(level)!.push(person);
    }
  });

  // Создаем узлы с позиционированием относительно потомков
  // Уровень 0 (главный человек) внизу, больший уровень выше
  const nodeWidth = 200; // Ширина узла
  const minSpouseGap = 0; // Минимальное расстояние между краями узлов супругов (уменьшено на 10px для сближения)
  const minSpouseDistance = nodeWidth + minSpouseGap; // Расстояние между центрами супругов (ширина узла + зазор)
  const basePairSpacing = 400; // Базовое расстояние между разными парами родителей на одном уровне
  const minNodeDistance = 250; // Минимальное расстояние между узлами из разных веток на одном уровне
  const levelSpacing = 250; // Расстояние между уровнями по вертикали
  const startY = 500; // Начальная позиция снизу
  const centerX = 0; // Центр по горизонтали
  
  // Находим минимальный и максимальный нормализованные уровни (исключая изолированные узлы)
  const validNormalizedLevels = Array.from(normalizedLevels.values()).filter((l) => l !== 999);
  const minNormalizedLevel = validNormalizedLevels.length > 0 ? Math.min(...validNormalizedLevels) : 0;
  const maxNormalizedLevel = validNormalizedLevels.length > 0 ? Math.max(...validNormalizedLevels) : 0;
  
  // Вычисляем смещение для Y позиции: главный человек (level 0) должен быть внизу
  // Потомки (level < 0) должны быть выше главного (меньше Y), предки (level > 0) еще выше
  // Используем: y = startY + (0 - level) * levelSpacing для потомков
  // и y = startY - level * levelSpacing для предков
  // Или проще: y = startY - level * levelSpacing (потомки с отрицательным level будут ниже)
  
  // Вычисляем коэффициент уменьшения расстояния между парами для каждого уровня
  // Чем выше уровень (больше поколений), тем меньше расстояние между разными парами родителей
  const getPairSpacing = (level: number): number => {
    if (maxNormalizedLevel === 0) return basePairSpacing;
    // Уменьшаем расстояние между парами пропорционально уровню
    // Уровень 1: 100%, уровень 2: 70%, уровень 3: 50%, и т.д.
    const reductionFactor = 1 - (level - 1) * 0.3 / maxNormalizedLevel;
    return Math.max(basePairSpacing * reductionFactor, minSpouseDistance * 3);
  };
  
  // Вычисляем позиции для всех уровней снизу вверх (от главного человека к предкам)
  const nodePositions = new Map<string, { x: number; y: number }>();
  
  // Функция для проверки и корректировки позиции, чтобы избежать наложений
  const adjustPositionToAvoidOverlap = (
    desiredX: number,
    y: number,
    level: number,
    excludePersonId?: string,
    spouseId?: string
  ): number => {
    // Получаем все уже размещенные узлы на этом уровне
    const existingPositions: number[] = [];
    personsByLevel.get(level)?.forEach((person) => {
      if (person.id !== excludePersonId && person.id !== spouseId) {
        const pos = nodePositions.get(person.id);
        if (pos && pos.y === y) {
          existingPositions.push(pos.x);
        }
      }
    });
    
    // Сортируем позиции
    existingPositions.sort((a, b) => a - b);
    
    // Проверяем, не накладывается ли желаемая позиция
    let adjustedX = desiredX;
    const hasOverlap = existingPositions.some((x) => Math.abs(x - adjustedX) < minNodeDistance);
    
    if (hasOverlap) {
      // Находим ближайшую свободную позицию
      let bestX = adjustedX;
      let minDistance = Infinity;
      
      // Проверяем позиции слева и справа
      for (let offset = minNodeDistance; offset < minNodeDistance * 10; offset += minNodeDistance) {
        // Пробуем слева
        const leftX = adjustedX - offset;
        const leftOverlap = existingPositions.some((x) => Math.abs(x - leftX) < minNodeDistance);
        if (!leftOverlap) {
          const distance = Math.abs(leftX - adjustedX);
          if (distance < minDistance) {
            minDistance = distance;
            bestX = leftX;
          }
        }
        
        // Пробуем справа
        const rightX = adjustedX + offset;
        const rightOverlap = existingPositions.some((x) => Math.abs(x - rightX) < minNodeDistance);
        if (!rightOverlap) {
          const distance = Math.abs(rightX - adjustedX);
          if (distance < minDistance) {
            minDistance = distance;
            bestX = rightX;
          }
        }
      }
      
      adjustedX = bestX;
    }
    
    return adjustedX;
  };
  
  // Обрабатываем все уровни от минимального к максимальному
  // Уровень 0 (главный человек) должен быть внизу, потомки (level < 0) ниже него, предки (level > 0) выше
  // Y увеличивается вниз, поэтому: потомки должны иметь больший Y, предки - меньший Y
  for (let level = minNormalizedLevel; level <= maxNormalizedLevel; level++) {
    const persons = personsByLevel.get(level) || [];
    // Вычисляем Y позицию: 
    // - Главный человек (level 0): y = startY
    // - Потомки (level < 0, например -1): y = startY - level * spacing = startY + spacing (ниже)
    // - Предки (level > 0, например 1): y = startY - level * spacing = startY - spacing (выше)
    const y = startY - level * levelSpacing;
    
    if (level === 0) {
      // Главный человек в центре
      persons.forEach((person) => {
        nodePositions.set(person.id, { x: centerX, y });
      });
    } else if (level > 0) {
      // Для предков позиционируем относительно их детей
      // Сначала группируем родителей по их общим детям (супруги)
      const parentGroups = new Map<string, Person[]>();
      
      persons.forEach((person) => {
        // Находим всех детей этого человека на следующем уровне вниз (level - 1)
        const children = data.relationships
          .filter((rel) => rel.parentId === person.id)
          .map((rel) => rel.childId)
          .filter((childId) => {
            const childLevel = normalizedLevels.get(childId);
            return childLevel !== undefined && childLevel === level - 1;
          });
        
        if (children.length > 0) {
          // Создаем ключ группы на основе отсортированных ID детей
          const childrenKey = children.sort().join(',');
          
          if (!parentGroups.has(childrenKey)) {
            parentGroups.set(childrenKey, []);
          }
          parentGroups.get(childrenKey)!.push(person);
        }
      });
      
      // Получаем расстояние между парами для этого уровня
      const pairSpacing = getPairSpacing(level);
      
      // Сортируем группы по позиции их детей (слева направо)
      const sortedGroups = Array.from(parentGroups.entries()).sort(([key1], [key2]) => {
        const children1 = key1.split(',').map((id) => nodePositions.get(id)?.x ?? 0);
        const children2 = key2.split(',').map((id) => nodePositions.get(id)?.x ?? 0);
        const avg1 = children1.reduce((sum, x) => sum + x, 0) / children1.length;
        const avg2 = children2.reduce((sum, x) => sum + x, 0) / children2.length;
        return avg1 - avg2;
      });
      
      // Обрабатываем каждую группу супругов с учетом расстояния между парами
      sortedGroups.forEach(([childrenKey, parentGroup], groupIndex) => {
        const childrenIds = childrenKey.split(',');
        
        // Вычисляем среднюю позицию всех детей этой группы
        const childPositions = childrenIds
          .map((childId) => nodePositions.get(childId))
          .filter((pos): pos is { x: number; y: number } => pos !== undefined);
        
        if (childPositions.length > 0) {
          const avgChildX = childPositions.reduce((sum, pos) => sum + pos.x, 0) / childPositions.length;
          
          // Вычисляем желаемую позицию центра пары с учетом расстояния между парами
          // Первая пара в центре, остальные сдвигаются влево/вправо
          let pairCenterX = avgChildX;
          if (sortedGroups.length > 1) {
            // Вычисляем общий центр всех детей всех групп
            const allChildPositions = sortedGroups.flatMap(([key]) => {
              return key.split(',').map((id) => nodePositions.get(id)?.x ?? 0);
            });
            const overallCenter = allChildPositions.reduce((sum, x) => sum + x, 0) / allChildPositions.length;
            
            // Сдвигаем пары относительно общего центра
            const offsetFromCenter = (groupIndex - (sortedGroups.length - 1) / 2) * pairSpacing;
            pairCenterX = overallCenter + offsetFromCenter;
          }
          
          // Сортируем родителей: мужчины слева, женщины справа
          const sortedParents = [...parentGroup].sort((a, b) => {
            if (a.gender === 'male' && b.gender !== 'male') return -1;
            if (a.gender !== 'male' && b.gender === 'male') return 1;
            return a.id.localeCompare(b.id);
          });
          
          if (sortedParents.length === 1) {
            // Один родитель - симметрично над ребенком
            const person = sortedParents[0];
            const adjustedX = adjustPositionToAvoidOverlap(pairCenterX, y, level, person.id);
            nodePositions.set(person.id, { x: adjustedX, y });
          } else if (sortedParents.length === 2) {
            // Два родителя (супруги) - симметрично над центром пары с минимальным расстоянием между ними
            const [parent1, parent2] = sortedParents;
            
            // Вычисляем позиции симметрично относительно центра пары
            // Расстояние между супругами всегда минимальное (10px)
            const halfDistance = minSpouseDistance / 2;
            const desiredX1 = pairCenterX - halfDistance;
            
            // Размещаем первого родителя
            const adjustedX1 = adjustPositionToAvoidOverlap(desiredX1, y, level, parent1.id, parent2.id);
            nodePositions.set(parent1.id, { x: adjustedX1, y });
            
            // Размещаем второго родителя симметрично относительно центра пары
            // Вычисляем фактическое смещение первого родителя от центра
            const actualOffset1 = pairCenterX - adjustedX1;
            // Второй родитель должен быть на таком же расстоянии справа
            const desiredX2Symmetric = pairCenterX + actualOffset1;
            // Но не ближе минимального расстояния между супругами
            const minX2 = adjustedX1 + minSpouseDistance;
            const finalX2 = Math.max(desiredX2Symmetric, minX2);
            
            const adjustedX2 = adjustPositionToAvoidOverlap(finalX2, y, level, parent2.id, parent1.id);
            nodePositions.set(parent2.id, { x: adjustedX2, y });
            
            // Добавляем два желтых колечка между супругами
            // Аватары находятся в центре узла по X (adjustedX1 и adjustedX2)
            // Аватар находится на -30px от верха узла, узел высотой 180px
            // Центр узла на y, верх узла на y - 90, аватар на y - 90 + 30 = y - 60
            // Колечки должны быть между аватарами и пересекаться друг с другом
            // Сдвигаем их правее (к правому супругу) и ниже (ближе к детям)
            const centerBetweenAvatars = (adjustedX1 + adjustedX2) / 2;
            const ringOffset = 10; // Смещение для пересечения колечек (колечки размером 28px, смещение 10px = они пересекаются)
            const rightOffset = 85; // Смещение вправо от центра
            const ring1X = centerBetweenAvatars - ringOffset + rightOffset;
            const ring2X = centerBetweenAvatars + ringOffset + rightOffset;
            // Позиционируем колечки ниже аватаров (y - 40 от центра узла, вместо y - 60)
            const ringY = y + 35;
            
            // Сохраняем позиции колечек для последующего создания узлов
            if (!nodePositions.has(`ring-${parent1.id}-${parent2.id}-1`)) {
              nodePositions.set(`ring-${parent1.id}-${parent2.id}-1`, { x: ring1X, y: ringY });
              nodePositions.set(`ring-${parent1.id}-${parent2.id}-2`, { x: ring2X, y: ringY });
            }
          } else {
            // Больше двух родителей - распределяем симметрично с минимальным расстоянием между соседними
            sortedParents.forEach((person, index) => {
              const totalWidth = minSpouseDistance * (sortedParents.length - 1);
              const spacing = sortedParents.length > 1 ? totalWidth / (sortedParents.length - 1) : 0;
              const desiredX = pairCenterX - totalWidth / 2 + index * spacing;
              
              const adjustedX = adjustPositionToAvoidOverlap(
                desiredX, 
                y, 
                level, 
                person.id,
                undefined
              );
              nodePositions.set(person.id, { x: adjustedX, y });
            });
          }
        }
      });
      
      // Обрабатываем родителей без детей на следующем уровне
      persons.forEach((person) => {
        if (!nodePositions.has(person.id)) {
          const adjustedX = adjustPositionToAvoidOverlap(centerX, y, level, person.id);
          nodePositions.set(person.id, { x: adjustedX, y });
        }
      });
    } else {
      // Для потомков (level < 0, но после нормализации это level > 0, но меньше уровня главного человека)
      // Потомки позиционируются относительно их родителей
      // Группируем детей по их общим родителям (братья/сестры)
      const childrenGroups = new Map<string, Person[]>();
      
      persons.forEach((person) => {
        // Находим всех родителей этого человека на следующем уровне вверх (level + 1)
        const parents = data.relationships
          .filter((rel) => rel.childId === person.id)
          .map((rel) => rel.parentId)
          .filter((parentId) => {
            const parentLevel = normalizedLevels.get(parentId);
            return parentLevel !== undefined && parentLevel === level + 1;
          });
        
        if (parents.length > 0) {
          // Создаем ключ группы на основе отсортированных ID родителей
          const parentsKey = parents.sort().join(',');
          
          if (!childrenGroups.has(parentsKey)) {
            childrenGroups.set(parentsKey, []);
          }
          childrenGroups.get(parentsKey)!.push(person);
        }
      });
      
      // Обрабатываем каждую группу братьев/сестер
      childrenGroups.forEach((childrenGroup, parentsKey) => {
        const parentIds = parentsKey.split(',');
        
        // Вычисляем среднюю позицию всех родителей этой группы
        const parentPositions = parentIds
          .map((parentId) => nodePositions.get(parentId))
          .filter((pos): pos is { x: number; y: number } => pos !== undefined);
        
        if (parentPositions.length > 0) {
          const avgParentX = parentPositions.reduce((sum, pos) => sum + pos.x, 0) / parentPositions.length;
          
          // Распределяем детей горизонтально под родителями
          const childrenCount = childrenGroup.length;
          const spacing = Math.max(minSpouseDistance, 250); // Расстояние между детьми
          const totalWidth = spacing * (childrenCount - 1);
          const startX = avgParentX - totalWidth / 2;
          
          childrenGroup.forEach((child, index) => {
            const desiredX = startX + index * spacing;
            const adjustedX = adjustPositionToAvoidOverlap(desiredX, y, level, child.id);
            nodePositions.set(child.id, { x: adjustedX, y });
          });
        }
      });
      
      // Обрабатываем детей без родителей на следующем уровне
      persons.forEach((person) => {
        if (!nodePositions.has(person.id)) {
          const adjustedX = adjustPositionToAvoidOverlap(centerX, y, level, person.id);
          nodePositions.set(person.id, { x: adjustedX, y });
        }
      });
    }
  }
  
  // Создаем узлы с вычисленными позициями
  data.persons.forEach((person) => {
    const position = nodePositions.get(person.id) || { x: 0, y: 0 };
    const isMainPerson = person.id === mainPersonId;

      nodes.push({
        id: person.id,
        type: 'familyNode',
      position,
        data: {
          person,
          isMainPerson,
          relationships: data.relationships,
          mainPersonId,
          persons: data.persons,
        isSelected: selectedNodeId === person.id,
        },
        width: 200,
      height: isMainPerson ? 450 : 180,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
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
    const parentLevel = normalizedLevels.get(rel.parentId) || 0;
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
  
  // Создаем узлы для желтых колечек между супругами
  nodePositions.forEach((position, nodeId) => {
    if (nodeId.startsWith('ring-')) {
      nodes.push({
        id: nodeId,
        type: 'spouseRingNode',
        position,
        data: { size: 28 },
        width: 28,
        height: 28,
        selectable: false,
        draggable: false,
        connectable: false,
      });
    }
  });

  return { nodes, edges };
}

const nodeTypes = {
  familyNode: FamilyNode,
  spouseRingNode: SpouseRingNode,
};

function FlowContent({ nodes }: { nodes: Node[] }) {
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

export default function FamilyTree({ data: initialData, className = '', currentUserEmail }: Props) {
  const [data, setData] = useState<FamilyTreeData>(initialData);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);

  // Синхронизируем с initialData при его изменении
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const { nodes, edges } = useMemo(
    () => transformToFlowData(data, currentUserEmail, selectedNodeId || undefined),
    [data, currentUserEmail, selectedNodeId]
  );

  const selectedPerson = useMemo(() => {
    if (!selectedNodeId) return null;
    return data.persons.find((p) => p.id === selectedNodeId) || null;
  }, [selectedNodeId, data.persons]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    // Если кликнули на уже выбранный узел - снимаем выделение
    if (selectedNodeId === node.id) {
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(node.id);
    }
  }, [selectedNodeId]);

  const onPaneClick = useCallback(() => {
    // Сбрасываем выделение при клике на пустое пространство
    setSelectedNodeId(null);
  }, []);

  const handleAddPerson = useCallback((
    personData: Omit<Person, 'id'>,
    relationship?: { type: 'parent' | 'child'; relatedPersonId: string }
  ) => {
    // Генерируем уникальный ID для новой персоны
    const newPersonId = `person-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPerson: Person = {
      ...personData,
      id: newPersonId,
    };

    // Проверяем и добавляем связь, если она указана
    let newRelationship: Relationship | null = null;
    
    if (relationship) {
      const { type, relatedPersonId } = relationship;
      
      if (type === 'child') {
        // Новый человек является ребенком выбранной персоны
        // relatedPersonId - это родитель нового человека
        // Валидация уже выполнена в панели, здесь просто создаем связь
        const relatedPerson = data.persons.find((p) => p.id === relatedPersonId);
        if (!relatedPerson) {
          // Если персона не найдена (не должно происходить после валидации), просто не добавляем
          return;
        }
        
        newRelationship = {
          id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          parentId: relatedPersonId,
          childId: newPersonId,
        };
      } else if (type === 'parent') {
        // Новый человек является родителем выбранной персоны
        // relatedPersonId - это ребенок нового человека
        // Валидация уже выполнена в панели, но проверяем еще раз для безопасности
        if (!canAddParent(relatedPersonId, data.relationships)) {
          // Если нельзя добавить родителя (не должно происходить после валидации), просто не добавляем
          return;
        }
        
        // Проверяем, не существует ли уже такая связь
        if (relationshipExists(newPersonId, relatedPersonId, data.relationships)) {
          // Если связь уже существует (не должно происходить), просто не добавляем
          return;
        }
        
        newRelationship = {
          id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          parentId: newPersonId,
          childId: relatedPersonId,
        };
      }
    }

    // Обновляем данные
    setData((prevData) => {
      const updatedPersons = [...prevData.persons, newPerson];
      const updatedRelationships = newRelationship
        ? [...prevData.relationships, newRelationship]
        : prevData.relationships;
      
      return {
        persons: updatedPersons,
        relationships: updatedRelationships,
      };
    });

    // Закрываем панель добавления
    setIsAddPanelOpen(false);
  }, [data.persons, data.relationships]);

  const fullName = selectedPerson ? getPersonFullName(selectedPerson) : '';

  return (
    <div className={`w-full h-full ${className} relative`}>
      {/* Add Person Button */}
      {!isAddPanelOpen && !selectedPerson && (
        <button
          onClick={() => {
            setIsAddPanelOpen(true);
            setSelectedNodeId(null);
          }}
          className="absolute top-4 right-4 z-50 w-12 h-12 bg-green-400 text-white rounded-full shadow-lg hover:bg-green-500 transition-colors flex items-center justify-center text-4xl font-bold leading-none cursor-pointer"
          style={{ lineHeight: 1 }}
          aria-label="Add new person"
        >
          <span className="relative -top-1">+</span>
        </button>
      )}

      <div className="w-full h-full">
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
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
      >
          <FlowContent nodes={nodes}/>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      </div>

      {/* Side Panel - Person Details */}
      {selectedPerson && !isAddPanelOpen && (
        <PersonDetailsPanel 
          person={selectedPerson} 
          fullName={fullName}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {/* Side Panel - Add Person */}
        {isAddPanelOpen && (
          <AddPersonPanel
            onClose={() => setIsAddPanelOpen(false)}
            onSave={handleAddPerson}
            persons={data.persons}
            relationships={data.relationships}
          />
        )}
    </div>
  );
}

