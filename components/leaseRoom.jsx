import {Col, Form, Row} from "react-bootstrap";
import React, {useState} from "react";
import classNames from "classnames";

const LeaseRoom = ({lease_id, room_type_id, room_rent, room_full, room_desc, site, canEdit, ...restOfProps}) => {
    const [timer, setTimer] = useState(null);
    const [rent, setRent] = useState(room_rent);
    const [full, setFull] = useState(room_full);
    const [desc, setDesc] = useState(room_desc);

    const updateLeaseRoom = async (rentValue, fullValue) => {
        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({room_rent: rentValue, room_full: fullValue}),
            };

            const resp = await fetch(`/api/leases/${lease_id}/rooms/${room_type_id}?site=${site}`, options);
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    break;
            }
        } catch (e) {
            console.error(`${new Date().toISOString()} -` , e);
        }
    };

    const updateDesc = async (value) => {
        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({room_desc: value}),
            };

            const resp = await fetch(`/api/rooms/${room_type_id}?site=${site}`, options);
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    break;
            }
        } catch (e) {
            console.error(`${new Date().toISOString()} -` , e);
        }
    };

    const rentChanged = e => {
        setRent(e.target.value);
        clearTimeout(timer);
        const newTimer = setTimeout(async () => {
            await updateLeaseRoom(e.target.value, full);
        }, 1500);
        setTimer(newTimer);
    }

    const fullChanged = async e => {
        setFull(e.target.checked);
        await updateLeaseRoom(rent, e.target.checked);
    }

    const descChanged = e => {
        setDesc(e.target.value);
        clearTimeout(timer);
        const newTimer = setTimeout(async () => {
            await updateDesc(e.target.value);
        }, 1500);
        setTimer(newTimer);
    }

    if (canEdit)
        return (
            <>
                <Row>
                    <Form.Group as={Col} xs={1} style={{paddingRight: "0px"}} controlId={`roomType${room_type_id}`}>
                        <Form.Label hidden={true}>Room Type</Form.Label>
                        <Form.Control style={{fontWeight: "bold", paddingRight: "0px", paddingLeft: "0px"}} plaintext
                                      readOnly type="text" defaultValue={`#${room_type_id}:$`}/>
                    </Form.Group>
                    <Form.Group as={Col} xs={1} style={{paddingRight: "0px", paddingLeft: "0px"}}
                                controlId={`roomRent${room_type_id}`}>
                        <Form.Label hidden={true}>Room Rent</Form.Label>
                        <Form.Control style={{fontWeight: "bold", paddingRight: "0px", paddingLeft: "0px"}} type="1"
                                      defaultValue={rent} onChange={rentChanged}/>
                    </Form.Group>
                    <Form.Group as={Col} xs={9} style={{paddingRight: "0px", paddingLeft: "0px"}}
                                controlId={`roomDesc${room_type_id}`}>
                        <Form.Label hidden={true}>Room Description</Form.Label>
                        <Form.Control type="text" style={{paddingRight: "0px", paddingLeft: "0px"}} defaultValue={desc}
                                      onChange={descChanged}/>
                    </Form.Group>
                    <Form.Group as={Col} xs={1} style={{paddingRight: "0px", paddingLeft: "0px"}}
                                controlId={`roomFull${room_type_id}`}>
                        <Form.Label hidden={true}>Room Full</Form.Label>
                        <Form.Check label="Full" checked={full} onChange={fullChanged}/>
                    </Form.Group>
                </Row>
            </>
        );
    else
        return (
            <>
                <div className={classNames("flex-row", "d-inline-flex")}>
                    <div style={{fontWeight: "bold"}}> #{room_type_id}:</div>
                    <div style={{fontWeight: "bold"}}>${room_rent}.00</div>
                    {room_full ? <div style={{fontWeight: "bold", color: "indianred"}}>&nbsp;FULL&nbsp;</div> : null}
                    <div>{room_desc}</div>
                </div>
            </>
        );
}

export default LeaseRoom;