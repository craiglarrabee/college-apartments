import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import LeaseDefinitionGroup from './LeaseDefinitionGroup';
import "@testing-library/jest-dom";

describe('LeaseDefinitionGroup', () => {
    jest.setTimeout(6000);
    const start_date = '2022-01-01';
    const end_date = '2022-06-30';
    const description = 'test description';
    const id = 1;

    beforeEach(() => {
        global.fetch = jest.fn(() =>
            Promise.resolve()
        )
    });

    it('renders the component with the correct initial values', () => {
        const { getByLabelText } = render(
            <LeaseDefinitionGroup
                start_date={start_date}
                end_date={end_date}
                description={description}
                id={id}
            />
        );

        expect(getByLabelText('Lease Valid From')).toHaveValue(start_date);
        expect(getByLabelText('Lease Valid Until')).toHaveValue(end_date);
        expect(getByLabelText('Lease Description')).toHaveValue(description);
    });

    it('updates the start date when changed', async () => {
        const { getByLabelText } = render(
            <LeaseDefinitionGroup
                start_date={start_date}
                end_date={end_date}
                description={description}
                id={id}
            />
        );

        const newStartDate = '2022-02-01';
        fireEvent.change(getByLabelText('Lease Valid From'), { target: { value: newStartDate } });
        await new Promise(r => setTimeout(r, 1500));

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        expect(fetch).toHaveBeenCalledWith(`/api/leases/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start_date: newStartDate, end_date, description })
        });
    });

    it('updates the end date when changed', async () => {
        const { getByLabelText } = render(
            <LeaseDefinitionGroup
                start_date={start_date}
                end_date={end_date}
                description={description}
                id={id}
            />
        );

        const newEndDate = '2022-07-31';
        fireEvent.change(getByLabelText('Lease Valid Until'), { target: { value: newEndDate } });
        await new Promise(r => setTimeout(r, 1500));

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        expect(fetch).toHaveBeenCalledWith(`/api/leases/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start_date, end_date: newEndDate, description })
        });
    });

    it('updates the description when changed', async () => {
        const { getByLabelText } = render(
            <LeaseDefinitionGroup
                start_date={start_date}
                end_date={end_date}
                description={description}
                id={id}
            />
        );

        const newDescription = 'new description';
        fireEvent.change(getByLabelText('Lease Description'), { target: { value: newDescription } });
        await new Promise(r => setTimeout(r, 1500));

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        expect(fetch).toHaveBeenCalledWith(`/api/leases/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start_date, end_date, description: newDescription })
        });
    });

    it('should save data when input fields are changed', async () => {
        render(<LeaseDefinitionGroup start_date="2023-03-28" end_date="2023-03-29" description="test" id={1}/>);
        const startDateInput = screen.getByLabelText('Lease Valid From');
        const endDateInput = screen.getByLabelText('Lease Valid Until');
        const descriptionInput = screen.getByLabelText('Lease Description');
        fireEvent.change(startDateInput, { target: { value: '2023-03-30'}});
        await new Promise(r => setTimeout(r, 1500));
        fireEvent.change(endDateInput, { target: { value: '2023-03-31'}});
        await new Promise(r => setTimeout(r, 1500));
        fireEvent.change(descriptionInput, { target: { value: 'new description'}});
        await new Promise(r => setTimeout(r, 1500));
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
        await expect(fetch).toHaveBeenCalledWith('/api/leases/1', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                start_date: '2023-03-30',
                end_date: '2023-03-31',
                description: 'new description',
            }),
        });
    });

    it('should save data once when input fields are changed in less than sleep time', async () => {
        render(<LeaseDefinitionGroup start_date="2023-03-28" end_date="2023-03-29" description="test" id={1}/>);
        const startDateInput = screen.getByLabelText('Lease Valid From');
        const endDateInput = screen.getByLabelText('Lease Valid Until');
        const descriptionInput = screen.getByLabelText('Lease Description');
        await Promise.all([fireEvent.change(startDateInput, { target: { value: '2023-03-30'}}), fireEvent.change(endDateInput, { target: { value: '2023-03-31'}}), fireEvent.change(descriptionInput, { target: { value: 'new description'}})]);
        await new Promise(r => setTimeout(r, 1500));
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        await expect(fetch).toHaveBeenCalledWith('/api/leases/1', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                start_date: '2023-03-30',
                end_date: '2023-03-31',
                description: 'new description',
            }),
        });
    });
});
