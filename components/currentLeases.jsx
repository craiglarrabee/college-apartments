import {FormCheck} from "react-bootstrap";
import React from "react";

const CurrentLeases = ({register, leaseId, leaseDescription, rooms}) => {

    return (
        <>
            <div style={{width: "100%"}}>
                <div style={{textAlign: "center"}} className="h6">Rates For:{leaseDescription}</div>
                <div style={{color: "indianred", textAlign: "center"}} className="h5">RATES INCLUDE ALL UTILITIES</div>
            </div>
            {rooms.map(room => (
                <FormCheck {...register("lease_room_type_id", {
                    required: "Please select a Room Type above.",
                    setValueAs: value => value !== null ? value.toString() : ""
                })} type="radio"
                           label={`$${room.room_rent}/sem - ${room.room_desc}`} id={`${leaseId}_${room.room_type_id}`}
                           value={`${leaseId}_${room.room_type_id}`}></FormCheck>
            ))}
            <br/>
        </>

    );
}

export default CurrentLeases;