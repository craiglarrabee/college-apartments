import {render, waitFor, within} from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import PageContent from "./PageContent";
import userEvent from "@testing-library/user-event";
import React from "react";
import "@testing-library/jest-dom";

describe("PageContent", () => {
    const site = "test-site";
    const page = "test-page";
    const name = "test-name";
    const initialContent = "Initial Content";
    const setEditableText = jest.fn();

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it("renders custom content for edit mode", async () => {
        const canEdit = true;
        const { getByRole, getByText, queryByText } = render(
            <PageContent
                site={site}
                page={page}
                name={name}
                canEdit={canEdit}
                initialContent={initialContent}
            />
        );

        expect(getByText(initialContent)).toBeInTheDocument();

        userEvent.click(getByRole("edit"));
        await waitFor(() => expect(queryByText("Description Text")).toBeInTheDocument());
    });

    it("renders custom content for read-only mode", () => {
        const canEdit = false;
        const { getByText } = render(
            <PageContent
                site={site}
                page={page}
                name={name}
                canEdit={canEdit}
                initialContent={initialContent}
            />
        );

        expect(getByText(initialContent)).toBeInTheDocument();
    });

    it("saves content on click of Save changes button", async () => {
        const canEdit = true;
        const { getByRole } = render(
            <PageContent
                site={site}
                page={page}
                name={name}
                canEdit={canEdit}
                initialContent={initialContent}
            />
        );

        const newContent = "New Content";
        userEvent.click(getByRole("edit"));

        const { getByText } = within(document.getElementById("modal-id"));
        userEvent.type(getByText("Start typing..."), newContent);

        fetchMock.mockResponseOnce(JSON.stringify({}));
        userEvent.click(getByRole("save"));

        await waitFor(() => expect(fetchMock).toHaveBeenCalled());

        expect(setEditableText).toHaveBeenCalledWith(newContent);
        expect(getByText(newContent)).toBeInTheDocument();
    });
});
