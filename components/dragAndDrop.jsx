import {useDraggable, useDroppable} from "@dnd-kit/core";
import classNames from "classnames";
import {CSS} from "@dnd-kit/utilities";
import {useState} from "react";
import {WindowDash, WindowFullscreen} from "react-bootstrap-icons";
import roomTypes from "./roomTypes";

export const Apartment = ({apartmentNumber, id, data, tenants, children, roomType}) => {
    const {isOver, setNodeRef, active} = useDroppable({
        id: id,
        data: data
    });
    let tenant = tenants.find(tenant => tenant.user_id === active?.id);

    const style = {
        opacity: isOver && data.spots > tenant.spots ? 1 : 0.6
    };

    return (
        <div ref={setNodeRef} style={style} className={classNames("droppable")}>
            <div style={{width: "100%", backgroundColor: "lightgrey", borderRadius: "6px"}}>
                <span style={{paddingLeft: "2px", textAlign: "left"}}>{`${apartmentNumber} `}</span><span style={{fontWeight: "bold"}}>{`(${roomType})`}</span>
                <span style={{paddingRight: "2px", float: "right"}}>{`${data.spots} spots left`}</span>
            </div>
            {children}
        </div>
    )
};

export const UnassignedTenants = ({children, apartmentNumber, additionalStyle, title, roomTypeId}) => {
    const id = `${apartmentNumber}_${roomTypeId}`;
    const {isOver, setNodeRef} = useDroppable({data: {apartmentNumber: apartmentNumber, roomTypeId: roomTypeId}, id: id});
    const [showTenants, setShowTenants] = useState(true);

    const style = {
        opacity: isOver ? 1 : 0.6,
        margin: "5px",
        padding: "3px",
        width: "98%",
        border: "1px solid grey",
        borderRadius: "5px",
        alignContent: "start",
        overflowY: "auto",
        overflowX: "hidden",
        ...additionalStyle
    };

    return (
        <div style={style} className={classNames("d-flex", "flex-row", "flex-wrap")} ref={setNodeRef} >
            <div style={{width: "100%", display: "flex"}}>
                <span style={{textAlign: "center", width: "90%", fontWeight: "bolder", fontSize: "large"}}>{title}</span>
                <span style={{textAlign: "right", width: "10%"}} >{showTenants ? <WindowDash onClick={() => setShowTenants(false)}/> : <WindowFullscreen onClick={() => setShowTenants(true)}/>}</span>
            </div>
            {showTenants &&
            <div>
                {children}
            </div>
            }
        </div>
    );
};

export const Tenant = ({userId, data, children}) => {

    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: userId,
        data: data
    });
    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div key={userId} ref={setNodeRef} style={style} {...listeners} {...attributes} >{children}</div>
    );
};

export const TenantCard = ({tenant, children, visible, backgroundColor}) => {
    const roomates = buildRoomateList(tenant);
    return (
        <button className={classNames("draggable")} style={{borderWidth: visible ? "1px" : "0px", opacity: visible ? "1.0" : "0.0", backgroundColor: backgroundColor}} >
            <div style={{width: "530px", visibility: visible ? "visible" : "hidden"}}>
                {`${tenant.spots === 2 ? "*" : ""} ${tenant.room_type ? tenant.room_type + " - " : ""}${tenant.first_name} ${tenant.last_name} | ${new Date().getFullYear() - new Date(tenant.date_of_birth).getFullYear()} | ${tenant.gender === "M" ? "Male" : "Female"} | ${tenant.school_year || ""} | ${tenant.submit_date || ""}`}<br/>
                {roomates && <><span style={{fontWeight: "bold"}}>desired roommates: </span>{roomates}<br/></>}
                {tenant.roomate_desc && <><span style={{fontWeight: "bold"}}>roommates: </span>{tenant.roomate_desc}<br/></>}
                {tenant.likes_dislikes && <><span style={{fontWeight: "bold"}}>likes: </span>{tenant.likes_dislikes}<br/></>}
                {tenant.room_rent && <><span style={{fontWeight: "bold"}}>applied: </span>{tenant.room_desc} (${tenant.room_rent})</>}
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