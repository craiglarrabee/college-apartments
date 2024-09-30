import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import React, {useState} from "react";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {Alert, Button, Modal, Tab, Tabs} from "react-bootstrap";
import Footer from "../../../../components/footer";
import {GetApartments} from "../../../../lib/db/users/apartments";
import {ironOptions} from "../../../../lib/session/options";
import {withIronSessionSsr} from "iron-session/next";
import {GetPreviousLeaseTenants, GetUserLeaseTenants} from "../../../../lib/db/users/tenant";
import {Apartment, Tenant, TenantCard, UnassignedTenants} from "../../../../components/dragAndDrop";
import classNames from "classnames";
import {DndContext, DragOverlay} from "@dnd-kit/core";
import {GetLocations, GetVisibleSemesterLeaseRoomsMap} from "../../../../lib/db/users/roomType";
import RoomTypes from "../../../../components/roomTypes";
import Router from "next/router";

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
                         locations,
                         tenants,
                         currentLeaseRoomTypes,
                         leaseIds,
                         ...restOfProps
                     }) => {
    const [activeId, setActiveId] = useState(null);
    const [activeTabKey, setActiveTabKey] = useState(locations[0].location);
    const [showRoomTypes, setShowRoomTypes] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState();
    const [selectedTenantId, setSelectedTenantId] = useState();
    const [selectedApartmentNumber, setSelectedApartmentNumber] = useState();
    const [selectedRoomType, setSelectedRoomType] = useState();
    const roomTypeColor = "#134F5C50";
    const otherTypeColor = "#00F0F050";
    const previousColor = "#25852550"


    const getAssignments = (apartments, tenants) => {
        const assignments = apartments.reduce((obj, item) => {
            return {
                ...obj,
                [`${item.apartment_number}_${item.room_type}`]: tenants.filter(tenant => tenant.apartment_number === item.apartment_number /*&& tenant.base_room_type === item.room_type*/)
            }
        }, {});

        assignments.unassigned_type = tenants.filter(tenant => tenant.location === activeTabKey && !tenant.apartment_number);
        assignments.unassigned_others = tenants.filter(tenant => tenant.location && tenant.location !== activeTabKey && !tenant.apartment_number);
        assignments.unassigned_previous = tenants.filter(tenant => !tenant.current_tenant &&  !tenant.apartment_number);

        return assignments;
    };

    const [assignments, setAssignments] = useState(getAssignments(apartments, tenants));

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async ({active, over}) => {
        if (!over) {
            return;
        }
        let tenant = tenants.find(tenant => tenant.user_id === active.id);
        if (!tenant.spots && !tenant.current_tenant && over?.data?.current?.roomTypeId) {
            setShowRoomTypes(true);
            setSelectedTenantId(active.id);
            setActiveId(null);
            return;
        }
        if (!tenant.current_tenant && !over.data?.current?.roomTypeId) {
            deletePreviousTenantData(tenant.user_id, tenant.lease_id);
        }
        if (!await updateApartmentNumber(tenant, tenant.lease_id, over?.data?.current?.apartmentNumber, tenant.room_type_id)) {
            return;
        }
        setActiveId(null);
    };

    const handleDragOver = async ({active, over}) => {
        let tenant = tenants.find(tenant => tenant.user_id === active.id);

        if (!over ||
            !over.data.current ||
            over?.data?.current?.spots < tenant.spots ||
            (/*tenant.location === over.data.current.location &&*/
                ((tenant.base_room_type === "Private" && over.data.current?.roomType === "Shared") ||
                    (tenant.base_room_type === "Shared" && over.data.current?.roomType === "Private")))
        ) {
            return;
        }

        setTenantAssignment(tenant, over.data.current.apartmentNumber, over.data.current.roomType);
        setSelectedApartmentNumber(over.data.current.apartmentNumber);
        setSelectedRoomType(tenant.room_type_id || over.data.current.room_type);
    };

    const setTenantAssignment = (tenant, apartment_number, room_type) => {
        let newAssignments = {...assignments};
        if (tenant.apartment_number) {
            newAssignments[`${tenant.apartment_number}_${tenant.base_room_type ? tenant.base_room_type : room_type}`] = newAssignments[`${tenant.apartment_number}_${tenant.base_room_type ? tenant.base_room_type : room_type}`]?.filter(assignment => assignment.user_id !== tenant.user_id);
        }
        tenant.apartment_number = apartment_number === "unassigned" ? null : apartment_number;
        newAssignments[`${apartment_number}_${room_type}`].push(tenant);
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
        await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}&roomTypeId=${room_type_id}`, options);
        console.log(new Date().toISOString() + " - " +`Application and lease were deleted for user: ${userId} and lease: ${leaseId} in assignments[location].deletePreviousTenantData.`);
        console.log(new Date().toISOString() + " - " +`Application and lease were deleted for user: ${userId} and lease: ${leaseId}`);
        delete tenant.spots;
        delete tenant.lease_id;
        delete tenant.room_type;
        delete tenant.base_room_type;
        setTenantAssignment(tenant, "unassigned", "previous");
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
        setSelectedRoomType(null);
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
            console.error(new Date().toISOString() + " - " +e);
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
            console.error(new Date().toISOString() + " - " +e);
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
                    <Tabs activeKey={activeTabKey} onSelect={(e) => setActiveTabKey(e)}>
                        {locations.map(location =>
                            <Tab eventKey={location.location} key={location.location} title={location.location}>
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
                                                .filter(apartment => apartment.location === activeTabKey)
                                                .map(apartment =>
                                                    <Apartment
                                                        key={`${apartment.apartment_number}_${apartment.room_type_id}`}
                                                        apartmentNumber={apartment.apartment_number}
                                                        roomType={apartment.room_type}
                                                        id={`${apartment.apartment_number}_${apartment.room_type_id}`}
                                                        tenants={tenants}
                                                        data={{
                                                            apartmentNumber: apartment.apartment_number,
                                                            roomTypeId: apartment.room_type_id,
                                                            roomType: apartment.room_type,
                                                            baseTypeId: apartment.base_type_id,
                                                            location: apartment.location,
                                                            spots: (apartment.room_type === "Shared" ? 2 : 1) * apartment.rooms - assignments[`${apartment.apartment_number}_${apartment.room_type}`].reduce((partialSum, a) => partialSum + a.spots, 0)
                                                        }}>
                                                        {assignments[`${apartment.apartment_number}_${apartment.room_type}`].map(tenant =>
                                                            <Tenant key={tenant.user_id} userId={tenant.user_id}>
                                                                <TenantCard visible={activeId !== tenant.user_id}
                                                                            tenant={tenant}
                                                                            backgroundColor={activeTabKey === tenant.location && tenant.created_by_user_id == tenant.user_id ? roomTypeColor : (tenant.user_id != tenant.created_by_user_id ? previousColor : otherTypeColor)}/>
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
                                                               additionalStyle={{backgroundColor: roomTypeColor, minHeight: "50%"}}
                                                               title={`Tenants applied to ${activeTabKey}`}>
                                                {tenants
                                                    .filter(tenant => tenant.current_tenant && tenant.location === activeTabKey && !tenant.apartment_number)
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
                                                               additionalStyle={{backgroundColor: otherTypeColor, minHeight: "20%", maxHeight:"40%"}}
                                                               title="Tenants applied to different location">
                                                {tenants
                                                    .filter(tenant => tenant.current_tenant && tenant.location !== activeTabKey && !tenant.apartment_number)
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
                                                               additionalStyle={{backgroundColor: previousColor, minHeight: "15%", maxHeight: "25%"}}
                                                               title="Previous tenants">
                                                {tenants
                                                    .filter(tenant => !tenant.current_tenant && !tenant.apartment_number)
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
                                                                               backgroundColor={activeTabKey === tenant.location ? roomTypeColor : (!tenant.current_tenant ? previousColor : otherTypeColor)}/>)
                                                : null}
                                        </DragOverlay>
                                    </div>
                                </DndContext>
                            </Tab>
                        )}
                    </Tabs>
                    {showRoomTypes &&
                        <RoomTypes
                            selectedRoomType={selectedRoomType}
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

    if (!user?.manage?.includes(site)) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    const semester = context.query.semester.replace("_", " ");

    let [nav, locations, apartments, tenants, previousTenants, currentLeaseRooms] = await Promise.all([
        GetNavLinks(user, site),
        GetLocations(site, semester),
        GetApartments(site),
        GetUserLeaseTenants(site, semester),
        GetPreviousLeaseTenants(site, semester),
        GetVisibleSemesterLeaseRoomsMap(site, semester)
    ]);
    //filter tenants without deposit for suu
    //suu uses this page, snow uses /assignments/{semester}/manage/index
    tenants = tenants.filter(tenant => tenant.deposit_date !== null)
    tenants = [...tenants, ...previousTenants];
    let leaseIds = [...new Set(tenants.map(t => t.lease_id))];
    return {
        props: {
            site: site,
            page: page,
            links: nav,
            apartments: [...apartments],
            locations: [...locations],
            tenants: [...tenants],
            user: {...user},
            semester: semester,
            currentLeaseRoomTypes: currentLeaseRooms,
            leaseIds: leaseIds
        }
    };
}, ironOptions);

export default Assignments;
