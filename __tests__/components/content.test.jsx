import React from "react";
import {render, screen, within} from "@testing-library/react";
import Content from "../../components/content";
import "@testing-library/jest-dom";

describe("Content", () => {
    const site = "example";
    const page = "home";
    const top = "Top content";
    const bottom = "Bottom content";
    const canEdit = true;

    it("renders the top content", () => {
        const {getByText} = render(<Content site={site} page={page} top={top} canEdit={canEdit}/>);
        expect(getByText("Top content")).toBeInTheDocument();
    });

    it("does not render the bottom content when the prop is not provided", () => {
        const {queryByText} = render(<Content site={site} page={page} top={top} canEdit={canEdit}/>);
        expect(queryByText("Bottom content")).toBeNull();
    });

    it("renders the bottom content when the prop is provided", () => {
        const {getByText} = render(<Content site={site} page={page} top={top} bottom={bottom} canEdit={canEdit}/>);
        expect(getByText("Bottom content")).toBeInTheDocument();
    });

    it("does not render the carousel when the images prop is not provided", () => {
        const {queryByRole} = render(<Content site={site} page={page} top={top} canEdit={canEdit}/>);
        expect(queryByRole("carousel")).toBeNull();
    });

    const imageProps = {"image1.png": "Caption 1", "image2.png": "Caption 2", "image3.png": "Caption 3"};

    it("should render a Carousel component when images prop is provided", () => {
        const images = ["image1.png", "image2.png", "image3.png"];
        render(<Content site={site} page={page} images={images} canEdit={false} restOfProps={imageProps}/>);
        const carousel = screen.getByRole("carousel");
        expect(carousel).toBeInTheDocument();
        expect(carousel).toHaveClass("carousel slide");
    });

    it("should render a Carousel.Item component for each image when images prop is provided", () => {
        const images = ["image1.png", "image2.png", "image3.png"];
        render(<Content site={site} page={page} images={images} canEdit={false} restOfProps={imageProps}/>);
        const carouselItems = screen.getAllByRole("carousel-item");
        expect(carouselItems.length).toBe(images.length);
        carouselItems.forEach((item, i) => {
            expect(item).toHaveClass("carousel-item");
            const {getByRole} = within(item);
            expect(getByRole("carousel-image")).toHaveAttribute("alt", images[i]);
        });
    });

    it("should render an Image component for each image when images prop is provided", () => {
        const images = ["image1.png", "image2.png", "image3.png"];
        render(<Content site={site} page={page} images={images} canEdit={false} restOfProps={imageProps}/>);
        const carouselImages = screen.getAllByRole("carousel-image");
        expect(carouselImages.length).toBe(images.length);
        carouselImages.forEach((image, i) => {
            expect(image).toHaveAttribute("alt", images[i]);
        });
    });

    it("should not render a Carousel component when images prop is not provided", () => {
        render(<Content site={site} page={page}/>);
        const carousel = screen.queryByRole("carousel");
        expect(carousel).toBeNull();
    });

    it("renders editable page content buttons when canEdit", async () => {
        render(<Content site={site} page={page} top={top} bottom={bottom} canEdit={true} images={["image1.png"]} restOfProps={{"image1.png": "Caption"}}/>);
        const editButtons = screen.getAllByRole("edit");
        expect(editButtons.length).toBeGreaterThan(0);
    });
});
