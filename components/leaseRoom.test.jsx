import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LeaseRoom from "./LeaseRoom";
import "@testing-library/jest-dom";

describe("LeaseRoom", () => {
    const lease_id = "1";
    const room_type_id = "2";
    const room_rent = "100";
    const room_desc = "test description";

    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve()
        )
    });

    test("renders room details for non-editable mode", () => {
        render(<LeaseRoom lease_id={lease_id} room_type_id={room_type_id} room_rent={room_rent} room_desc={room_desc} canEdit={false} />);
        const roomId = screen.getByText(`#${room_type_id}:`);
        const rent = screen.getByText(`$${room_rent}.00`);
        const desc = screen.getByText(room_desc);
        expect(roomId).toBeInTheDocument();
        expect(rent).toBeInTheDocument();
        expect(desc).toBeInTheDocument();
    });

    test("renders edit form for editable mode", () => {
        render(<LeaseRoom lease_id={lease_id} room_type_id={room_type_id} room_rent={room_rent} room_desc={room_desc} canEdit={true} />);
        const rent = screen.getByDisplayValue(room_rent);
        const desc = screen.getByDisplayValue(room_desc);
        expect(rent).toBeInTheDocument();
        expect(desc).toBeInTheDocument();
    });

    test("updates room rent when changed", async () => {
        render(<LeaseRoom lease_id={lease_id} room_type_id={room_type_id} room_rent={room_rent} room_desc={room_desc} canEdit={true} />);
        const rentInput = screen.getByDisplayValue(room_rent);
        fireEvent.change(rentInput, {target: {value: "200"}});
        expect(rentInput).toHaveValue("200");
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait for debounce
        expect(global.fetch).toHaveBeenCalledWith(`/api/leases/${lease_id}/rooms/${room_type_id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({room_rent: "200"}),
        });
    });

    test("updates room description when changed", async () => {
        render(<LeaseRoom lease_id={lease_id} room_type_id={room_type_id} room_rent={room_rent} room_desc={room_desc} canEdit={true} />);
        const descInput = screen.getByDisplayValue(room_desc);
        fireEvent.change(descInput, {target: {value: "new description"}});
        expect(descInput).toHaveValue("new description");
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait for debounce
        expect(global.fetch).toHaveBeenCalledWith(`/api/rooms/${room_type_id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({room_desc: "new description"}),
        });
    });
});
