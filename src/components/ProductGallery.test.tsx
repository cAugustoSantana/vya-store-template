import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProductGallery } from "./ProductGallery";

describe("ProductGallery", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the next and previous image", () => {
    render(
      <ProductGallery
        productId="prod-1"
        imageUrls={["/products/prod-1.svg", "/products/prod-2.svg"]}
        alt="Camiseta"
        zoomLabel="View full image"
        closeLabel="Close"
        previousLabel="Previous image"
        nextLabel="Next image"
      />,
    );

    const zoom = screen.getByRole("button", { name: "View full image" });
    expect(zoom.querySelector("img")).toHaveAttribute("src", "/products/prod-1.svg");

    fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(zoom.querySelector("img")).toHaveAttribute("src", "/products/prod-2.svg");

    fireEvent.click(screen.getByRole("button", { name: "Previous image" }));
    expect(zoom.querySelector("img")).toHaveAttribute("src", "/products/prod-1.svg");
  });
});
