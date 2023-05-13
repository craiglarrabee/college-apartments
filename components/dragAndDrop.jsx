import {useDraggable, useDroppable} from "@dnd-kit/core";
import classNames from "classnames";
import {CSS} from "@dnd-kit/utilities";

export const Apartment = ({id, children, data}) => {
    const {isOver, setNodeRef} = useDroppable({
        id: id,
        data: data
    });

    const style = {
        opacity: isOver && data.spots > 0 ? 1 : 0.6,
        height: isOver && data.spots > 0 ? "200px" : "fit-content"
    };

    return (
        <div ref={setNodeRef} style={style} className={classNames("droppable")}>
            <div style={{width: "100%"}} className={classNames("d-inline")}>
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
        width: "50%",
        border: "1px solid grey",
        borderRadius: "15px",
        alignContent: "start"
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
        <button className={classNames("draggable")} ref={setNodeRef} style={style} {...listeners} {...attributes}
                value={id}>{children}</button>
    );
};

export const TenantCard = ({tenant, children}) => {
    const roomates = buildRoomateList(tenant);
    return (
        <div style={{width: "500px"}}>
            {`${tenant.spots === 2 ? "*" : ""} ${tenant.room_type} - ${tenant.first_name} ${tenant.last_name} | ${tenant.gender === "M" ? "Male" : "Female"} | ${tenant.submit_date}`}<br/>
            {roomates}{roomates ? <br/> : ""}
            {tenant.roomate_desc}
            {children}
        </div>
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