import {Button, Col, Form, Row} from "react-bootstrap";
import React from "react";
import classNames from "classnames";
import WorkFormGroups from "./workFormGroups";
import {useForm} from "react-hook-form";
import CurrentLeases from "./currentLeases";
import ApplicationFormGroups from "./ApplicationFormGroups";
import PageContent from "./pageContent";

const ApplicationForm = ({page, navPage, site, rules, disclaimer, guaranty, links, canEdit, userId, leaseId, application, currentLeases}) => {
    const {register, reset, formState: {isValid, isDirty, errors}, handleSubmit} = useForm({defaultValues: {...application}});

    const handleDelete = async() => {
        try {
            const options = {
                method: "DELETE",
                headers: {"Content-Type": "application/json"}
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    location = `/${navPage}?site=${site}`;
            }
        } catch (e) {
            console.log(e);
        }
    };

    const onSubmitApplication = async (data, event) => {
        event.preventDefault();
        data.site = site;
        let ids = data.lease_room_type_id.split("_");
        data.lease_id = ids[0];
        data.room_type_id = ids[1];
        data.share_info = data.do_not_share_info === "1" ? "0" : "1";
        data.processed = !data.processed;

        //if modifications have been made, we POST and just update the application
        //otherwise we PUT which will complete the existing
        const method = isDirty ? "POST" : "PUT";
        try {
            const options = {
                method: method,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    location = `/${navPage}?site=${site}`;
            }
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <>
            <Form onSubmit={handleSubmit(onSubmitApplication)} method="post">
                {site === "suu" ?
                    <WorkFormGroups register={register} application={application} errors={errors}/> : null}
                <div className="h4">Room Type:</div>
                <br/>
                {currentLeases.map(lease => <CurrentLeases {...lease} register={register} enabled={application === undefined || application === null || application.lease_id === lease.leaseId} />)}
                {errors && errors.lease_room_type_id && <Form.Text
                    className={classNames("text-danger")}>{errors && errors.lease_room_type_id.message}</Form.Text>}
                <ApplicationFormGroups register={register} errors={errors} />
                <PageContent
                    initialContent={rules}
                    site={site}
                    page={page}
                    name="rules"
                    canEdit={canEdit}/>
                <PageContent
                    initialContent={disclaimer}
                    site={site}
                    page={page}
                    name="disclaimer"
                    canEdit={canEdit}/>
                <div className={classNames("mb-3", "d-inline-flex")}>
                    <Form.Check
                        className="mb-3" {...register("installments", {setValueAs: value => value !== null ? value.toString() : ""})}
                        type="checkbox" id="installments" value="1"/>
                    <span>
                                <div>
                                    Check here if you want to pay in installments. <br/>
                                    <PageContent
                                        initialContent={guaranty}
                                        site={site}
                                        page={page}
                                        name="guaranty"
                                        canEdit={canEdit}/>
                                </div>
                            </span>
                </div>
                <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                    <Button variant="primary" type="submit"
                            style={{margin: "5px"}}>{isDirty ? "Save" : application.processed ? "Mark Unprocessed" : "Mark Processed"}</Button>
                    <Button variant="primary" onClick={handleDelete} style={{margin: "5px"}}>{"Delete"}</Button>
                </div>
            </Form>
        </>
    );
}

export default ApplicationForm;