// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TreeProvider, useTree } from "./tree-context";

const replaceMock = vi.fn();
const getTreeByIdMock = vi.fn();

let currentPathname = "/tree";
let currentTreeId = "tree-1";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(currentTreeId ? `treeId=${currentTreeId}` : ""),
}));

vi.mock("@/lib/api/trees", () => ({
  getTreeById: (...args: unknown[]) => getTreeByIdMock(...args),
}));

function TreeProbe() {
  const { selectedTreeId, treeData, setSelectedTreeId } = useTree();

  return React.createElement(
    "div",
    null,
    React.createElement("div", { "data-testid": "selected-tree" }, selectedTreeId ?? "none"),
    React.createElement("div", { "data-testid": "has-tree-data" }, treeData ? "loaded" : "empty"),
    React.createElement(
      "button",
      { type: "button", onClick: () => setSelectedTreeId("tree-2") },
      "switch tree"
    ),
    React.createElement(
      "button",
      { type: "button", onClick: () => setSelectedTreeId(null) },
      "clear tree"
    )
  );
}

describe("TreeProvider", () => {
  beforeEach(() => {
    currentPathname = "/tree";
    currentTreeId = "tree-1";
    replaceMock.mockReset();
    replaceMock.mockImplementation((url: string) => {
      const [, query = ""] = url.split("?");
      currentTreeId = new URLSearchParams(query).get("treeId") ?? "";
    });
    getTreeByIdMock.mockReset();
    getTreeByIdMock.mockResolvedValue({
      data: {
        persons: [{ id: "p1", firstName: "Alex", lastName: "Stone" }],
        relationships: [],
      },
    });
  });

  it("loads tree data from the treeId query param", async () => {
    render(
      React.createElement(TreeProvider, null, React.createElement(TreeProbe))
    );

    await waitFor(() => expect(getTreeByIdMock).toHaveBeenCalledWith("tree-1"));
    await waitFor(() => expect(screen.getByTestId("has-tree-data").textContent).toBe("loaded"));
    expect(screen.getByTestId("selected-tree").textContent).toBe("tree-1");
  });

  it("syncs setSelectedTreeId back into the URL and clears state", async () => {
    const user = userEvent.setup();

    render(
      React.createElement(TreeProvider, null, React.createElement(TreeProbe))
    );

    await waitFor(() => expect(getTreeByIdMock).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: "switch tree" }));
    expect(replaceMock).toHaveBeenCalledWith("/tree?treeId=tree-2", { scroll: false });

    await user.click(screen.getByRole("button", { name: "clear tree" }));
    expect(replaceMock).toHaveBeenCalledWith("/tree", { scroll: false });
    expect(screen.getByTestId("selected-tree").textContent).toBe("none");
    expect(screen.getByTestId("has-tree-data").textContent).toBe("empty");
  });
});
