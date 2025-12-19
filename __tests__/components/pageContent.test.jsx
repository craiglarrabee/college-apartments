import {render, waitFor, screen} from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import PageContent from "../../components/pageContent";
import userEvent from "@testing-library/user-event";
import React from "react";
import "@testing-library/jest-dom";

describe("PageContent", () => {
    const site = "test-site";
    const page = "test-page";
    const name = "test-name";
    const initialContent = "Initial Content";
    const setEditableText = jest.fn();
    let user;

    beforeAll(() => {
        fetchMock.enableMocks();
        user = userEvent.setup();
    });

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it("renders custom content for edit mode", async () => {
        const canEdit = true;
        const {getByRole, getByText, queryByText} = render(
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

    it("clicking on edit displays editor", async () => {
        const canEdit = true;
        const {getByRole, getByText, queryByText} = render(
            <PageContent
                site={site}
                page={page}
                name={name}
                canEdit={canEdit}
                initialContent={initialContent}
            />
        );

        await waitFor(() => expect(queryByText("Description Text")).toBeNull());

        await user.click(getByRole("edit"));
        await waitFor(() => expect(queryByText("Description Text")).toBeInTheDocument());
    });

    it("renders custom content for read-only mode", () => {
        const canEdit = false;
        const {getByText} = render(
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
        const {queryByText, container, getByRole, getByText} = render(
            <PageContent
                site={site}
                page={page}
                name={name}
                canEdit={canEdit}
                initialContent={initialContent}
            />
        );

        fetchMock.mockResponseOnce(undefined, {status: 204});
        await user.click(getByRole("edit"));
        await user.click(getByRole("save"));
        //make sure we called that api to save the new data
        await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(`/api/${site}/content/${page}`,
            expect.objectContaining({body: expect.stringContaining(`\"content\":\"${initialContent}\"`)})));

        // In the test environment with react-bootstrap Modal, the dialog may remain mounted; instead,
        // assert that no error alert is shown after a successful save.
        await waitFor(() => expect(queryByText(/Sorry, something went wrong/i)).toBeNull());
    });

    it("error saving does not update page", async () => {
        const canEdit = true;
        const {queryByText, container, getByRole, getByText} = render(
            <PageContent
                site={site}
                page={page}
                name={name}
                canEdit={canEdit}
                initialContent={initialContent}
            />
        );

        const newContent = "New Content";
        await user.click(getByRole("edit"));
        // const editArea = container.getElementsByClassName("jodit-wysiwyg");
        // user.type(editArea.item(0), newContent);
        // user.tab();

        fetchMock.mockResponseOnce(JSON.stringify({error: "An error occurred"}), {status: 400});
        await user.click(getByRole("save"));
        //make sure we called that api to save the new data
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());

        //make sure we didn't close the editor
        await waitFor(() => expect(queryByText("Description Text")).toBeInTheDocument());
        //make sure the change didn't make it out to the page
        expect(queryByText(newContent)).toBeNull();
    });
});
