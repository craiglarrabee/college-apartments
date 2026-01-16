import {render, screen} from "@testing-library/react";
import {PaymentLineItems, PaymentLineItem} from "../../components/paymentLineItems";
import "@testing-library/jest-dom";

describe("PaymentLineItems", () => {
    const mockRegister = jest.fn((name, _options) => ({
        name,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
    }));
    const mockResetField = jest.fn();
    const mockSetParentPaymentItems = jest.fn();
    const mockSetParentTotal = jest.fn();

    const defaultProps = {
        resetField: mockResetField,
        register: mockRegister,
        errors: {},
        site: "snow",
        paymentItems: [{id: 0, description: "", amount: "", surcharge: "", unitPrice: ""}],
        paymentTotal: "$0.00",
        setParentPaymentItems: mockSetParentPaymentItems,
        setParentTotal: mockSetParentTotal,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders payment line items", () => {
        render(<PaymentLineItems {...defaultProps} />);
        expect(screen.getByText("Description")).toBeInTheDocument();
        expect(screen.getByText("Amnt")).toBeInTheDocument();
        expect(screen.getByText("Total")).toBeInTheDocument();
    });

    it("displays admin-created items with disabled fields", () => {
        const adminItems = [{
            id: 0,
            description: "Deposit",
            amount: "100.00",
            surcharge: "2.75",
            unitPrice: "102.75",
            isAdminCreated: true
        }];

        render(<PaymentLineItems {...defaultProps} paymentItems={adminItems} />);

        const amountField = screen.getByDisplayValue("$100.00");
        const descriptionSelect = screen.getByRole("combobox");

        expect(descriptionSelect).toBeDisabled();
        expect(amountField).toBeDisabled();
    });

    it("allows user-created items to be edited", () => {
        const userItems = [{
            id: 0,
            description: "",
            amount: "",
            surcharge: "",
            unitPrice: "",
            isAdminCreated: false
        }];

        render(<PaymentLineItems {...defaultProps} paymentItems={userItems} />);

        const descriptionField = screen.getByRole("combobox");
        const amountField = screen.getByPlaceholderText("Amount");

        expect(descriptionField).not.toBeDisabled();
        expect(amountField).not.toBeDisabled();
    });
});

describe("PaymentLineItem", () => {
    const mockRegister = jest.fn((name, _options) => ({
        name,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
    }));
    const mockUpdateLineItem = jest.fn();
    const mockRemoveLineItem = jest.fn();
    const mockGetSurcharge = jest.fn(() => 2.75);
    const mockResetField = jest.fn();

    const defaultProps = {
        register: mockRegister,
        errors: {},
        resetField: mockResetField,
        site: "snow",
        id: 0,
        updateLineItem: mockUpdateLineItem,
        removeLineItem: mockRemoveLineItem,
        getSurcharge: mockGetSurcharge,
        desc: "",
        amt: "",
        tot: "",
        chg: "",
        isAdminCreated: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders required label for user-created items", () => {
        render(<PaymentLineItem {...defaultProps} />);

        const descriptionLabel = screen.getByText("Description");
        const amountLabel = screen.getByText("Amnt");

        expect(descriptionLabel.className).toContain("required");
        expect(amountLabel.className).toContain("required");
    });

    it("does not render required label for admin-created items", () => {
        render(<PaymentLineItem {...defaultProps} isAdminCreated={true} desc="Deposit" amt="100.00" />);

        const descriptionLabel = screen.getByText("Description");
        const amountLabel = screen.getByText("Amnt");

        expect(descriptionLabel.className).not.toContain("required");
        expect(amountLabel.className).not.toContain("required");
    });

    it("applies required validation to user-created items", () => {
        render(<PaymentLineItem {...defaultProps} />);

        // Check that register was called with required: true for user items
        const registerCalls = mockRegister.mock.calls;
        const descriptionCall = registerCalls.find(call => call[0].startsWith("description_"));
        const amountCall = registerCalls.find(call => call[0].startsWith("amount_"));

        expect(descriptionCall[1].required.value).toBe(true);
        expect(amountCall[1].required.value).toBe(true);
    });

    it("does not apply required validation to admin-created items", () => {
        render(<PaymentLineItem {...defaultProps} isAdminCreated={true} desc="Deposit" amt="100.00" />);

        // Check that register was called with required: false for admin items
        const registerCalls = mockRegister.mock.calls;
        const descriptionCall = registerCalls.find(call => call[0].startsWith("description_"));
        const amountCall = registerCalls.find(call => call[0].startsWith("amount_"));

        expect(descriptionCall[1].required.value).toBe(false);
        expect(amountCall[1].required.value).toBe(false);
    });

    it("hides trash button for admin-created items", () => {
        const {container} = render(<PaymentLineItem {...defaultProps} isAdminCreated={true} desc="Deposit" amt="100.00" />);

        // Check that the trash button is not rendered (we're looking for the button element)
        const trashButtons = container.querySelectorAll('button[title="Remove item"]');
        expect(trashButtons.length).toBe(0);
    });

    it("shows trash button for user-created items", () => {
        const {container} = render(<PaymentLineItem {...defaultProps} />);

        const trashButton = container.querySelector('button[title="Remove item"]');
        expect(trashButton).toBeInTheDocument();
    });
});

