import {Button, Form, Modal} from "react-bootstrap";
import React from "react";
import classNames from "classnames";
import {useForm} from "react-hook-form";
import CurrentLeases from "./currentLeases";

const RoomTypes = ({show, close, setTenantRoomType, userId, roomTypes, selectedRoomType, selectedLocation, apartment_number, ...restOfProps }) => {
    const {register, formState: {isValid, isDirty, errors}, handleSubmit} = useForm();

    const handleClose = () => {
        close();
    };

    const onSubmit = async (data, event) => {
        event.preventDefault();
        let selectedLease = roomTypes.find(item => data.lease_room_type_id.startsWith(item.leaseId));
        let selectedRoomType = selectedLease.rooms.find(item => data.lease_room_type_id.endsWith(item.room_type_id));
        data.room_type = selectedRoomType.room_type;
        data.room_type_id = selectedRoomType.room_type_id;
        data.apartment_number = apartment_number;
        data.lease_id = selectedLease.leaseId;
        await setTenantRoomType(data);
    };

    return (
        <Modal show={show}
               onHide={handleClose}
               size="xl"
               aria-labelledby="contained-modal-title-vcenter"
               centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Room Type</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)} method="post">
                    <input {...register("user_id")} value={userId} type={"hidden"}/>
                    {roomTypes.map(lease =>
                        <>
                            <CurrentLeases canChangeApplication={true} key={lease.leaseId} {...lease} register={register}
                                           selectedRoomType={selectedRoomType} selectedLocation={selectedLocation} />
                        </>
                    )}
                    <div style={{width: "100%"}}
                         className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                        <Button variant="primary" type="submit" disabled={!isDirty || !isValid}>Save</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default RoomTypes;
