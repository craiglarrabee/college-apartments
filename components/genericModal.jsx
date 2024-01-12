import {Modal} from "react-bootstrap";
import React from "react";
import classNames from "classnames";

const GenericModal = ({show, close, content, ...restOfProps }) => {
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
            <Modal.Header closeButton />

            <Modal.Body>
                <div className={classNames("custom-content")}>
                    <div className={classNames("d-inline-flex", "custom-content")}>
                        <div dangerouslySetInnerHTML={{__html: content}}/>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default GenericModal;
