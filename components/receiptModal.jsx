import {Button, Modal, OverlayTrigger, Table, Tooltip} from "react-bootstrap";
import React, {useState} from "react";
import {Dot, Printer} from "react-bootstrap-icons";
import * as Constants from "../lib/constants";

const currency = Intl.NumberFormat("en-US", {style: 'currency', currency: 'USD', minimumFractionDigits: 2});
const ReceiptModal = ({show, close, content, site, ...restOfProps}) => {

    return (
        <Modal show={show}
               onHide={close}
               size="xl"
               aria-labelledby="contained-modal-title-vcenter"
               centered
               fullscreen={true}
        >
            <Modal.Header closeButton>
                <div style={{width: "98%"}} className="d-inline-flex">
                    <Modal.Title style={{width: "95%"}}>Thank you for your payment</Modal.Title>
                    <Button variant="primary-outline" size="lg" onClick={() => window.print()}><Printer/></Button>
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
                        <tr style={{borderTopWidth: "2px"}}>
                            <td>Total:</td>
                            <td>{currency.format(content.total)}</td>
                        </tr>
                    </Table>
                </Modal.Body>
            <Modal.Footer>
                <Button onClick={close}>OK</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ReceiptModal;
