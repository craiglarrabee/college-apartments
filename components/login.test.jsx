import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';
import "@testing-library/jest-dom";

describe('Login component', () => {

    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve()
        )
    });

    test('renders Login component', () => {
        render(<Login show={true}/>);
        expect(screen.getByText('User Login')).toBeInTheDocument();
    });

    test('shows error message on invalid login', async () => {

        global.fetch = jest.fn(() =>
            Promise.reject("API Failure")
        );
        const setNewUser = jest.fn();
        const site = 'example.com';
        const close = jest.fn();
        const { getByText, getByLabelText } = render(
            <Login show={true} setNewUser={setNewUser} site={site} close={close} />
        );
        const usernameInput = getByLabelText('Username');
        const passwordInput = getByLabelText('Password');
        const loginButton = getByText('Login');

        fireEvent.change(usernameInput, { target: { value: 'invalid' } });
        fireEvent.change(passwordInput, { target: { value: 'invalid' } });
        fireEvent.click(loginButton);

        expect(await screen.findByText('Incorrect username or password.')).toBeInTheDocument();
        expect(setNewUser).not.toHaveBeenCalled();
        expect(close).not.toHaveBeenCalled();
    });

    test('calls setNewUser and close on successful login', async () => {
        const setNewUser = jest.fn();
        const site = 'example.com';
        const close = jest.fn();
        const { getByLabelText, getByText } = render(
            <Login show={true} setNewUser={setNewUser} site={site} close={close} />
        );
        const usernameInput = getByLabelText('Username');
        const passwordInput = getByLabelText('Password');
        const loginButton = getByText('Login');

        fireEvent.change(usernameInput, { target: { value: 'valid-username' } });
        fireEvent.change(passwordInput, { target: { value: 'valid-password' } });
        fireEvent.click(loginButton);

        expect(setNewUser).toHaveBeenCalled();
        expect(close).toHaveBeenCalled();
    });
});
