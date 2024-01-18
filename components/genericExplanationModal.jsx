import {Button, Form, Modal, Row} from "react-bootstrap";
import React from "react";
import classNames from "classnames";
import {useForm} from "react-hook-form";

const GenericExplanationModal = ({title, close, data, accept, ...restOfProps}) => {
    const {
        register,
        formState: {isValid, isDirty, errors},
        handleSubmit
    } = useForm({mode: "all"});

    const submit = async (data, event) => {
        event.preventDefault();
        await accept(data.description);
    }

    return (
        <Modal show={data.show}
               onHide={close}
               size="xl"
               aria-labelledby="contained-modal-title-vcenter"
               centered
        >
            <Modal.Header closeButton>{title}</Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit(submit)} method="post">
                    <Row>
                        <Form.Group controlId="description">
                            <Form.Label>Please enter description</Form.Label>
                            <Form.Control className={errors && errors.description && classNames("border-danger")}
                                          type="text" {...register("description", {
                                required: {value: true, message: "Description is required"}
                            })}></Form.Control>
                        </Form.Group>
                    </Row>
                    <Button variant="primary" disabled={!isDirty || !isValid} type="submit">OK</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default GenericExplanationModal;
