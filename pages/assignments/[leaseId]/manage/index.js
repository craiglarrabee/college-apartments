import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import React, {useState} from "react";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {Button, Tab, Tabs} from "react-bootstrap";
import Footer from "../../../../components/footer";
import {GetApartments} from "../../../../lib/db/users/apartments";
import {ironOptions} from "../../../../lib/session/options";
import {withIronSessionSsr} from "iron-session/next";
import {GetUserLeaseTenants} from "../../../../lib/db/users/tenant";
import {Apartment, Tenant, TenantCard, UnassignedTenants} from "../../../../components/dragAndDrop";
import classNames from "classnames";
import {DndContext} from "@dnd-kit/core";
import {GetRoomTypes} from "../../../../lib/db/users/roomType";
import Router from "next/router";

const SITE = process.env.SITE;

const Assignments = ({site, page, links, user, apartments, roomTypes, tenants, leaseId}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";


    const getAssignments = (apartments, tenants) => {
        const assignments = apartments.reduce((obj, item) => {
            return {
                ...obj,
                [item.apartment_number]: tenants.filter(tenant => tenant.apartment_number === item.apartment_number)
            }
        }, {});

        assignments.unassigned = tenants.filter(tenant => tenant.apartment_number === null);

        return assignments;
    };

    const [assignments, setAssignments] = useState(getAssignments(apartments, tenants));

    const handleDragEnd = async ({active, over}) => {
        let tenant = tenants.filter(tenant => tenant.user_id === active.id)[0];
        if (!over || over.data.current?.spots < tenant.spots) {
            return;
        }
        if (!await updateApartmentNumber(tenant, over.id)) {
            return;
        }
        let newAssignments = {...assignments};
        if (tenant.apartment_number) newAssignments[tenant.apartment_number] = newAssignments[tenant.apartment_number].filter(assignment => assignment.user_id !== active.id);
        tenant.apartment_number = over.id === "unassigned" ? null : over.id;
        newAssignments[over.id].push(tenant);
        setAssignments(newAssignments);
    };

    const updateApartmentNumber = async (tenant, apartmentNumber) => {

        //now update the apartment number
        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({apartmentNumber: apartmentNumber}),
            }

            const resp = await fetch(`/api/users/${tenant.user_id}/leases/${tenant.lease_id}/tenant`, options);
            switch (resp.status) {
                case 400:
                    return false;
                case 204:
                    return true;
            }
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    const resetAssignments = async () => {
        try {
            const options = {
                method: "DELETE",
                headers: {"Content-Type": "application/json"}
            }

            const resp = await fetch(`/api/assignments/${leaseId}`, options);
            switch (resp.status) {
                case 400:
                    return;
                case 204:
                    Router.reload();
                    return;
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <Layout user={user}>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <Tabs>
                    {roomTypes.map(type =>
                        <Tab eventKey={type.id} title={`${type.location} ${type.room_type}`}>
                            <div style={{display: "inline", width: "100%"}}>
                                <div style={{marginRight: "5px", float: "right"}}><Button onClick={resetAssignments}>Reset Assignments</Button></div>
                                <div>{type.room_desc}</div>
                            </div>
                            <DndContext onDragEnd={handleDragEnd}>
                                <div style={{width: "100%"}} className={classNames("d-flex")}>
                                    <div style={{
                                        margin: "5px",
                                        width: "60%",
                                        border: "1px solid grey",
                                        borderRadius: "15px"
                                    }}
                                         className={classNames("d-flex", "flex-row", "flex-wrap")}>
                                        {apartments
                                            .filter(apartment => apartment.room_type_id === type.id)
                                            .map(apartment =>
                                                <Apartment id={apartment.apartment_number}
                                                           data={{spots: (apartment.room_type === "Shared" ? 2 : 1) * apartment.rooms - assignments[apartment.apartment_number].reduce((partialSum, a) => partialSum + a.spots, 0)}}>
                                                    {assignments[apartment.apartment_number].map(tenant =>
                                                        <Tenant id={tenant.user_id} data={apartment.apartment_number}>
                                                            {`${tenant.spots === 2 ? "*" : ""} ${tenant.first_name} ${tenant.last_name}`}
                                                        </Tenant>)}
                                                </Apartment>
                                            )}
                                    </div>
                                    <UnassignedTenants>
                                        {tenants
                                            .filter(tenant => tenant.base_type_id === type.id && !tenant.apartment_number)
                                            .map(tenant =>
                                                <Tenant id={tenant.user_id}>
                                                    <TenantCard tenant={tenant}/>
                                                </Tenant>
                                            )}
                                    </UnassignedTenants>
                                </div>
                            </DndContext>
                        </Tab>
                    )}
                </Tabs>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    const page = context.resolvedUrl.substring(0, context.resolvedUrl.indexOf("?")).replace(/\//, "");
    const site = context.query.site || SITE;
    const leaseId = context.query.leaseId;
    if (user.admin !== site && !user.manageApartment) {
        return {notFound: true};
    }

    const [nav, roomTypes, apartments, tenants] = await Promise.all([
        GetNavLinks(user, site),
        GetRoomTypes(site),
        GetApartments(site),
        GetUserLeaseTenants(context.query.leaseId)
    ]);

    return {
        props: {
            site: site,
            page: page,
            links: nav,
            apartments: [...apartments],
            roomTypes: [...roomTypes],
            tenants: [...tenants],
            user: {...user},
            leaseId: leaseId
        }
    };
}, ironOptions);

export default Assignments;
