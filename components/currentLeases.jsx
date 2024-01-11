import {FormCheck} from "react-bootstrap";
import React from "react";

const CurrentLeases = ({canChangeApplication, register, leaseId, leaseDescription, rooms, selectedRoomType, selectedLocation, ...restOfProps }) => {
    const filteredRooms = selectedRoomType
        ? rooms.filter(room => room.base_type_id === selectedRoomType)
        : selectedLocation ? rooms.filter(room.location === selectedLocation) : rooms;
    return (
        <>
            <div style={{width: "100%"}}>
                <div style={{textAlign: "center"}} className="h6">Rates For:{leaseDescription}</div>
                <div style={{color: "indianred", textAlign: "center"}} className="h5">RATES INCLUDE ALL UTILITIES</div>
            </div>
            {filteredRooms.map(room => (
                <>
                    <FormCheck {...register(`lease_${leaseId}_room_type_id`, {
                        setValueAs: value => value !== null ? value.toString() : ""
                    })} style={{whiteSpace: "normal"}} disabled={!canChangeApplication} type="radio"
                               label={`$${room.room_rent}/sem - ${room.room_desc}`}
                               id={`${leaseId}_${room.room_type_id}`}
                               value={`${leaseId}_${room.room_type_id}`}></FormCheck>
                </>
            ))}
            <br/>
        </>

    );
}

export default CurrentLeases;