import {Form, Row} from "react-bootstrap";
import React, {useState} from "react";
import classNames from "classnames";

const WorkFormGroups = ({register, errors}) => {
    let [hideExperience, sethideExperience] = useState(true);

    const handleShowExperience = () => sethideExperience(false);
    const handleHideExperience = () => sethideExperience(true);

    return (
        <>
            <div className="h4">Work Opportunities:</div>
            <div className={classNames("d-inline-flex")}>
                <div>Are you interested in doing maintenance work on the apartment this summer and during the school year for wages?&nbsp;</div>
                <Form.Check className={errors && errors.maint_experience && classNames("border-danger")} {...register("maint_work", {
                    required: "This is required.",
                    setValueAs: value => value !== null ? value.toString() : ""
                })} type="radio" id="maint_work_true" inline label="Yes" value="1" onClick={handleShowExperience}/>
                <Form.Check className={errors && errors.maint_experience && classNames("border-danger")} {...register("maint_work", {
                    required: "This is required.",
                    setValueAs: value => value !== null ? value.toString() : ""
                })} type="radio" id="maint_work_false" inline label="No" value="0" onClick={handleHideExperience}/>
            </div>
            <Row>
                {errors && errors.maint_work && <Form.Text className={classNames("text-danger")}>{errors && errors.maint_work.message}</Form.Text>}
            </Row>
            <Row>
                <Form.Group className="mb-3" controlId="maint_experience" hidden={hideExperience}>
                    <Form.Label visuallyHidden={true}>Home Phone</Form.Label>
                    <Form.Control className={errors && errors.maint_experience && classNames("border-danger")} {...register("maint_experience", {
                        required: {
                            value: !hideExperience,
                            message: "Please describe your experience."
                        }, maxLength: 512
                    })} as="textarea" type="text" placeholder="Please describe your experience" rows={3}/>
                    {errors && errors.maint_experience && <Form.Text className={classNames("text-danger")}>{errors && errors.maint_experience.message}</Form.Text>}
                </Form.Group>
            </Row>
            <div className={classNames("d-inline-flex")}>
                <div>Are you interested in cleaning apartments during semester breaks for wages?&nbsp;</div>
                <Form.Check className={errors && errors.maint_experience && classNames("border-danger")} {...register("clean_work", {
                    required: "This is required.",
                    setValueAs: value => value !== null ? value.toString() : ""
                })} value="1" type="radio" id="clean_work_true" inline label="Yes"/>
                <Form.Check className={errors && errors.maint_experience && classNames("border-danger")} {...register("clean_work", {
                    required: "This is required.",
                    setValueAs: value => value !== null ? value.toString() : ""
                })} value="0" type="radio" id="clean_work_false" inline label="No"/>
            </div>
            <Row>
                {errors && errors.clean_work && <Form.Text className={classNames("text-danger")}>{errors && errors.clean_work.message}</Form.Text>}
            </Row>
            <br/>
        </>
    );
}

export default WorkFormGroups;