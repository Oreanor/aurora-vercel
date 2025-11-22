"use client";

import { useState, useMemo } from "react";
import { mockFamilyData } from "@/lib/mock-family-data";
import { getPersonRole, sortFamilyMembersByRole, findMainPersonId, getPersonFullName } from "@/lib/utils";
import ChatWindow from "@/components/features/chat-window";
import Select from "@/components/ui/select";

export default function ChatroomPage() {
  // Find main person
  const mainPersonId = useMemo(() => {
    return findMainPersonId(
      mockFamilyData.persons,
      mockFamilyData.relationships
    );
  }, []);

  // Get list of relatives (excluding main person)
  const familyMembers = useMemo(() => {
    const members = mockFamilyData.persons
      .filter((person) => person.id !== mainPersonId)
      .map((person) => {
        const role = getPersonRole(
          person.id,
          mainPersonId,
          mockFamilyData.relationships,
          mockFamilyData.persons
        );
        return { person, role };
      });
    return sortFamilyMembersByRole(members);
  }, [mainPersonId]);

  const [selectedPersonId, setSelectedPersonId] = useState<string>("");

  const selectedPerson =
    selectedPersonId
      ? mockFamilyData.persons.find((p) => p.id === selectedPersonId) || null
      : null;

  // Find selected person's role
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
          <Select
            label="Select a family member"
            id="family-member-select"
            value={selectedPersonId}
            onChange={(e) => setSelectedPersonId(e.target.value)}
            className="max-w-md"
            options={[
              { value: '', label: '-- Choose a family member --' },
              ...familyMembers.map(({ person, role }) => ({
                value: person.id,
                label: `${getPersonFullName(person)} (${role})`
              }))
            ]}
          />
        </div>

        {/* Chat Window */}
        <div className="mt-8">
          <ChatWindow selectedPerson={selectedPerson} role={selectedPersonRole} />
        </div>
      </div>
    </div>
  );
}
