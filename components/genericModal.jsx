import {Button, Modal} from "react-bootstrap";
import React from "react";
import classNames from "classnames";

const GenericModal = ({title, show, close, content, ...restOfProps }) => {
    const handleClose = () => {
        close();
    };

    return (
        <Modal show={show}
               onHide={close}
               size="xl"
               aria-labelledby="contained-modal-title-vcenter"
               centered
        >
            <Modal.Header closeButton >{title}</Modal.Header>

            <Modal.Body>
                <div className={classNames("custom-content")}>
                    <div className={classNames("d-inline-flex", "custom-content")}>
                        <div dangerouslySetInnerHTML={{__html: content}}/>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={close}>OK</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default GenericModal;
