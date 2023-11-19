import { render } from "@testing-library/react";
import Layout from "../../components/layout";
import "@testing-library/jest-dom";

describe("Layout component", () => {
    test("renders children", () => {
        const { getByText } = render(<Layout site={site} >Test Content</Layout>);
        const content = getByText(/Test Content/i);
        expect(content).toBeInTheDocument();
    });

    test("applies default classnames to main wrapper", () => {
        const { container } = render(<Layout site={site} >Test Content</Layout>);
        const mainWrapper = container.querySelector(".main-wrapper");
        expect(mainWrapper).toHaveClass("main-wrapper-responsive-lg");
    });

    test("does not apply additional classnames to main wrapper when bg prop is not set", () => {
        const { container } = render(<Layout site={site} >Test Content</Layout>);
        const mainWrapper = container.querySelector(".main-wrapper");
        expect(mainWrapper).not.toHaveClass("bg-dark");
    });

    test("does not apply undefined classnames to main wrapper", () => {
        const { container } = render(<Layout site={site}  bg={undefined}>Test Content</Layout>);
        const mainWrapper = container.querySelector(".main-wrapper");
        expect(mainWrapper).not.toHaveClass("undefined");
    });
});
