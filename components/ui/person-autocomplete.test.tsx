// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Person } from "@/types/family";
import { describe, expect, it, vi } from "vitest";
import PersonAutocomplete from "./person-autocomplete";

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) =>
      (
        {
          "common.searchPerson": "Search person",
          "common.noPersonsFound": "No persons found",
        } as Record<string, string>
      )[key] ?? key,
  }),
}));

const persons = [
  { id: "1", firstName: "Alice", lastName: "Walker" },
  { id: "2", firstName: "Bob", lastName: "Stone" },
  { id: "3", firstName: "Charlie", lastName: "Vale" },
];

function AutocompleteHarness({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = React.useState(initialValue);

  return React.createElement(PersonAutocomplete, {
    label: "Relative",
    persons: persons as unknown as Person[],
    value,
    onChange: setValue,
  });
}

describe("PersonAutocomplete", () => {
  it("filters options and selects a person with the keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      React.createElement(PersonAutocomplete, {
        label: "Relative",
        persons: persons as unknown as Person[],
        value: "",
        onChange,
      })
    );

    const input = screen.getByRole("combobox", { name: "Relative" });
    await user.click(input);
    await user.type(input, "bo");

    expect(screen.getByRole("option", { name: "Bob Stone" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Alice Walker" })).toBeNull();

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("2");
  });

  it("clears the current selection when the user starts typing a new search", async () => {
    const user = userEvent.setup();

    render(React.createElement(AutocompleteHarness, { initialValue: "1" }));

    const input = screen.getByRole("combobox", { name: "Relative" });
    await user.click(input);
    await user.type(input, "c");

    expect((input as HTMLInputElement).value).toBe("c");
    expect(screen.getByRole("option", { name: "Charlie Vale" })).toBeTruthy();
  });
});
