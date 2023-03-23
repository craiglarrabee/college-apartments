import Home from "../pages";
import {render} from "@testing-library/react";
import "@testing-library/jest-dom";

describe("Home", () => {
    beforeAll(() => {
        render(<Home/>);
    });

    it("renders navigation", () => {
        const el = document.getElementsByClassName("sidebar-menu")[0];
        expect(el).toHaveAttribute("role", "navigation");
    });

});
