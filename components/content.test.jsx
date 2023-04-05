import React from "react";
import {render, screen, fireEvent, within} from "@testing-library/react";
import Content from "./Content";
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
        const {queryByTestId} = render(<Content site={site} page={page} top={top} canEdit={canEdit}/>);
        expect(queryByTestId("carousel")).toBeNull();
    });

    it("should render a Carousel component when images prop is provided", () => {
        const images = ["image1.png", "image2.png", "image3.png"];
        render(<Content images={images}/>);
        const carousel = screen.getByRole("carousel");
        expect(carousel).toBeInTheDocument();
        expect(carousel).toHaveClass("carousel slide");
    });

    it("should render a Carousel.Item component for each image when images prop is provided", () => {
        const images = ["image1.png", "image2.png", "image3.png"];
        let bob = render(<Content images={images}/>);
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
        render(<Content images={images}/>);
        const carouselImages = screen.getAllByRole("carousel-image");
        expect(carouselImages.length).toBe(images.length);
        carouselImages.forEach((image, i) => {
            expect(image).toHaveAttribute("alt", images[i]);
            expect(image).toHaveAttribute("width", "650");
            expect(image).toHaveAttribute("height", "425");
        });
    });

    it("should not render a Carousel component when images prop is not provided", () => {
        render(<Content/>);
        const carousel = screen.queryByTestId("carousel");
        expect(carousel).toBeNull();
    });

    it("renders editable page content", async () => {
        render(<Content site={site} page={page} top={top} bottom={bottom} canEdit={canEdit} />);

        const editButtons = screen.getAllByRole("edit");
        expect(editButtons.length).toBe(2);
        //shouldn"t see edit dialog, with save button
        expect( await screen.queryByRole("save")).not.toBeInTheDocument();
        fireEvent.click(editButtons[0]);
        //now we should see the edit dialog , with save
        expect( await screen.queryByRole("save")).toBeInTheDocument();
    });
});
