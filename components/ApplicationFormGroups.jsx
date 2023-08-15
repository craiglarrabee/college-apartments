import {Col, Form, Row} from "react-bootstrap";
import React from "react";
import classNames from "classnames";

const ApplicationFormGroups = ({
                                   register = () => {
                                   }, errors
                               }) => {
    return (
        <>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="alternate_room_info">
                    <Form.Label>Alternate room information</Form.Label>
                    <Form.Control
                        className={errors && errors.alternate_room_info && classNames("border-danger")} {...register("alternate_room_info", {
                        maxLength: {
                            value: 200,
                            message: "Too long."
                        }
                    })} as="textarea" rows={3}
                        placeholder="If your selected room type is full and you would be ok with a different room type, please write which ones here."/>
                    {errors && errors.alternate_room_info && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.alternate_room_info.message}</Form.Text>}
                </Form.Group>
            </Row>
            <div className="h4">Preferences:</div>
            <Row>
                <Form.Group as={Col}  controlId="roomate">
                    <Form.Label visuallyHidden={true}>Preferred Roommate</Form.Label>
                    <Form.Control
                        className={errors && errors.roomate && classNames("border-danger")} {...register("roomate", {
                        maxLength: {
                            value: 256,
                            message: "Too long."
                        }
                    })} type="text" placeholder="Preferred Roommate Name"/>
                    {errors && errors.roomate &&
                        <Form.Text className={classNames("text-danger")}>{errors && errors.roomate.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} controlId="roomate2">
                    <Form.Label visuallyHidden={true}>Preferred Roommate 2</Form.Label>
                    <Form.Control{...register("roomate2", {maxLength: 256})} type="text"
                                 placeholder="Preferred Roommate Name"/>
                    {errors && errors.roomate2 && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.roomate2.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} controlId="roomate3">
                    <Form.Label visuallyHidden={true}>Preferred Roommate 3</Form.Label>
                    <Form.Control {...register("roomate3", {maxLength: 256})} type="text"
                                  placeholder="Preferred Roommate Name"/>
                    {errors && errors.roomate3 && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.roomate3.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} controlId="roomate4">
                    <Form.Label visuallyHidden={true}>Preferred Roommate 4</Form.Label>
                    <Form.Control {...register("roomate4", {maxLength: 256})} type="text"
                                  placeholder="Preferred Roommate Name"/>
                    {errors && errors.roomate4 &&
                        <Form.Text className={classNames("text-danger")}>{errors && errors.roomate.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} controlId="roomate5">
                    <Form.Label visuallyHidden={true}>Preferred Roommate 5</Form.Label>
                    <Form.Control {...register("roomate5", {maxLength: 256})} type="text"
                                  placeholder="Preferred Roommate Name"/>
                    {errors && errors.roomate5 &&
                        <Form.Text className={classNames("text-danger")}>{errors && errors.roomate.message}</Form.Text>}
                </Form.Group>
            </Row>
            <div className="mb-3">(Roomate and apartment assignments are at discretion of Landlord.)</div>
            <Row>
                <Form.Group as={Col} controlId="likes_dislikes">
                    <Form.Label visuallyHidden={true}>Likes and Dislikes</Form.Label>
                    <Form.Control {...register("likes_dislikes", {maxLength: 255})} name="likes_dislikes" as="textarea"
                                  rows={3}
                                  placeholder="Tell us about your likes and dislikes. Also, if you were referred here by someone, please list their name here."
                    />
                    {errors && errors.likes_dislikes && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.likes_dislikes.message}</Form.Text>}
                </Form.Group>
            </Row>
            <div className={classNames("d-inline-flex")}>When roomate assignments are made, you will receive an email
                with phone numbers and email addresses for your roommates. If you do not want us to share this
                information
                with your roommates please click this box:&nbsp;</div>
            <Form.Check
                className="mb-3" {...register("do_not_share_info", {setValueAs: value => value !== null ? value.toString() : ""})}
                type="checkbox" value="1" id="share_info_false" label="Please do not share my information." inline/>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="roomate_desc">
                    <Form.Label visuallyHidden={true}>Roommate Description</Form.Label>
                    <Form.Control {...register("roomate_desc", {maxLength: 255})} as="textarea" rows={3} type="text"
                                  placeholder="What are you looking for in a roomate or others who are living in your apartment?"
                    />
                    {errors && errors.roomate_desc && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.roomate_desc.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="school_year">
                    <Form.Label>School Year</Form.Label>
                    <Form.Select {...register("school_year", {required: {value: true, message: "Please select your year in school."}})}>
                        <option value="School Year" disabled={true}></option>
                        <option value="Freshman">Freshman</option>
                        <option value="Sophmore">Sophomore</option>
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Graduate">Graduate</option>
                    </Form.Select>
                    {errors && errors.school_year && <Form.Text className={classNames("text-danger")}>{errors && errors.school_year.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="previous_manager">
                    <Form.Label >Previous apartment information</Form.Label>
                    <Form.Control {...register("previous_manager", {maxLength: {value: 200, message: "Too long."}})} as="textarea" rows={3} type="text"
                                  placeholder="Please enter your previous apartment manager&apos;s contact information."
                    />
                    {errors && errors.previous_manager && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.previous_manager.message}</Form.Text>}
                </Form.Group>
            </Row>
        </>
    );
}

export default ApplicationFormGroups;