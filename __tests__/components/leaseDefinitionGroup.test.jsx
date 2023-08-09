import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import LeaseDefinitionGroup from "../../components/leaseDefinitionGroup";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import fetchMock from "jest-fetch-mock";

let user;
describe("LeaseDefinitionGroup", () => {
    jest.setTimeout(10000);
    const start_date = "2022-01-01";
    const end_date = "2022-06-30";
    const description = "test description";
    const id = 1;
    const firstYear = start_date ? new Date(start_date).getUTCFullYear() : new Date().getFullYear();
    const secondYear = firstYear + 1;


    beforeAll(() => {
        fetchMock.enableMocks();
        user = userEvent.setup();
    });

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it("updates the start date when changed", async () => {
        const { getByLabelText } = render(
            <LeaseDefinitionGroup
                start_date={start_date}
                end_date={end_date}
                description={description}
                id={id}
            />
        );

        const newStartDate = "2022-02-01";
        fetchMock.mockResponseOnce(undefined, {status: 204});
        await user.type(getByLabelText("Visible From"), newStartDate, {initialSelectionStart: 0, initialSelectionEnd: 10});
        await new Promise(r => setTimeout(r, 1500));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(fetchMock).toHaveBeenCalledWith(`/api/leases/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_date: newStartDate, end_date, description })
        });
    });

    it("updates the end date when changed", async () => {
        const { getByLabelText } = render(
            <LeaseDefinitionGroup
                start_date={start_date}
                end_date={end_date}
                description={description}
                id={id}
            />
        );

        const newEndDate = "2022-07-31";
        await user.type(getByLabelText("Visible Until"), newEndDate, {initialSelectionStart: 0, initialSelectionEnd: 10});
        await new Promise(r => setTimeout(r, 1500));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(fetchMock).toHaveBeenCalledWith(`/api/leases/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_date, end_date: newEndDate, description })
        });
    });

    it("updates the description when changed", async () => {
        const { getByLabelText } = render(
            <LeaseDefinitionGroup
                start_date={start_date}
                end_date={end_date}
                description={description}
                id={id}
            />
        );

        const newDescription = "new description";
        await user.type(getByLabelText("Description"), newDescription, {initialSelectionStart: 0, initialSelectionEnd: description.length});
        await new Promise(r => setTimeout(r, 1500));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(fetchMock).toHaveBeenCalledWith(`/api/leases/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_date, end_date, description: newDescription })
        });
    });

    it("should save data when input fields are changed", async () => {
        render(<LeaseDefinitionGroup start_date="2023-03-28" end_date="2023-03-29" description="test" id={1}/>);
        const startDateInput = screen.getByLabelText("Visible From");
        const endDateInput = screen.getByLabelText("Visible Until");
        const descriptionInput = screen.getByLabelText("Description");
        await user.type(startDateInput, "2023-03-30", {initialSelectionStart: 0, initialSelectionEnd: 10});
        await new Promise(r => setTimeout(r, 1500));
        await user.type(endDateInput, "2023-03-31", {initialSelectionStart: 0, initialSelectionEnd: 10});
        await new Promise(r => setTimeout(r, 1500));
        await user.type(descriptionInput, "new description", {initialSelectionStart: 0, initialSelectionEnd: 10});
        await new Promise(r => setTimeout(r, 1500));
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
        await expect(fetchMock).toHaveBeenCalledWith("/api/leases/1", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                start_date: "2023-03-30",
                end_date: "2023-03-31",
                description: "new description",
            }),
        });
    });

    it("should save data once when input fields are changed in less than sleep time", async () => {
        render(<LeaseDefinitionGroup start_date="2023-03-28" end_date="2023-03-29" description="test" id={1}/>);
        const startDateInput = screen.getByLabelText("Visible From");
        const endDateInput = screen.getByLabelText("Visible Until");
        const descriptionInput = screen.getByLabelText("Description");
        await user.type(startDateInput, "2023-03-30", {initialSelectionStart: 0, initialSelectionEnd: 10});
        await user.type(endDateInput, "2023-03-31", {initialSelectionStart: 0, initialSelectionEnd: 10});
        await user.type(descriptionInput, "new description", {initialSelectionStart: 0, initialSelectionEnd: 5});
        await new Promise(r => setTimeout(r, 1500));
        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        await expect(fetchMock).toHaveBeenCalledWith("/api/leases/1", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                start_date: "2023-03-30",
                end_date: "2023-03-31",
                description: "new description",
            }),
        });
    });

    it("updates the fall_year when checked", async () => {
        const { getByLabelText } = render(
            <LeaseDefinitionGroup
                start_date={start_date}
                end_date={end_date}
                description={description}
                id={id}
            />
        );

        await user.click(getByLabelText(`Fall ${firstYear}`));
        await new Promise(r => setTimeout(r, 1500));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(fetchMock).toHaveBeenCalledWith(`/api/leases/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_date, end_date, description, fall_year: firstYear })
        });
    });

    it("updates the spring_year when checked", async () => {
        const { getByLabelText } = render(
            <LeaseDefinitionGroup
                start_date={start_date}
                end_date={end_date}
                description={description}
                id={id}
            />
        );

        await user.click(getByLabelText(`Spring ${secondYear}`));
        await new Promise(r => setTimeout(r, 1500));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(fetchMock).toHaveBeenCalledWith(`/api/leases/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_date, end_date, description, spring_year: secondYear })
        });
    });

    it("updates the summer_year when checked", async () => {
        const { getByLabelText } = render(
            <LeaseDefinitionGroup
                start_date={start_date}
                end_date={end_date}
                description={description}
                id={id}
            />
        );

        await user.click(getByLabelText(`Summer ${secondYear}`));
        await new Promise(r => setTimeout(r, 1500));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
        expect(fetchMock).toHaveBeenCalledWith(`/api/leases/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_date, end_date, description, summer_year: secondYear })
        });
    });

    it("renders the component with the correct initial values", () => {
        const { getByLabelText } = render(
            <LeaseDefinitionGroup
                start_date={start_date}
                end_date={end_date}
                description={description}
                id={id}
            />
        );

        expect(getByLabelText("Visible From")).toHaveValue(start_date);
        expect(getByLabelText("Visible Until")).toHaveValue(end_date);
        expect(getByLabelText("Description")).toHaveValue(description);
    });
});
