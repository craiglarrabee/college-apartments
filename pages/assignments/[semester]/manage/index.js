import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import React, {useState} from "react";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {Alert, Button, Form, Modal, Tab, Tabs} from "react-bootstrap";
import Footer from "../../../../components/footer";
import {GetApartments} from "../../../../lib/db/users/apartments";
import {ironOptions} from "../../../../lib/session/options";
import {withIronSessionSsr} from "iron-session/next";
import {GetPreviousLeaseTenants, GetUserLeaseTenants} from "../../../../lib/db/users/tenant";
import {Apartment, Tenant, TenantCard, UnassignedTenants} from "../../../../components/dragAndDrop";
import classNames from "classnames";
import {DndContext, DragOverlay} from "@dnd-kit/core";
import {GetBaseRoomTypes, GetVisibleSemesterLeaseRoomsMap} from "../../../../lib/db/users/roomType";
import RoomTypes from "../../../../components/roomTypes";
import Router from "next/router";
import CurrentLeases from "../../../../components/currentLeases";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Assignments = ({
                         site,
                         page,
                         links,
                         user,
                         apartments,
                         roomTypes,
                         semester,
                         tenants,
                         currentLeaseRoomTypes,
                         leaseIds,
                         ...restOfProps
                     }) => {
    const [activeId, setActiveId] = useState(null);
    const [activeTabKey, setActiveTabKey] = useState(roomTypes[0].id);
    const [showRoomTypes, setShowRoomTypes] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState();
    const [selectedTenantId, setSelectedTenantId] = useState();
    const [selectedApartmentNumber, setSelectedApartmentNumber] = useState();
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

        assignments.unassigned_type = tenants.filter(tenant => tenant.base_type_id === activeTabKey && !tenant.apartment_number);
        assignments.unassigned_others = tenants.filter(tenant => tenant.base_type_id && tenant.base_type_id !== activeTabKey && !tenant.apartment_number);
        assignments.unassigned_previous = tenants.filter(tenant => tenant.user_id != tenant.created_by_user_id && !tenant.apartment_number);

        return assignments;
    };

    const [assignments, setAssignments] = useState(getAssignments(apartments, tenants));

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async ({active, over, ...restOfProps}) => {
        let tenant = tenants.find(tenant => tenant.user_id === active.id);
        let roomTypeId = !over.data?.current?.roomTypeId ||over.data?.current?.roomTypeId == tenant.base_type_id ? tenant.room_type_id : over.data?.current?.roomTypeId;
        if (!tenant.spots && tenant.user_id != tenant.created_by_user_id && over.data?.current?.roomTypeId) {
            setShowRoomTypes(true);
            setSelectedTenantId(active.id);
            setActiveId(null);
            return;
        }
        if (tenant.user_id != tenant.created_by_user_id && !over.data?.current?.roomTypeId) {
            deletePreviousTenantData(tenant.user_id, tenant.lease_id);
        }
        if (!await updateApartmentNumber(tenant, tenant.lease_id, over.id, roomTypeId)) {
            return;
        }
        setActiveId(null);
    };

    const handleDragOver = async ({active, over, ...restOfProps}) => {
        let tenant = tenants.find(tenant => tenant.user_id === active.id);
        if (!over || over.data.current?.spots < tenant.spots) {
            return;
        }
        setTenantAssignment(tenant, over.id);
        setSelectedApartmentNumber(over.id);
    };

    const setTenantAssignment = (tenant, apartment_number) => {
        let newAssignments = {...assignments};
        if (tenant.apartment_number) {
            try {
                newAssignments[tenant.apartment_number] = newAssignments[tenant.apartment_number].filter(assignment => assignment.user_id !== tenant.user_id);
            } catch (e) {
                console.error(e);
            }
        }
        tenant.apartment_number = ["unassigned_type", "unassigned_others", "unassigned_previous"].includes(apartment_number) ? null : apartment_number;
        newAssignments[apartment_number]?.push(tenant);
        setAssignments(newAssignments);
    }

    const deletePreviousTenantData = async (userId, leaseId) => {
        let options = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }
        let tenant = tenants.find(tenant => tenant.user_id === parseInt(userId));
        await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}&roomTypeId=${tenant.room_type_id}`, options);
        delete tenant.spots;
        delete tenant.lease_id;
        delete tenant.room_type;
        setTenantAssignment(tenant, "unassigned_previous");
    };

    const setPreviousTenantData = async (data) => {
        data.site = site;
        data.created_by_user_id = user.id;
        data.submit_date = new Date().toISOString();
        data.processed = true;
        const JSONdata = JSON.stringify(data);
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSONdata,
        }
        let tenant = tenants.find(tenant => tenant.user_id === parseInt(data.user_id));
        setShowRoomTypes(false);
        setSelectedTenantId(null);
        tenant.lease_id = data.lease_id;

        try {
            let resp = await fetch(`/api/users/${data.user_id}/leases/${data.lease_id}/application?site=${site}`, options);
            switch (resp.status) {
                case 400:
                    setError(`An error occurred saving returning tenant data for ${tenant.first_name} ${tenant.last_name}`);
                    deletePreviousTenantData(data.user_id, data.lease_id);
                    break;
                case 204:
                    if (await updateApartmentNumber(tenant, data.lease_id, data.apartment_number, data.room_type_id)) {
                        tenant.spots = data.room_type === "Suite" ? 2 : 1;
                        tenant.room_type = data.room_type;
                    } else {
                        deletePreviousTenantData(data.user_id, data.lease_id);
                    }
                    break;
            }

        } catch (e) {
            setError(`An error occurred saving returning tenant data for ${tenant.first_name} ${tenant.last_name}`);
            deletePreviousTenantData(data.user_id, data.lease_id);
        }
        setSelectedApartmentNumber(null);
    };

    const updateApartmentNumber = async (tenant, leaseId, id, roomTypeId) => {
        //now update the apartment number
        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({apartmentNumber: id, roomTypeId: roomTypeId}),
            }
            const resp = await fetch(`/api/users/${tenant.user_id}/leases/${leaseId}/tenant?site=${site}`, options);
            switch (resp.status) {
                case 204:
                    return true;
                case 400:
                default:
                    setError(`An error occurred setting apartment assignment for ${tenant.first_name} ${tenant.last_name}`);
                    return false;
            }
        } catch (e) {
            setError(`An error occurred setting apartment assignment for ${tenant.first_name} ${tenant.last_name}`);
            console.error(e);
            return false;
        }
    };

    const resetAssignments = async () => {
        let resps;
        try {
            const options = {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
            }
            resps = await Promise.all(leaseIds.map(async (leaseId) => await fetch(`/api/assignments/${leaseId}?site=${site}`, options)));
            for (const resp of resps) {
                switch (resp.status) {
                    case 204:
                        break;
                    case 400:
                    default:
                        setError("An error occurred resetting all assignments");
                        return false;
                }
            }
            Router.reload();
        } catch (e) {
            setError("An error occurred resetting all assignments");
            console.error(e);
            return false;
        }
    };

    return (
        <Layout site={site} user={user} wide={true}>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    {error && <Alert variant={"danger"} dismissible onClose={() => setError(null)}>{error}</Alert>}
                    <Button style={{width: "200px"}} onClick={()=>setShowConfirm(true)}>Reset Assignments</Button>
                    <br/>
                    <Tabs activeKey={activeTabKey} onSelect={(e) => setActiveTabKey(parseInt(e))}>
                        {roomTypes.map(type =>
                            <Tab eventKey={type.id} key={type.id} title={type.label}>
                                <div>{type.room_desc} (${type.room_rent})</div>
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
                                                               roomType={apartment.room_type}
                                                               id={apartment.apartment_number}
                                                               apartmentNumber={apartment.apartment_number}
                                                               tenants={tenants}
                                                               data={{
                                                                   roomTypeId: apartment.room_type_id,
                                                                   spots: (apartment.room_type === "Shared" ? 2 : 1) * apartment.rooms - assignments[apartment.apartment_number].reduce((partialSum, a) => partialSum + a.spots, 0)
                                                               }}>
                                                        {assignments[apartment.apartment_number].map(tenant =>
                                                            <Tenant key={tenant.user_id} userId={tenant.user_id}>
                                                                <TenantCard visible={activeId !== tenant.user_id}
                                                                            tenant={tenant}
                                                                            backgroundColor={type.id === tenant.base_type_id && tenant.created_by_user_id == tenant.user_id ? roomTypeColor : (tenant.user_id != tenant.created_by_user_id ? previousColor : otherTypeColor)}/>
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
                                            <UnassignedTenants apartmentNumber="unassigned"
                                                               roomType="type"
                                                               additionalStyle={{backgroundColor: roomTypeColor}}
                                                               title="Tenants applied with matching room type">
                                                {tenants
                                                    .filter(tenant => tenant.created_by_user_id == tenant.user_id && tenant.base_type_id === type.id && !tenant.apartment_number)
                                                    .map(tenant =>
                                                        <Tenant key={tenant.user_id} userId={tenant.user_id}
                                                                data="current">
                                                            <TenantCard visible={activeId !== tenant.user_id}
                                                                        tenant={tenant}
                                                                        backgroundColor={roomTypeColor}/>
                                                        </Tenant>
                                                    )}
                                            </UnassignedTenants>
                                            <UnassignedTenants apartmentNumber="unassigned"
                                                               roomType="others"
                                                               additionalStyle={{backgroundColor: otherTypeColor}}
                                                               title="Tenants applied with other room type">
                                                {tenants
                                                    .filter(tenant => tenant.created_by_user_id == tenant.user_id && tenant.base_type_id && tenant.base_type_id !== type.id && !tenant.apartment_number)
                                                    .map(tenant =>
                                                        <Tenant key={tenant.user_id} userId={tenant.user_id}
                                                                data="current">
                                                            <TenantCard visible={activeId !== tenant.user_id}
                                                                        tenant={tenant}
                                                                        backgroundColor={otherTypeColor}/>
                                                        </Tenant>
                                                    )}
                                            </UnassignedTenants>
                                            <UnassignedTenants apartmentNumber="unassigned"
                                                               roomType="previous"
                                                               additionalStyle={{backgroundColor: previousColor}}
                                                               title="Previous tenants">
                                                {tenants
                                                    .filter(tenant => tenant.user_id != tenant.created_by_user_id && !tenant.apartment_number)
                                                    .map(tenant =>
                                                        <Tenant key={tenant.user_id} userId={tenant.user_id}
                                                                data="previous">
                                                            <TenantCard visible={activeId !== tenant.user_id}
                                                                        tenant={tenant}
                                                                        backgroundColor={previousColor}/>
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
                    {showRoomTypes &&
                        <RoomTypes
                            selectedRoomType={activeTabKey}
                            site={site}
                            roomTypes={currentLeaseRoomTypes}
                            show={showRoomTypes} close={() => setShowRoomTypes(false)}
                            setTenantRoomType={setPreviousTenantData}
                            userId={selectedTenantId}
                            apartment_number={selectedApartmentNumber}
                        />
                    }
                        <Modal show={showConfirm}
                               onHide={()=>setShowConfirm(false)}
                               size="sm"
                               aria-labelledby="contained-modal-title-vcenter"
                               centered
                        >
                            <Modal.Header closeButton>
                                <Modal.Title>Confirm</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <div>Are you sure you want to reset all assignments?</div>
                                <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                                    <Button style={{marginRight: "20px"}} variant="primary" type="button" onClick={resetAssignments}>Yes</Button>
                                    <Button style={{marginLeft: "20px"}} variant="primary" type="button" onClick={()=>setShowConfirm(false)}>No</Button>
                                </div>
                            </Modal.Body>
                        </Modal>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    await context.req.session.save();
	const user = context.req.session.user;
    const page = context.resolvedUrl.substring(0, context.resolvedUrl.indexOf("?")).replace(/\//, "");
    const site = context.query.site || SITE;
    if (site === "suu") {
        //suu manages assignments by location rather than by room type - redirect to assignments/{sem}/manage/location
        context.res.writeHead(302, {Location: `/${page}/location?site=${site}`});
        context.res.end();
        return {};
    }
    if (!user?.manage?.includes(site) || !user.manageApartment) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    const semester = context.query.semester.replace("_", " ");

    let [nav, roomTypes, apartments, tenants, previousTenants, currentLeaseRooms] = await Promise.all([
        GetNavLinks(user, site),
        GetBaseRoomTypes(site, semester),
        GetApartments(site),
        GetUserLeaseTenants(site, semester),
        GetPreviousLeaseTenants(site, semester),
        GetVisibleSemesterLeaseRoomsMap(site, semester)
    ]);
    //filter tenants without deposit for snow
    //snow uses this page, suu uses /assignments/{semester}/manage/location
    tenants = tenants.filter(tenant => tenant.deposit_date !== null)
    tenants = [...tenants, ...previousTenants];
    let leaseIds = [...new Set(tenants.map(t => t.lease_id))];
    return {
        props: {
            site: site,
            page: page,
            links: nav,
            apartments: [...apartments],
            roomTypes: [...roomTypes],
            tenants: [...tenants],
            user: {...user},
            semester: semester,
            currentLeaseRoomTypes: currentLeaseRooms,
            leaseIds: leaseIds
        }
    };
}, ironOptions);

export default Assignments;
