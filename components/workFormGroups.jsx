import {Col, Form, Row} from "react-bootstrap";
import React, {useState} from "react";
import classNames from "classnames";

const WorkFormGroups = ({readOnly}) => {
    let [hideExperience, sethideExperience] = useState(true);

    const handleShowExperience = () => sethideExperience(false);
    const handleHideExperience = () => sethideExperience(true);

    return (
        <>
            <div className="h4">Work Opportunities:</div>
            <div className={classNames("d-inline-flex", "mb-3")}>
                <div>Are you interested in doing maintenance work on the apartment this summer and during the school year for wages?&nbsp;</div>
                <Form.Check className="mb-3" name="maint_work" type="radio" id="maint_work_true" inline label="Yes" onClick={handleShowExperience} />
                <Form.Check className="mb-3" name="maint_work" type="radio" id="maint_work_false" inline label="No" onClick={handleHideExperience} />
            </div>
            <Row>
                <Form.Group className="mb-3" controlId="maint_experience" hidden={hideExperience}>
                    <Form.Label visuallyHidden={true}>Home Phone</Form.Label>
                    <Form.Control name="maint_experience" as="textarea" type="text" placeholder="Explanation" rows={3} maxLength={512} readOnly={readOnly} />
                </Form.Group>
            </Row>
            <div className={classNames("d-inline-flex", "mb-3")}>
                <div>Are you interested in cleaning apartments during semester breaks for wages?&nbsp;</div>
                <Form.Check className="mb-3" name="clean_work" type="radio" id="clean_work_true" inline label="Yes" />
                <Form.Check className="mb-3" name="clean_work" type="radio" id="clean_work_false" inline label="No" />
            </div>
        </>
    );
}

export default WorkFormGroups;