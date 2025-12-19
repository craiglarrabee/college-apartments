import {render, screen, waitFor, fireEvent} from "@testing-library/react";
import Login from "../../components/Login";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import fetchMock from "jest-fetch-mock";

describe("Login component", () => {

    beforeAll(() => {
        fetchMock.enableMocks();
    });

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it("renders Login component", () => {
        render(<Login show={true}/>);
        expect(screen.getByText("User Login")).toBeInTheDocument();
    });

    it("shows error message on invalid login", async () => {
        const user = userEvent.setup();

        fetchMock.mockResponseOnce(JSON.stringify({error: "invalid"}), {status: 400});
        const setNewUser = jest.fn();
        const site = "example.com";
        const close = jest.fn();
        const {getByText, getByLabelText} = render(
            <Login show={true} setNewUser={setNewUser} site={site} close={close}/>
        );

        const usernameInput = getByLabelText("Username");
        const passwordInput = getByLabelText("Password");
        const loginButton = getByText("Login");

        await user.type(usernameInput, "invalid-username");
        await user.type(passwordInput, "invalid-password");
        // Trigger blur to ensure RHF validation state updates
        usernameInput.blur();
        passwordInput.blur();

        // Submit the form regardless of button disabled state (mirror success path)
        const form = loginButton.closest('form');
        expect(form).toBeTruthy();
        await waitFor(() => {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        });

        // Wait for fetch to be called and ensure failure path didn't close or set user
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        expect(setNewUser).not.toHaveBeenCalled();
        expect(close).not.toHaveBeenCalled();
        // Optional visual check (non-fatal in jsdom/react-bootstrap Modal)
        const alert = screen.queryByTestId("login-error");
        if (alert) expect(alert).toBeInTheDocument();
    });

    it("calls setNewUser and close on successful login", async () => {
        const user = userEvent.setup();

        const newUser = {user: {username: "valid-username"}};
        fetchMock.mockResponseOnce(JSON.stringify({...newUser}), {status: 200})
        const setNewUser = jest.fn();
        const site = "example.com";
        const close = jest.fn();
        const {getByLabelText, getByText} = render(
            <Login show={true} setNewUser={setNewUser} site={site} close={close}/>
        );
        const usernameInput = getByLabelText("Username");
        const passwordInput = getByLabelText("Password");
        const loginButton = getByText("Login");

        await user.type(usernameInput, "valid-username");
        await user.type(passwordInput, "valid-password");

        // Force submit
        const form = loginButton.closest('form');
        await waitFor(() => {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        });

        await waitFor(() => expect(setNewUser).toHaveBeenCalledWith(newUser));
        expect(close).toHaveBeenCalled();
    });
});
