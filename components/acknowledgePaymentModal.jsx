import {Button, Modal, Table} from "react-bootstrap";
import React from "react";
import * as Constants from "../lib/constants";
import {Dot} from "react-bootstrap-icons";

const currency = Intl.NumberFormat("en-US", {style: 'currency', currency: 'USD', minimumFractionDigits: 2});
const AcknowledgePaymentModal = ({acknowledge, show, close, content, site, ...restOfProps}) => {
    return (
        <Modal show={show}
               onHide={close}
               size="xl"
               aria-labelledby="contained-modal-title-vcenter"
               centered
        >
            <Modal.Header closeButton>
                <div style={{width: "98%"}} className="d-inline-flex">
                    <Modal.Title style={{width: "95%"}}>Do you want to continue with this payment?</Modal.Title>
                </div>
            </Modal.Header>
            <Modal.Body>
                <Table className="h3">
                    <tr>
                        <td colSpan={2}>{Constants.locations[content.location]}</td>
                    </tr>
                    <br/>
                    <tr>
                        <td>Date:</td>
                        <td>{content.date}</td>
                    </tr>
                    {content.items?.map(item => (
                        <>
                            <tr>
                                <td><Dot/>{item.description}</td>
                                <td>{currency.format(item.unitPrice)}</td>
                            </tr>
                        </>
                    ))
                    }
                    <tr>
                        <td>Amount:</td>
                        <td>{currency.format(content.total)}</td>
                    </tr>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={acknowledge}>Acknowledge</Button>
                <Button onClick={close}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AcknowledgePaymentModal;
