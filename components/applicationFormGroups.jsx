import {Col, Form, Row} from "react-bootstrap";
import React from "react";
import classNames from "classnames";

const ApplicationFormGroups = ({register}) => {
    return (
        <>
            <div className="h4">Preferences:</div>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="roomate">
                    <Form.Label visuallyHidden={true}>Preferred Roommate</Form.Label>
                    <Form.Control {...register("roomate" , {maxLength: 256})} type="text" placeholder="Preferred Roommate Name"  />
                    <Form.Text>(If you have requested a private room, this will be the person you share a connected bathroom with.)</Form.Text>
                </Form.Group>
            </Row>
            <div>I prefer the following individuals (other than roomate) to live in my apartment:</div>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="roomate2">
                    <Form.Label visuallyHidden={true}>Preferred Roommate2</Form.Label>
                    <Form.Control{...register("roomate2" , {maxLength: 256})} type="text" placeholder="Preferred Apartment Mate 1"
                                  />
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="roomate3">
                    <Form.Label visuallyHidden={true}>Preferred Roommate3</Form.Label>
                    <Form.Control {...register("roomate3" , {maxLength: 256})} type="text" placeholder="Preferred Apartment Mate 2"
                                  />
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="roomate4">
                    <Form.Label visuallyHidden={true}>Preferred Roommate4</Form.Label>
                    <Form.Control {...register("roomate4" , {maxLength: 256})} type="text" placeholder="Preferred Apartment Mate 3"
                                  />
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="roomate5">
                    <Form.Label visuallyHidden={true}>Preferred Roommate5</Form.Label>
                    <Form.Control {...register("roomate5" , {maxLength: 256})} type="text" placeholder="Preferred Apartment Mate 4"
                                  />
                </Form.Group>
            </Row>
            <div className="mb-3">(Roomate and apartment assignments are at discretion of Landlord.)</div>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="likes_dislikes">
                    <Form.Label visuallyHidden={true}>Likes and Dislikes</Form.Label>
                    <Form.Control name="likes_dislikes" as="textarea" rows={3} type="text"
                                  placeholder="Tell us about your likes and dislikes. Also, if you were referred here by someone, please list their name here."
                                  maxLength={255} />
                </Form.Group>
            </Row>
            <div className={classNames("d-inline-flex")}>When roomate assignments are made, you will receive an email
                with phone numbers and email addresses
                for your roommates. If you do not want us to share this information with your roommates please click
                this box:&nbsp;</div>
            <Form.Check className="mb-3" name="share_info" type="checkbox" id="share_info_false" label="Please do not share my information." inline/>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="roomate_desc">
                    <Form.Label visuallyHidden={true}>Roommate Description</Form.Label>
                    <Form.Control name="roomate_desc" as="textarea" rows={3} type="text"
                                  placeholder="What are you looking for in a roomate or others who are living in your apartment?"
                                  maxLength={1024} />
                </Form.Group>
            </Row>
        </>
    );
}

export default ApplicationFormGroups;