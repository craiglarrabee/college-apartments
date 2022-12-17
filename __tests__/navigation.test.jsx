import {render, screen} from "@testing-library/react";
import Navigation from "../components/navigation";
import "@testing-library/jest-dom";

describe("Navigation", () => {
    beforeEach(() => {
        render(<Navigation brandUrl="testurl"/>);
    });

    it("renders return image", () => {
        const img = screen.getByRole("img", {name: "UtahCollegeApartments"});
        expect(img).toBeInTheDocument();
    });

    it("renders return links", () => {
        const links = screen.getAllByRole("link", {name: "UtahCollegeApartments"});
        links.forEach(link => expect(link).toHaveAttribute("href", "testurl"));
    });

    it("renders common navigation buttons", () => {
        expect(screen.getByRole("button", {name: "Home"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Apartments"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Clubhouse"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Park & Grounds"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Activities"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Local Area"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Application"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Parent Guaranty"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "F.A.Q."})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Summer Rental"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Contact Us"})).toBeInTheDocument();
    });
});