import {Button, Modal, OverlayTrigger, Table, Tooltip} from "react-bootstrap";
import React, {useState} from "react";
import {Printer} from "react-bootstrap-icons";
const ReceiptModal = ({show, close, content, ...restOfProps}) => {
    const handleClose = () => {
        close();
    };

    return (
        <Modal show={show}
               onHide={handleClose}
               size="xl"
               aria-labelledby="contained-modal-title-vcenter"
               centered
               fullscreen={true}
        >
            <Modal.Header closeButton>
                <div style={{width: "98%"}} className="d-inline-flex">
                    <Modal.Title style={{width: "95%"}}>Thank you for your payment</Modal.Title>

                    <OverlayTrigger overlay={<Tooltip id="printTip">Print</Tooltip>} placement="left">
                        <Button variant="primary-outline" size="lg" onClick={() => window.print()}><Printer/></Button>
                    </OverlayTrigger>
                </div>
            </Modal.Header>

            <Modal.Body>
                <Table className="h3">
                    <tr>
                        <td>{content.location}</td>
                    </tr>
                    <tr>
                        <td>Date: {content.date}</td>
                    </tr>
                    <tr>
                        <td>Payment Description: {content.description}</td>
                    </tr>
                    <tr>
                        <td>Amount: ${content.amount}</td>
                    </tr>
                </Table>
            </Modal.Body>
        </Modal>
    );
}

export default ReceiptModal;
