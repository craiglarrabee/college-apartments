import React from "react";
import {render, screen} from "@testing-library/react";
import LeaseRoom from "../../components/leaseRoom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import fetchMock from "jest-fetch-mock";


describe("LeaseRoom", () => {
    const lease_id = "1";
    const room_type_id = "2";
    const room_rent = "100";
    const room_desc = "test description";
    let user;

    beforeAll(() => {
        fetchMock.enableMocks();
        user = userEvent.setup();
    });

    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.mockResponseOnce(undefined, {status: 204});
    });

    it("renders room details for non-editable mode", () => {
        render(<LeaseRoom lease_id={lease_id} room_type_id={room_type_id} room_rent={room_rent} room_desc={room_desc}
                          canEdit={false}/>);
        const roomId = screen.getByText(`#${room_type_id}:`);
        const rent = screen.getByText(`$${room_rent}.00`);
        const desc = screen.getByText(room_desc);
        expect(roomId).toBeInTheDocument();
        expect(rent).toBeInTheDocument();
        expect(desc).toBeInTheDocument();
    });

    it("renders edit form for editable mode", () => {
        render(<LeaseRoom lease_id={lease_id} room_type_id={room_type_id} room_rent={room_rent} room_desc={room_desc}
                          canEdit={true}/>);
        const roomId = screen.getByLabelText("Room Type");
        const rent = screen.getByLabelText("Room Rent");
        const desc = screen.getByLabelText("Room Description");
        expect(roomId).toBeInTheDocument();
        expect(rent).toBeInTheDocument();
        expect(desc).toBeInTheDocument();
    });

    it("updates room rent when changed", async () => {
        render(<LeaseRoom lease_id={lease_id} room_type_id={room_type_id} room_rent={room_rent} room_desc={room_desc}
                          canEdit={true}/>);
        const rentInput = screen.getByLabelText("Room Rent");
        await user.type(rentInput, "200", {initialSelectionStart: 0, initialSelectionEnd: 4});
        await user.tab();
        expect(rentInput).toHaveValue("200");
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait for debounce
        expect(fetchMock).toHaveBeenCalledWith(`/api/leases/${lease_id}/rooms/${room_type_id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({room_rent: "200"}),
        });
    });

    it("updates room description when changed", async () => {
        render(<LeaseRoom lease_id={lease_id} room_type_id={room_type_id} room_rent={room_rent} room_desc={room_desc}
                          canEdit={true}/>);
        const descInput = screen.getByLabelText("Room Description");
        await user.type(descInput, "new description", {initialSelectionStart: 0, initialSelectionEnd: 16});
        await user.tab();
        expect(descInput).toHaveValue("new description");
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait for debounce
        expect(fetchMock).toHaveBeenCalledWith(`/api/rooms/${room_type_id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({room_desc: "new description"}),
        });
    });
});
