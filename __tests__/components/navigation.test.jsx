import React from "react";
import {queryByText, render, screen} from "@testing-library/react";
import Navigation from "../../components/navigation";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

jest.mock("next/router", () => ({
    useRouter: () => ({
        push: jest.fn(),
        prefetch: jest.fn(),
        pathname: "/",
        query: {},
        asPath: "/",
    })
}));

// Mock Next.js Image to a plain img to avoid base URL and optimization logic in tests
jest.mock('next/image', () => {
    return function MockNextImage({ priority, ...props }) {
        // Strip Next.js-specific props like `priority` that aren't valid on <img>
        return React.createElement('img', props);
    };
});

describe("Navigation component", () => {
    const links = [
        {
            position: "0001.0000",
            page: "home",
            label: "Home",
            parent_page: "",
            target: "_self",
            sub_menu: false,
        },
        {
            position: "0002.0000",
            page: "about",
            label: "About",
            parent_page: "",
            target: "_self",
            sub_menu: false,
        },
        {
            position: "0003.0000",
            page: "services",
            label: "Services",
            parent_page: "",
            target: "_self",
            sub_menu: true,
        },
        {
            position: "0003.0001",
            page: "service1",
            label: "Service1",
            target: "",
            parent_page: "services",
            sub_menu: false
        },
        {
            position: "0004.0000",
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

    it("renders with expected props", async () => {
        const user = userEvent.setup();
        const {getByText} = render(
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
        // Submenu is collapsed by default; expand it to reveal submenu items
        await user.click(getByText("Services"));
        expect(getByText("Services")).toBeInTheDocument();
        expect(getByText("Service1")).toBeInTheDocument();
        expect(getByText("Rentals")).toBeInTheDocument();
    });

    it("skips submenu if no items in submenu", () => {
        const testLinks = links.filter(link => link.parent_page !== "services")
        const {queryByText, getByText} = render(
            <Navigation
                bg={bg}
                variant={variant}
                brandUrl={brandUrl}
                links={testLinks}
                page={page}
            />
        );

        expect(getByText("UtahCollegeApartments")).toBeInTheDocument();
        expect(getByText("Home")).toBeInTheDocument();
        expect(getByText("About")).toBeInTheDocument();
        expect(queryByText("Services")).toBeNull();
        expect(getByText("Rentals")).toBeInTheDocument();
    });

    it("renders the logo with expected props", () => {
        const {getByAltText} = render(
            <Navigation
                bg={bg}
                variant={variant}
                brandUrl={brandUrl}
                links={links}
                page={page}
            />
        );

        expect(getByAltText("UtahCollegeApartments")).toBeInTheDocument();
        // Accept either light or dark logo assets and common extensions; align with current component rendering
        expect(getByAltText("UtahCollegeApartments").getAttribute("src")).toMatch(/logo(-dark)?\.(gif|png)/)
    });
});
