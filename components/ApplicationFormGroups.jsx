import {Col, Form, Row} from "react-bootstrap";
import React, {useState} from "react";
import classNames from "classnames";
import PageContent from "./pageContent";

const ApplicationFormGroups = ({
                                   register = () => {
                                   }, errors,
                                   canChangeApplication,
                                   previousRentalLabel,
                                   esa_packet,
                                   site,
                                   canEdit,
                                   application
                                   , ...restOfProps
                               }) => {
    const [hideEsa, setHideEsa] = useState(!application?.esa);
    const [referredBy, setReferredBy] = useState(application?.referred_by);
    const [referredDesc, setReferredDesc] = useState(application?.referred_desc);

    const handleChangeReferred = (event) => {
        setReferredBy(event.target.value);
        if (event.target.value !== "Other") {
            setReferredDesc("");
        }
    }
    const handleShowEsa = () => setHideEsa(false);
    const handleHideEsa = () => setHideEsa(true);
    return (
        <>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="alternate_room_info">
                    <Form.Label>Alternate room information</Form.Label>
                    <Form.Control
                        disabled={!canChangeApplication}
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
            {site !== "suu" ? <></> :
                <div className={classNames("d-grid")}>
                    <div className={classNames("d-inline-flex")}>
                        <div className="required">I&apos;d like to receive text communication from Stadium Way/College
                            Way Apartments.&nbsp;</div>
                        <Form.Check disabled={!canChangeApplication}
                                    className={errors && errors.sms_enrolled && classNames("border-danger")} {...register("sms_enrolled", {
                            required: "This is required.",
                            setValueAs: value => value !== null ? value.toString() : ""
                        })} title="sms_enrolled_true" type="radio" id="sms_enrolled_true" inline label="Yes" value="1"/>
                        <Form.Check disabled={!canChangeApplication}
                                    className={errors && errors.sms_enrolled && classNames("border-danger")} {...register("sms_enrolled", {
                            required: "This is required.",
                            setValueAs: value => value !== null ? value.toString() : ""
                        })} title="sms_enrolled_false" type="radio" id="sms_enrolled_false" inline label="No"
                                    value="0"/>
                    </div>
                    {errors && errors.sms_enrolled && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.sms_enrolled.message}</Form.Text>}
                    &nbsp;<br/>
                </div>
            }
            <div className={classNames("d-grid")}>
                <div className={classNames("d-inline-flex")}>
                    <div className="required">Do you have an ESA?&nbsp;</div>
                    <Form.Check disabled={!canChangeApplication}
                                className={errors && errors.esa && classNames("border-danger")} {...register("esa", {
                        required: "This is required.",
                        setValueAs: value => value !== null ? value.toString() : ""
                    })} title="esa_true" type="radio" id="esa_true" inline label="Yes" value="1"
                                onClick={handleShowEsa}/>
                    <Form.Check disabled={!canChangeApplication}
                                className={errors && errors.esa && classNames("border-danger")} {...register("esa", {
                        required: "This is required.",
                        setValueAs: value => value !== null ? value.toString() : ""
                    })} title="esa_false" type="radio" id="esa_false" inline label="No" value="0"
                                onClick={handleHideEsa}/>
                </div>
                {errors && errors.esa && <Form.Text
                    className={classNames("text-danger")}>{errors && errors.esa.message}</Form.Text>}
            </div>
            <Row>
                <Form.Text className="mb-3" controlId="esa_packet" hidden={!canEdit && hideEsa}>
                    <PageContent
                        initialContent={esa_packet}
                        site={site}
                        page="application"
                        name="esa_packet"
                        canEdit={canEdit}/>
                </Form.Text>
            </Row>
            <br/>
            <Row>
                <Form.Group as={Col} controlId="roomate">
                    <Form.Label visuallyHidden={true}>Preferred Roommate</Form.Label>
                    <Form.Control
                        disabled={!canChangeApplication}
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
                                 disabled={!canChangeApplication} placeholder="Preferred Roommate Name"/>
                    {errors && errors.roomate2 && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.roomate2.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} controlId="roomate3">
                    <Form.Label visuallyHidden={true}>Preferred Roommate 3</Form.Label>
                    <Form.Control {...register("roomate3", {maxLength: 256})} type="text"
                                  disabled={!canChangeApplication} placeholder="Preferred Roommate Name"/>
                    {errors && errors.roomate3 && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.roomate3.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} controlId="roomate4">
                    <Form.Label visuallyHidden={true}>Preferred Roommate 4</Form.Label>
                    <Form.Control {...register("roomate4", {maxLength: 256})} type="text"
                                  disabled={!canChangeApplication} placeholder="Preferred Roommate Name"/>
                    {errors && errors.roomate4 &&
                        <Form.Text disabled={!canChangeApplication}
                                   className={classNames("text-danger")}>{errors && errors.roomate.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} controlId="roomate5">
                    <Form.Label visuallyHidden={true}>Preferred Roommate 5</Form.Label>
                    <Form.Control {...register("roomate5", {maxLength: 256})} type="text"
                                  disabled={!canChangeApplication} placeholder="Preferred Roommate Name"/>
                    {errors && errors.roomate5 &&
                        <Form.Text className={classNames("text-danger")}>{errors && errors.roomate.message}</Form.Text>}
                </Form.Group>
            </Row>
            <div className="mb-3">(Roomate and apartment assignments are at discretion of Landlord.)</div>
            <Row>
                <Form.Group as={Col} controlId="likes_dislikes">
                    <Form.Label visuallyHidden={true}>Likes and Dislikes</Form.Label>
                    <Form.Control {...register("likes_dislikes", {maxLength: 1024})} name="likes_dislikes" as="textarea"
                                  rows={3}
                                  disabled={!canChangeApplication}
                                  placeholder="Tell us about your likes and dislikes. Also, if you were referred here by someone, please list their name here."
                    />
                    {errors && errors.likes_dislikes && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.likes_dislikes.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <div className={classNames("d-inline-flex")}>When roomate assignments are made, you will receive an
                    email
                    with phone numbers and email addresses for your roommates. If you do not want us to share this
                    information with your roommates please click this box:&nbsp;</div>
                <Form.Check
                    disabled={!canChangeApplication}
                    style={{marginLeft: "10px"}}
                    className="mb-3" {...register("do_not_share_info", {setValueAs: value => value !== null ? value.toString() : ""})}
                    type="checkbox" value="1" id="share_info_false" label="Please do not share my information." inline/>
            </Row>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="roomate_desc">
                    <Form.Label visuallyHidden={true}>Roommate Description</Form.Label>
                    <Form.Control {...register("roomate_desc", {maxLength: 1024})} as="textarea" rows={3} type="text"
                                  disabled={!canChangeApplication}
                                  placeholder="What are you looking for in a roomate or others who are living in your apartment?"
                    />
                    {errors && errors.roomate_desc && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.roomate_desc.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="school_year">
                    <Form.Label className="required">School Year</Form.Label>
                    <Form.Select disabled={!canChangeApplication}  {...register("school_year", {
                        required: {
                            value: true,
                            message: "Please select your year in school."
                        }
                    })} value={application?.school_year} defaultValue="" >
                        <option value="" disabled>School Year</option>
                        <option value="Freshman">Freshman</option>
                        <option value="Sophmore">Sophomore</option>
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Graduate">Graduate</option>
                    </Form.Select>
                    {errors && errors.school_year && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.school_year.message}</Form.Text>}
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="referred_by">
                    <Form.Label className="required">Referred by</Form.Label>
                    <Form.Select disabled={!canChangeApplication}  {...register("referred_by", {
                        required: {
                            value: true,
                            message: "Please tell us how you heard about us."
                        },
                        onChange: handleChangeReferred
                    })} value={referredBy}
                        defaultValue=""
                    >
                        <option value="" disabled>Referred by</option>
                        <option value="Mail">Direct Mail Flyer</option>
                        <option value="Snow">Snow College Website</option>
                        <option value="Search">Internet Search</option>
                        <option value="Tenant">Prior or Current Tenant</option>
                        <option value="Summer">Stayed Here with Summer Group</option>
                        <option value="Snowblast">Snowblast</option>
                        <option value="Ambassador">Ambassador</option>
                        <option value="Coach">Sports Coach</option>
                        <option value="Other">Other</option>
                    </Form.Select>

                    {errors && errors.referred_by && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.referred_by.message}</Form.Text>}
                </Form.Group>
            </Row>
            {referredBy === "Other" ?
                <Row>
                    <Form.Group as={Col} controlId="referred_desc">
                        <Form.Label visuallyHidden={true}>Referred by description</Form.Label>
                        <Form.Control
                            disabled={!canChangeApplication}
                            className={errors && errors.referred_desc && classNames("border-danger")} {...register("referred_desc", {
                            maxLength: {
                                value: 256,
                                message: "Too long."
                            }
                        })}
                            type="text"
                            placeholder="Who were you referred by?"
                            value={referredDesc}
                        />
                        {errors && errors.referred_desc &&
                            <Form.Text className={classNames("text-danger")}>{errors && errors.referred_desc.message}</Form.Text>}
                    </Form.Group>
                </Row> :
                <></>
            }
            <br/>
            <Row>
                <Form.Group as={Col} className="mb-3" controlId="previous_manager">
                    <Form.Label>
                        <PageContent
                            initialContent={previousRentalLabel}
                            site={site}
                            page="application"
                            name="previous_rental"
                            canEdit={canEdit}/>
                    </Form.Label>
                    <Form.Control {...register("previous_manager", {maxLength: {value: 200, message: "Too long."}})}
                                  as="textarea" rows={3} type="text"
                                  disabled={!canChangeApplication}
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