import {Modal} from "react-bootstrap";
import React from "react";
import classNames from "classnames";

const ReceiptModal = ({show, close, content, ...restOfProps }) => {
    const handleClose = () => {
        close();
    };

    return (
        <Modal show={show}
               onHide={handleClose}
               size="xl"
               aria-labelledby="contained-modal-title-vcenter"
               centered
        >
            <Modal.Header closeButton >
                <Modal.Title>Thank you for your purchase</Modal.Title>
            </Modal.Header>

            <Modal.Body>

            </Modal.Body>
        </Modal>
    );
}

export default ReceiptModal;
