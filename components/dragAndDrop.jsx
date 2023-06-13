import {useDraggable, useDroppable} from "@dnd-kit/core";
import classNames from "classnames";
import {CSS} from "@dnd-kit/utilities";
import {forwardRef} from "react";

export const Apartment = ({id, children, data, tenants}) => {
    const {isOver, setNodeRef, active} = useDroppable({
        id: id,
        data: data
    });
    let tenant = tenants.filter(tenant => tenant.user_id === active?.id)[0];

    const style = {
        opacity: isOver && data.spots > tenant.spots ? 1 : 0.6
    };

    return (
        <div ref={setNodeRef} style={style} className={classNames("droppable")}>
            <div style={{width: "100%", backgroundColor: "lightgrey", borderRadius: "6px"}}>
                <span style={{paddingLeft: "2px", textAlign: "left"}}>{id}</span>
                <span style={{paddingRight: "2px", float: "right"}}>{`${data.spots} spots left`}</span>
            </div>
            {children}
        </div>
    )
};

export const UnassignedTenants = ({children}) => {
    const {isOver, setNodeRef} = useDroppable({id: "unassigned"});

    const style = {
        opacity: isOver ? 1 : 0.6,
        margin: "5px",
        padding: "3px",
        width: "49%",
        border: "1px solid grey",
        borderRadius: "5px",
        alignContent: "start",
        height: "750px",
        overflowY: "auto"
    };

    return (
        <div ref={setNodeRef} style={style} className={classNames("d-flex", "flex-row", "flex-wrap")}>
            {children}
        </div>
    );
};

export const Tenant = ({id, data, children}) => {

    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: id,
        data: data
    });
    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} value={id}>{children}</div>
    );
};

export const TenantCard = ({tenant, children, visible}) => {
    const roomates = buildRoomateList(tenant);
    return (
        <button className={classNames("draggable")} style={{borderWidth: visible ? "1px" : "0px", opacity: visible ? "1.0" : "0.0"}} >
            <div style={{width: "530px", visibility: visible ? "visible" : "hidden"}}>
                {`${tenant.spots === 2 ? "*" : ""} ${tenant.room_type} - ${tenant.first_name} ${tenant.last_name} | ${new Date().getFullYear() - new Date(tenant.date_of_birth).getFullYear()} | ${tenant.gender === "M" ? "Male" : "Female"} | ${tenant.school_year} | ${tenant.submit_date}`}<br/>
                {roomates}{roomates ? <br/> : ""}
                {tenant.roomate_desc}
                {children}
            </div>
        </button>
    );
};

function buildRoomateList(tenant) {
    let roomates = [];
    if (tenant.roomate) roomates.push(tenant.roomate);
    if (tenant.roomate2) roomates.push(tenant.roomate2);
    if (tenant.roomate3) roomates.push(tenant.roomate3);
    if (tenant.roomate4) roomates.push(tenant.roomate4);
    if (tenant.roomate5) roomates.push(tenant.roomate5);
    return roomates.join(", ");
};