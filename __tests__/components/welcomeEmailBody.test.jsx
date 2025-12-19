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

        // Assert header line renders company and a formatted date without pinning an exact day
        const headerLines = screen.getAllByText((content, node) => /Mock Company\s+\w+\s+\d{1,2},\s+\d{4}/.test(node.textContent));
        expect(headerLines.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText(mockHeader)).toBeInTheDocument();
        expect(screen.getByText(`Dear ${mockTenant.name}:`)).toBeInTheDocument();
        expect(screen.getByText(mockBody)).toBeInTheDocument();
        // Sentence is split by an <a>; check parts and the link separately
        expect(screen.getByText(/Follow this link to electronically complete and submit your/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Lease/i })).toBeInTheDocument();
        // Match current UI text spelling ("roomates"); the link provides the accessible name
        expect(screen.getByText(/Follow this link to view your/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /room assignment and roomates/i })).toBeInTheDocument();
    });

    // Add more unit tests for other functionality as needed
});