// @vitest-environment jsdom

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignInPage from "./page";

const signInMock = vi.fn();
const pushMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
  useSession: () => ({ data: null }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, string>) =>
      (
        {
          "auth.welcomeBack": "Welcome back",
          "auth.signInSubtitle": "Sign in subtitle",
          "auth.emailAddress": "Email address",
          "auth.emailPlaceholder": "name@example.com",
          "auth.magicLinkSent": "Magic link sent",
          "auth.magicLinkError": "Magic link error",
          "auth.sendMagicLink": "Send magic link",
          "auth.sendingMagicLink": "Sending magic link",
          "auth.orContinueWith": "Or continue with",
          "auth.continueWithGoogle": "Continue with Google",
          "auth.dontHaveAccount": "Don't have an account?",
          "common.signUp": "Sign up",
          "common.close": "Close",
        } as Record<string, string>
      )[key] ?? values?.code ?? key,
  }),
}));

describe("SignInPage", () => {
  beforeEach(() => {
    signInMock.mockReset();
    pushMock.mockReset();
    replaceMock.mockReset();
  });

  it("submits the email flow and shows a success status", async () => {
    const user = userEvent.setup();
    signInMock.mockResolvedValue({ ok: true });

    render(React.createElement(SignInPage));

    await user.type(screen.getByLabelText("Email address"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "Send magic link" }));

    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith("email", {
        email: "user@example.com",
        redirect: false,
        callbackUrl: "/",
      })
    );

    expect(await screen.findByText("Magic link sent")).toBeTruthy();
  });
});
