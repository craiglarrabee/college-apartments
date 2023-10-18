import React from "react";
import { render, screen } from "@testing-library/react";
import { Apartment, UnassignedTenants, Tenant, TenantCard } from "../../components/dragAndDrop";
import "@testing-library/jest-dom";

describe("Apartment", () => {
    const mockId = "101";
    const mockData = { spots: 2 };
    const mockTenants = [
        { user_id: 1, spots: 1 },
        { user_id: 2, spots: 1 },
    ];

    test("renders Apartment component", () => {
        render(
            <Apartment id={mockId} data={mockData} tenants={mockTenants}>
                <div>Apartment Content</div>
            </Apartment>
        );

        // Assert that the component renders without throwing an error
        expect(screen.getByText("101")).toBeInTheDocument();
        expect(screen.getByText("2 spots left")).toBeInTheDocument();
        expect(screen.getByText("Apartment Content")).toBeInTheDocument();
    });

    // Add more unit tests for other functionality as needed
});

describe("UnassignedTenants", () => {
    const mockDroppableId = "unassigned-tenants";
    const mockAdditionalStyle = { color: "red" };
    const mockTitle = "Unassigned Tenants";

    test("renders UnassignedTenants component", () => {
        render(
            <UnassignedTenants
                droppableId={mockDroppableId}
                additionalStyle={mockAdditionalStyle}
                title={mockTitle}
            >
                <div>Tenant 1</div>
                <div>Tenant 2</div>
            </UnassignedTenants>
        );

        // Assert that the component renders without throwing an error
        expect(screen.getByText("Unassigned Tenants")).toBeInTheDocument();
        expect(screen.getByText("Tenant 1")).toBeInTheDocument();
        expect(screen.getByText("Tenant 2")).toBeInTheDocument();
    });

    // Add more unit tests for other functionality as needed
});

describe("Tenant", () => {
    const mockUserId = 1;
    const mockData = { name: "John Doe" };

    test("renders Tenant component", () => {
        render(
            <Tenant userId={mockUserId} data={mockData}>
                <div>Tenant Content</div>
            </Tenant>
        );

        // Assert that the component renders without throwing an error
        expect(screen.getByText("Tenant Content")).toBeInTheDocument();
    });

    // Add more unit tests for other functionality as needed
});

describe("TenantCard", () => {
    const mockTenant = {
        spots: 2,
        room_type: "Single",
        first_name: "John",
        last_name: "Doe",
        date_of_birth: "1990-01-01",
        gender: "M",
        school_year: "Senior",
        submit_date: "2022-01-01",
        roomate: "Jane Smith",
        roomate_desc: "Roommate Description",
    };
    const mockVisible = true;
    const mockBackgroundColor = "lightblue";

    test("renders TenantCard component", () => {
        render(
            <TenantCard
                tenant={mockTenant}
                visible={mockVisible}
                backgroundColor={mockBackgroundColor}
            >
                <div>Tenant Card Content</div>
            </TenantCard>
        );

        // Assert that the component renders without throwing an error
        expect(screen.getByText("Tenant Card Content")).toBeInTheDocument();
    });

    // Add more unit tests for other functionality as needed
});