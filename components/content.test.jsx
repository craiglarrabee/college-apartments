describe("Content component tests", () => {
  describe("Rendering", () => {
    it("Should render without errors", () => {
      render(<Content site="test-site" page="test-page" />);
      expect(screen.queryByText("Content component tests")).toBeNull();
    });
  });

  describe("Content with images", () => {
    it("Should render the carousel with images when images props is passed with at least one image", () => {
      const images = ["image1.png", "image2.png"];
      render(<Content site="test-site" page="test-page" images={images} />);
      expect(screen.queryByRole("img")).toBeInTheDocument();
    });

    it("Should not render the carousel when images props is passed without any image", () => {
      const images = [];
      render(<Content site="test-site" page="test-page" images={images} />);
      expect(screen.queryByRole("img")).toBeNull();
    });
  });

  describe("Content with top and bottom content", () => {
    it("Should render the top and bottom page contents when props are passed", () => {
      const top = "test top content";
      const bottom = "test bottom content";
      render(
        <Content
          site="test-site"
          page="test-page"
          top={top}
          bottom={bottom}
        />
      );
      expect(screen.getByText("test top content")).toBeInTheDocument();
      expect(screen.getByText("test bottom content")).toBeInTheDocument();
    });

    it("Should not render the bottom page content when only top content is passed", () => {
      const top = "test top content";
      render(<Content site="test-site" page="test-page" top={top} />);
      expect(screen.getByText("test top content")).toBeInTheDocument();
      expect(screen.queryByText("test bottom content")).toBeNull();
    });
  });
});