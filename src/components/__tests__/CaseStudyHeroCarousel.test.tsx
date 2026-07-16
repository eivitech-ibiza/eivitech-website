import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { CaseStudyTemplate } from "@/components/CaseStudyTemplate";
import type { Project } from "@/data/projects";

vi.mock("@/components/SEO", () => ({ SEO: () => null }));
vi.mock("@/components/CTASection", () => ({ CTASection: () => null }));
vi.mock("@/components/ProjectCard", () => ({ ProjectCard: () => null }));

const project = {
  slug: "carousel-test",
  name: "Carousel test project",
  category: "Villa",
  type: "Reforma",
  intervention: "Integral",
  short: "Test project",
  zone: "Ibiza",
  style: "Mediterranean",
  cover: "/image-one.webp",
  gallery: ["/image-one.webp", "/image-two.webp", "/image-three.webp"],
  challenge: "Challenge",
  situation: "Situation",
  vision: "Vision",
  goal: "Goal",
  solution: "Solution",
  works: [],
  materials: [],
  lighting: "Lighting",
  craftsmanship: "Craftsmanship",
  result: "Result",
  metaTitle: "Test",
  metaDescription: "Test",
  crmInterest: "test",
} as Project;

function renderCarousel() {
  render(
    <MemoryRouter>
      <CaseStudyTemplate project={project} />
    </MemoryRouter>,
  );
}

describe("CaseStudyTemplate hero carousel", () => {
  it("moves through images with controls and dots", () => {
    renderCarousel();

    const nextButtons = screen.getAllByRole("button", { name: /imagen siguiente|immagine successiva|next image/i });
    fireEvent.click(nextButtons[0]);
    expect(screen.getByText(/2 \/ 3:/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /3/ }));
    expect(screen.getByText(/3 \/ 3:/)).toBeInTheDocument();
  });

  it("supports keyboard navigation on the carousel region", () => {
    renderCarousel();

    const carousel = screen.getByRole("region", { name: /galería principal|galleria principale|main project gallery/i });
    fireEvent.keyDown(carousel, { key: "ArrowRight" });
    expect(screen.getByText(/2 \/ 3:/)).toBeInTheDocument();

    fireEvent.keyDown(carousel, { key: "ArrowLeft" });
    expect(screen.getByText(/1 \/ 3:/)).toBeInTheDocument();
  });
});
