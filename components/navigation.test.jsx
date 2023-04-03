import React from "react";
import { render } from "@testing-library/react";
import Navigation from "./Navigation";
import "@testing-library/jest-dom";

describe("Navigation component", () => {
    const links = [
        {
            position: 1,
            page: "home",
            label: "Home",
            parent_page: "",
            target: "_self",
            sub_menu: false,
        },
        {
            position: 2,
            page: "about",
            label: "About",
            parent_page: "",
            target: "_self",
            sub_menu: false,
        },
        {
            position: 3,
            page: "services",
            label: "Services",
            parent_page: "",
            target: "_self",
            sub_menu: true,
        },
        {
            position: 4,
            page: "rentals",
            label: "Rentals",
            parent_page: "",
            target: "_self",
            sub_menu: false,
        },
    ];

    const brandUrl = "https://example.com";
    const bg = "light";
    const variant = "dark";
    const page = "home";

    it("renders with expected props", () => {
        const { getByText } = render(
            <Navigation
                bg={bg}
                variant={variant}
                brandUrl={brandUrl}
                links={links}
                page={page}
            />
        );

        expect(getByText("UtahCollegeApartments")).toBeInTheDocument();
        expect(getByText("Home")).toBeInTheDocument();
        expect(getByText("About")).toBeInTheDocument();
        expect(getByText("Services")).toBeInTheDocument();
        expect(getByText("Rentals")).toBeInTheDocument();
    });

    it("renders the logo with expected props", () => {
        const { getByAltText } = render(
            <Navigation
                bg={bg}
                variant={variant}
                brandUrl={brandUrl}
                links={links}
                page={page}
            />
        );

        expect(getByAltText("UtahCollegeApartments")).toBeInTheDocument();
        expect(getByAltText("UtahCollegeApartments").getAttribute("src")).toContain("logo.gif")
        expect(getByAltText("UtahCollegeApartments")).toHaveAttribute(
            "width",
            "120"
        );
        expect(getByAltText("UtahCollegeApartments")).toHaveAttribute(
            "height",
            "120"
        );
    });
});

