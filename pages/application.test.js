
import { shallow } from "enzyme";
import React from "react";
import Application, {getServerSideProps } from "../pages/application";
import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import { Button, Form } from "react-bootstrap";


jest.mock("../lib/db/content/navLinks");
jest.mock("../lib/db/users/roomType");
jest.mock("../lib/db/users/applicationInfo");


describe("Layout component", () => {
    it("should render properly", () => {
        const wrapper = shallow(<Layout/>);
        expect(wrapper).toMatchSnapshot();
    });
});

describe("Navigation component", () => {
    it("should render properly", () => {
        const wrapper = shallow(<Navigation/>);
        expect(wrapper).toMatchSnapshot();
    });
});

describe("Title component", () => {
    it("should render properly", () => {
        const wrapper = shallow(<Title/>);
        expect(wrapper).toMatchSnapshot();
    });
});

describe("Footer component", () => {
    it("should render properly", () => {
        const wrapper = shallow(<Footer/>);
        expect(wrapper).toMatchSnapshot();
    });
});

describe("Application page Component", () => {
    it("renders without crashing", () => {
        shallow(<Application/>);
    });

    it("should have submit button disabled by default", () => {
        const wrapper = shallow(<Application/>);
        const submitButton = wrapper.find(Button);
        expect(submitButton.prop("disabled")).toBe(true);
    });

    it("onSubmit function should call console log on failure", async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: false,
            status: 400
        }));

        console.log = jest.fn();
        const wrapper = shallow(<Application/>);
        const form = wrapper.find(Form);

        const onSubmit = form.props().onSubmit;
        await onSubmit({preventDefault: () => {}});

        expect(console.log).toHaveBeenCalled();
    });

    it("room select options should be rendered correctly according to leases", async () => {
        const mockGetServerSideProps = jest.fn(getServerSideProps);
        const context = { req: { session: { user: {isLoggedIn: true}}}, resolvedUrl: "http://someurl.com/"};
        const serverSideProps = await mockGetServerSideProps(context);

        const wrapper = shallow(<Application {...serverSideProps.props}/>);

        const options = wrapper.find("[name='lease_room_type_id']").find("option");

        const expected = "8W_1_1_small\n" +
            "8W_2_2_large\n" +
            "9M_1_1_small\n" +
            "9M_2_2_large";
        const actual = options.map(option => option.text()).join("\n");

        expect(actual).toBe(expected);
    });

    it("onSubmit function should call location change on success", async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            status: 204
        }));

        global.location = {
            assign: jest.fn()
        };

        const wrapper = shallow(<Application/>);
        const form = wrapper.find(Form);

        const onSubmit = form.props().onSubmit;
        await onSubmit({preventDefault: () => {}});

        expect(location.assign).toHaveBeenCalledWith("/deposit");
    });

});
