import { test, expect } from "@playwright/test";
import {
  mockGraphQL,
  mockClockifyStatus,
  mockClockifyWorkspaces,
  mockClockifyTracker,
  MOCK_USER,
} from "./helpers/mock";

test("shows connect form when Clockify not connected", async ({ page }) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER } });
  await mockClockifyStatus(page, { connected: false, workspaceId: null });
  await page.goto("/time-tracker");
  await expect(
    page.getByRole("heading", { name: "Time Tracker" }),
  ).toBeVisible();
  await expect(
    page.getByText("Connect your Clockify account to start tracking time."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Connect Clockify" }),
  ).toBeVisible();
  await expect(
    page.getByPlaceholder("Enter your Clockify API key"),
  ).toBeVisible();
});

test("shows workspace picker when connected but no workspace selected", async ({
  page,
}) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER } });
  await mockClockifyStatus(page, { connected: true, workspaceId: null });
  await mockClockifyWorkspaces(page);
  await page.goto("/time-tracker");
  await expect(
    page.getByText("Choose a workspace to track time in."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "My Workspace" }),
  ).toBeVisible();
});

test("shows tracker view when connected with workspace", async ({ page }) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER } });
  await mockClockifyStatus(page, { connected: true, workspaceId: "ws1" });
  await mockClockifyTracker(page, "ws1");
  await page.goto("/time-tracker");
  await expect(page.getByPlaceholder("What are you working on?")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
  await expect(page.getByText("Entries")).toBeVisible();
});

test("tracker shows no entries message when entry list is empty", async ({
  page,
}) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER } });
  await mockClockifyStatus(page, { connected: true, workspaceId: "ws1" });
  await mockClockifyTracker(page, "ws1");
  await page.goto("/time-tracker");
  await expect(page.getByText("No entries yet.")).toBeVisible();
});

test("tracker shows project filter when projects exist", async ({ page }) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER } });
  await mockClockifyStatus(page, { connected: true, workspaceId: "ws1" });
  await mockClockifyTracker(page, "ws1");
  await page.goto("/time-tracker");
  await expect(page.getByRole("button", { name: "Project A" })).toBeVisible();
  await expect(page.getByRole("button", { name: "All" })).toBeVisible();
});

test("connected state shows update API key section", async ({ page }) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER } });
  await mockClockifyStatus(page, { connected: true, workspaceId: "ws1" });
  await mockClockifyTracker(page, "ws1");
  await page.goto("/time-tracker");
  await expect(page.getByText("Update API key or workspace")).toBeVisible();
});

test("connect form button disabled when API key empty", async ({ page }) => {
  await mockGraphQL(page, { Me: { me: MOCK_USER } });
  await mockClockifyStatus(page, { connected: false, workspaceId: null });
  await page.goto("/time-tracker");
  await expect(
    page.getByRole("button", { name: "Connect Clockify" }),
  ).toBeDisabled();
});
