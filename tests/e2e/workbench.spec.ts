import { expect, test } from "@playwright/test";

test("landing page shows upload call to action", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "AI Resume Screening Workbench" })
  ).toBeVisible();
  await expect(
    page.getByText("Upload a batch of PDF or .docx resumes to extract AI-related evidence.")
  ).toBeVisible();
  await expect(page.getByRole("form", { name: "Upload resumes" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create batch" })).toBeVisible();
});
