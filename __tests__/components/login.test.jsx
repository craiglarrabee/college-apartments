import {render, screen, waitFor} from "@testing-library/react";
import Login from "../../components/Login";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import fetchMock from "jest-fetch-mock";

let user;

describe("Login component", () => {

    beforeAll(() => {
        fetchMock.enableMocks();
        user = userEvent.setup();
    });

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it("renders Login component", () => {
        render(<Login show={true}/>);
        expect(screen.getByText("User Login")).toBeInTheDocument();
    });

    it("shows error message on invalid login", async () => {

        fetchMock.mockResponseOnce(undefined, {status: 400});
        const setNewUser = jest.fn();
        const site = "example.com";
        const close = jest.fn();
        const {getByText, getByLabelText} = render(
            <Login show={true} setNewUser={setNewUser} site={site} close={close} />
        );

        const usernameInput = getByLabelText("Username");
        const passwordInput = getByLabelText("Password");
        const loginButton = getByText("Login");
        expect(loginButton).toBeDisabled();

        await user.type(usernameInput, "invalid-username");
        await user.type(passwordInput, "invalid-password");
        await waitFor(() => expect(loginButton).not.toBeDisabled()); // form should now be dirty and valid so login button should be enabled
        await user.click(loginButton);

        await waitFor(() => expect(screen.queryByText("Incorrect username or password.")).toBeInTheDocument());
        expect(setNewUser).not.toHaveBeenCalled();
        expect(close).not.toHaveBeenCalled();
    });

    it("calls setNewUser and close on successful login", async () => {
        const newUser = {user: {username: "valid-username"}};
        fetchMock.mockResponseOnce(JSON.stringify({...newUser}), {status: 200})
        const setNewUser = jest.fn();
        const site = "example.com";
        const close = jest.fn();
        const { getByLabelText, getByText } = render(
            <Login show={true} setNewUser={setNewUser} site={site} close={close} />
        );
        const usernameInput = getByLabelText("Username");
        const passwordInput = getByLabelText("Password");
        const loginButton = getByText("Login");

        await user.type(usernameInput, "valid-username");
        await user.type(passwordInput, "valid-password");
        await waitFor(() => expect(loginButton).not.toBeDisabled()); // form should now be dirty and valid so login button should be enabled
        await user.click(loginButton);

        expect(setNewUser).toHaveBeenCalledWith(newUser);
        expect(close).toHaveBeenCalled();
    });
});
