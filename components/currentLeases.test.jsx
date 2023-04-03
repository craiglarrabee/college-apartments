import {fireEvent, render, screen} from "@testing-library/react";
import CurrentLeases from "./CurrentLeases";
import "@testing-library/jest-dom";

describe("CurrentLeases component", () => {
    const mockRooms = [
        {
            room_type_id: 1,
            room_desc: "Room 1",
            room_rent: 100,
            lease_id: 1,
        },
        {
            room_type_id: 2,
            room_desc: "Room 2",
            room_rent: 200,
            lease_id: 1,
        },
    ];
    const mockRegister = jest.fn();

    test("renders correct lease description", () => {
        render(<CurrentLeases leaseDescription="Test Lease" rooms={[]} />);
        const leaseDesc = screen.getByText(/Rates For:Test Lease/i);
        expect(leaseDesc).toBeInTheDocument();
    });

    test("renders correct number of room options", () => {
        render(<CurrentLeases register={mockRegister} rooms={mockRooms} />);
        const roomOptions = screen.getAllByRole("radio");
        expect(roomOptions).toHaveLength(mockRooms.length);
    });

    test("calls register with correct arguments for each room option", () => {
        render(<CurrentLeases register={mockRegister} rooms={mockRooms} />);
        mockRooms.forEach((room) => {
            expect(mockRegister).toHaveBeenCalledWith("lease_room_type_id", {
                required: "Please select a Room Type above.",
                setValueAs: expect.any(Function),
            });
        });
    });

    test("disables room options when not enabled", () => {
        render(<CurrentLeases register={mockRegister} rooms={mockRooms} enabled={false} />);
        const roomOptions = screen.getAllByRole("radio");
        expect(roomOptions[0]).toBeDisabled();
        expect(roomOptions[1]).toBeDisabled();
    });

    test("enables room options when enabled", () => {
        render(<CurrentLeases register={mockRegister} rooms={mockRooms} enabled />);
        const roomOptions = screen.getAllByRole("radio");
        expect(roomOptions[0]).toBeEnabled();
        expect(roomOptions[1]).toBeEnabled();
    });

    test("selects a room option when clicked", () => {
        render(<CurrentLeases register={mockRegister} rooms={mockRooms} />);
        const roomOption = screen.getByLabelText(/\$100\/sem - Room 1/i);
        fireEvent.click(roomOption);
        expect(roomOption).toBeChecked();
    });
});
