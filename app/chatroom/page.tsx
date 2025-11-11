"use client";

import { useState, useMemo } from "react";
import { mockFamilyData } from "@/lib/mock-family-data";
import { getPersonRole } from "@/lib/utils";
import ChatWindow from "@/components/features/chat-window";

export default function ChatroomPage() {
  // Находим главного человека (с максимальной глубиной)
  const mainPersonId = useMemo(() => {
    const getDepthFromRoot = (personId: string, visited = new Set<string>()): number => {
      if (visited.has(personId)) return -1;
      visited.add(personId);

      const parents = mockFamilyData.relationships
        .filter((rel) => rel.childId === personId)
        .map((rel) => rel.parentId);

      if (parents.length === 0) {
        return 0;
      }

      const parentDepths = parents
        .map((parentId) => getDepthFromRoot(parentId, new Set(visited)))
        .filter((depth) => depth >= 0);

      if (parentDepths.length === 0) return 0;

      return Math.max(...parentDepths) + 1;
    };

    const depthsFromRoot = new Map<string, number>();
    mockFamilyData.persons.forEach((person) => {
      const depth = getDepthFromRoot(person.id);
      depthsFromRoot.set(person.id, depth);
    });

    const maxDepth = Math.max(...Array.from(depthsFromRoot.values()), 0);
    return (
      Array.from(depthsFromRoot.entries()).find(([_, depth]) => depth === maxDepth)?.[0] || ""
    );
  }, []);

  // Получаем список родственников (исключая главного человека)
  const familyMembers = useMemo(() => {
    return mockFamilyData.persons
      .filter((person) => person.id !== mainPersonId)
      .map((person) => {
        const role = getPersonRole(
          person.id,
          mainPersonId,
          mockFamilyData.relationships,
          mockFamilyData.persons
        );
        return { person, role };
      })
      .sort((a, b) => {
        // Сортируем по роли (родители первыми, потом бабушки/дедушки и т.д.)
        const roleOrder: { [key: string]: number } = {
          Father: 1,
          Mother: 2,
          Grandfather: 3,
          Grandmother: 4,
          "Great-grandfather": 5,
          "Great-grandmother": 6,
        };
        const orderA = roleOrder[a.role] || 99;
        const orderB = roleOrder[b.role] || 99;
        if (orderA !== orderB) return orderA - orderB;
        // Если порядок одинаковый, сортируем по имени
        const nameA = [a.person.firstName, a.person.lastName].filter(Boolean).join(" ");
        const nameB = [b.person.firstName, b.person.lastName].filter(Boolean).join(" ");
        return nameA.localeCompare(nameB);
      });
  }, [mainPersonId]);

  const [selectedPersonId, setSelectedPersonId] = useState<string>("");

  const selectedPerson =
    selectedPersonId
      ? mockFamilyData.persons.find((p) => p.id === selectedPersonId) || null
      : null;

  // Находим роль выбранной персоны
  const selectedPersonRole = useMemo(() => {
    if (!selectedPersonId || !mainPersonId) return "";
    return getPersonRole(
      selectedPersonId,
      mainPersonId,
      mockFamilyData.relationships,
      mockFamilyData.persons
    );
  }, [selectedPersonId, mainPersonId]);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900">Chatroom</h1>
        <p className="mt-2 text-gray-600">Connect with your family through conversations.</p>

        {/* Dropdown for selecting family member */}
        <div className="mt-6">
          <label htmlFor="family-member-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select a family member
          </label>
          <select
            id="family-member-select"
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
          >
            <option value="">-- Choose a family member --</option>
            {familyMembers.map(({ person, role }) => {
              const fullName = [person.firstName, person.middleName, person.lastName]
                .filter(Boolean)
                .join(" ");
              return (
                <option key={person.id} value={person.id}>
                  {fullName} ({role})
                </option>
              );
            })}
          </select>
        </div>

        {/* Chat Window */}
        <div className="mt-8">
          <ChatWindow selectedPerson={selectedPerson} role={selectedPersonRole} />
        </div>
      </div>
    </div>
  );
}
