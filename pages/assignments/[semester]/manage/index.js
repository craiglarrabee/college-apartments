import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import React, {useState} from "react";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {Tab, Tabs} from "react-bootstrap";
import Footer from "../../../../components/footer";
import {GetApartments} from "../../../../lib/db/users/apartments";
import {ironOptions} from "../../../../lib/session/options";
import {withIronSessionSsr} from "iron-session/next";
import {GetPreviousLeaseTenants, GetUserLeaseTenants} from "../../../../lib/db/users/tenant";
import {Apartment, Tenant, TenantCard, UnassignedTenants} from "../../../../components/dragAndDrop";
import classNames from "classnames";
import {DndContext, DragOverlay} from "@dnd-kit/core";
import {GetRoomTypes} from "../../../../lib/db/users/roomType";

const SITE = process.env.SITE;

const Assignments = ({site, page, links, user, apartments, roomTypes, tenants}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const [activeId, setActiveId] = useState(null);
    const [roomType, setRoomType] = useState();
    const roomTypeColor = "#134F5C50";
    const otherTypeColor = "#00F0F050";
    const previousColor = "#25852550"


    const getAssignments = (apartments, tenants) => {
        const assignments = apartments.reduce((obj, item) => {
            return {
                ...obj,
                [item.apartment_number]: tenants.filter(tenant => tenant.apartment_number === item.apartment_number)
            }
        }, {});

        assignments.unassigned_type = tenants.filter(tenant => tenant.base_type_id === roomType && !tenant.apartment_number);
        assignments.unassigned_others = tenants.filter(tenant => tenant.base_type_id && tenant.base_type_id !== roomType && !tenant.apartment_number);
        assignments.unassigned_previous = tenants.filter(tenant => !tenant.base_type_id && !tenant.apartment_number);

        return assignments;
    };

    const [assignments, setAssignments] = useState(getAssignments(apartments, tenants));

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    }
    const handleDragEnd = async ({active, over}) => {
        let tenant = tenants.filter(tenant => tenant.user_id === active.id)[0];
        if (!await updateApartmentNumber(tenant, over.id, over.data?.current?.roomTypeId || tenant.room_type_id)) {
            return;
        }
        setActiveId(null);
    };

    const handleDragOver = async ({active, over}) => {
        let tenant = tenants.filter(tenant => tenant.user_id === active.id)[0];
        if (!over || over.data.current?.spots < tenant.spots) {
            return;
        }
        let newAssignments = {...assignments};
        if (tenant.apartment_number) {
            newAssignments[tenant.apartment_number] = newAssignments[tenant.apartment_number].filter(assignment => assignment.user_id !== active.id);
        }
        tenant.apartment_number = !over || ["unassigned_type", "unassigned_others", "unassigned_previous"].includes(over.id) ? null : over.id;
        newAssignments[over.id].push(tenant);
        setAssignments(newAssignments);
    };

    const updateApartmentNumber = async (tenant, id, roomTypeId) => {
        //now update the apartment number
        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({apartmentNumber: id, roomTypeId: roomTypeId}),
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

    return (
        <Layout user={user} wide={true}>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <Tabs>
                    {roomTypes.map(type =>
                        <Tab eventKey={type.id} key={type.id} title={`${type.location} ${type.room_type}`}
                             onClick={() => setRoomType(type.id)}>
                            <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}
                                        onDragOver={handleDragOver}>
                                <div style={{width: "100%"}} className={classNames("d-flex")}>
                                    <div style={{
                                        margin: "5px",
                                        width: "49%",
                                        border: "1px solid grey",
                                        borderRadius: "5px",
                                        height: "750px",
                                        overflowY: "auto",
                                        overflowX: "hidden"
                                    }}
                                         className={classNames("d-flex", "flex-row", "flex-wrap")}>
                                        {apartments
                                            .filter(apartment => apartment.room_type_id === type.id)
                                            .map(apartment =>
                                                <Apartment key={apartment.apartment_number}
                                                           id={apartment.apartment_number}
                                                           tenants={tenants}
                                                           data={{
                                                               roomTypeId: apartment.room_type_id,
                                                               spots: (apartment.room_type === "Shared" ? 2 : 1) * apartment.rooms - assignments[apartment.apartment_number].reduce((partialSum, a) => partialSum + a.spots, 0)
                                                           }}>
                                                    {assignments[apartment.apartment_number].map(tenant =>
                                                        <Tenant key={tenant.user_id} id={tenant.user_id} >
                                                            <TenantCard visible={activeId !== tenant.user_id}
                                                                        tenant={tenant}
                                                                        backgroundColor={type.id === tenant.base_type_id ? roomTypeColor : (!tenant.base_type_id ? previousColor : otherTypeColor)}/>
                                                        </Tenant>)}
                                                </Apartment>
                                            )}
                                    </div>
                                    <div style={{
                                        width: "49%",
                                        margin: "5px",
                                        border: "1px solid grey",
                                        borderRadius: "5px",
                                        height: "750px",
                                        overflowY: "auto",
                                        overflowX: "hidden",
                                        display: "flex",
                                        flexDirection: "column"
                                    }}>
                                        <UnassignedTenants key="unassigned_type" droppableId="unassigned_type"
                                                           additionalStyle={{backgroundColor: roomTypeColor}}
                                                           title="Tenants applied with matching room type">
                                            {tenants
                                                .filter(tenant => tenant.base_type_id === type.id && !tenant.apartment_number)
                                                .map(tenant =>
                                                    <Tenant key={tenant.user_id} id={tenant.user_id} data="current" >
                                                        <TenantCard visible={activeId !== tenant.user_id}
                                                                    tenant={tenant} backgroundColor={roomTypeColor}/>
                                                    </Tenant>
                                                )}
                                        </UnassignedTenants>
                                        <UnassignedTenants key="unassigned_others" droppableId="unassigned_others"
                                                           additionalStyle={{backgroundColor: otherTypeColor}}
                                                           title="Tenants applied with other room type">
                                            {tenants
                                                .filter(tenant => tenant.base_type_id && tenant.base_type_id !== type.id && !tenant.apartment_number)
                                                .map(tenant =>
                                                    <Tenant key={tenant.user_id} id={tenant.user_id} data="current" >
                                                        <TenantCard visible={activeId !== tenant.user_id}
                                                                    tenant={tenant} backgroundColor={otherTypeColor}/>
                                                    </Tenant>
                                                )}
                                        </UnassignedTenants>
                                        <UnassignedTenants key="unassigned_previous" droppableId="unassigned_previous"
                                                           additionalStyle={{backgroundColor: previousColor}}
                                                           title="Previous tenants with no current application">
                                            {tenants
                                                .filter(tenant => !tenant.base_type_id && !tenant.apartment_number)
                                                .map(tenant =>
                                                    <Tenant key={tenant.user_id} id={tenant.user_id} data="previous" >
                                                        <TenantCard visible={activeId !== tenant.user_id}
                                                                    tenant={tenant} backgroundColor={previousColor}/>
                                                    </Tenant>
                                                )}
                                        </UnassignedTenants>
                                    </div>
                                    <DragOverlay>
                                        {activeId ? tenants
                                                .filter(tenant => tenant.user_id === activeId)
                                                .map(tenant => <TenantCard visible={true} tenant={tenant}
                                                                           backgroundColor={type.id === tenant.base_type_id ? roomTypeColor : (!tenant.base_type_id ? previousColor : otherTypeColor)}/>)
                                            : null}
                                    </DragOverlay>
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
    if (!user.admin.includes(site) && !user.manageApartment) {
        return {notFound: true};
    }

    let [nav, roomTypes, apartments, tenants, previousTenants] = await Promise.all([
        GetNavLinks(user, site),
        GetRoomTypes(site),
        GetApartments(site),
        GetUserLeaseTenants(site, context.query.semester.replace("_", " ")),
        GetPreviousLeaseTenants(site, context.query.semester.replace("_", " "))
    ]);
    tenants = [...tenants, ...previousTenants];
    return {
        props: {
            site: site,
            page: page,
            links: nav,
            apartments: [...apartments],
            roomTypes: [...roomTypes],
            tenants: [...tenants],
            user: {...user}
        }
    };
}, ironOptions);

export default Assignments;
