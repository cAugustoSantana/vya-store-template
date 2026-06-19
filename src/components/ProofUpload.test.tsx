import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProofUpload } from "./ProofUpload";
import { renderWithProviders } from "@/test/render";

vi.mock("@/lib/api", () => ({
  uploadProof: vi.fn().mockResolvedValue({ ok: true }),
}));

import { uploadProof } from "@/lib/api";

describe("ProofUpload", () => {
  beforeEach(() => {
    vi.mocked(uploadProof).mockClear();
  });

  it("renders file input and uploads png", async () => {
    const onUploaded = vi.fn();
    renderWithProviders(
      <ProofUpload displayId="MITIENDA-12345" onUploaded={onUploaded} />,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    const file = new File([new Uint8Array([137, 80, 78, 71])], "proof.png", {
      type: "image/png",
    });
    const user = userEvent.setup();
    await user.upload(input, file);

    await waitFor(() => {
      expect(uploadProof).toHaveBeenCalledWith(
        "MITIENDA-12345",
        expect.any(String),
        "image/png",
      );
    });
    expect(onUploaded).toHaveBeenCalled();
  });

  it("shows hint for disallowed file types", async () => {
    renderWithProviders(
      <ProofUpload displayId="MITIENDA-12345" onUploaded={() => {}} />,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["text"], "notes.txt", { type: "text/plain" });
    const user = userEvent.setup();
    await user.upload(input, file);

    expect(uploadProof).not.toHaveBeenCalled();
    expect(screen.getAllByText(/PNG|JPEG/i).length).toBeGreaterThan(0);
  });
});
