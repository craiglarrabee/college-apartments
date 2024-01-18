import React from "react";
import {render, screen} from "@testing-library/react";
import {WelcomeEmailBody} from "../../components/welcomeEmailBody";
import "@testing-library/jest-dom";

describe("WelcomeEmailBody", () => {
    const mockCompany = "Mock Company";
    const mockTenant = {name: "John Doe"};
    const mockHeader = "Welcome to our community!";
    const mockSite = "mockSite";
    const mockPage = "mockPage";
    const mockCanEdit = true;
    const mockBody = "Welcome to our apartment community. We are excited to have you as a tenant!";
    const mockLeaseId = "mockLeaseId";
    const mockSemester = "mockSemester";

    test("renders WelcomeEmailBody component", () => {
        render(
            <WelcomeEmailBody
                company={mockCompany}
                tenant={mockTenant}
                header={mockHeader}
                site={mockSite}
                page={mockPage}
                canEdit={mockCanEdit}
                body={mockBody}
                leaseId={mockLeaseId}
                semester={mockSemester}
            />
        );

        // Assert that the component renders without throwing an error
        expect(screen.getByText(`${mockCompany}     ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })}`)).toBeInTheDocument();
        expect(screen.getByText(mockHeader)).toBeInTheDocument();
        expect(screen.getByText(`Dear ${mockTenant.name}:`)).toBeInTheDocument();
        expect(screen.getByText(mockBody)).toBeInTheDocument();
        expect(screen.getByText("Follow this link to electronically complete and submit your Lease")).toBeInTheDocument();
        expect(screen.getByText("Follow this link to view your room assignment and roommates")).toBeInTheDocument();
    });

    // Add more unit tests for other functionality as needed
});