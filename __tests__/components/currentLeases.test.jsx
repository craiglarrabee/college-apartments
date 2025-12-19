import {fireEvent, render, screen} from "@testing-library/react";
import CurrentLeases from "../../components/currentLeases";
import "@testing-library/jest-dom";

describe("CurrentLeases component", () => {
    const mockRooms = [
        {
            leaseId: 1,
            rooms: [
                {room_type_id: 101, room_desc: "Private"},
                {room_type_id: 102, room_desc: "Shared"},
            ],
        },
    ];
    const mockRegister = jest.fn();

    test("renders correct lease description", () => {
        render(<CurrentLeases leaseDescription="Test Lease" rooms={[]}/>);
        const leaseDesc = screen.getByText(/Rates For:Test Lease/i);
        expect(leaseDesc).toBeInTheDocument();
    });

    test("renders correct number of room options", () => {
        render(<CurrentLeases canChangeApplication={true} leaseId={mockRooms[0].leaseId} register={mockRegister} rooms={mockRooms[0].rooms}/>);
        const roomOptions = screen.getAllByRole("radio");
        expect(roomOptions).toHaveLength(mockRooms[0].rooms.length);
    });

    test("calls register with correct arguments for each room option", () => {
        const mockRegister = jest.fn();
        render(<CurrentLeases canChangeApplication={true} leaseId={mockRooms[0].leaseId} register={mockRegister} rooms={mockRooms[0].rooms}/>);
        mockRooms[0].rooms.forEach(() => {
            expect(mockRegister).toHaveBeenCalledWith(`lease_${mockRooms[0].leaseId}_room_type_id`, {
                setValueAs: expect.any(Function),
            });
        });
    });

    test("selects a room option when clicked", () => {
        render(<CurrentLeases canChangeApplication={true} leaseId={mockRooms[0].leaseId} register={mockRegister} rooms={mockRooms[0].rooms}/>);
        const roomOption = screen.getByLabelText(/Private/i);
        fireEvent.click(roomOption);
        expect(roomOption).toBeChecked();
    });
});
