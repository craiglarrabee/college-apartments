import {useForm} from "react-hook-form";
import React, {useState} from "react";
import {Alert, Button, Form} from "react-bootstrap";
import WorkFormGroups from "./workFormGroups";
import CurrentLeases from "./currentLeases";
import classNames from "classnames";
import ApplicationFormGroups from "./ApplicationFormGroups";
import PageContent from "./pageContent";

const NewApplicationForm = ({
                                site,
                                page,
                                rules,
                                previous_rental,
                                esa_packet,
                                disclaimer,
                                guaranty,
                                canEdit,
                                user,
                                userId,
                                currentLeases,
                                tenant,
                                ...restOfProps
                         }) => {

    const {register, formState: {isValid, isDirty, errors}, handleSubmit} = useForm(tenant);
    const [applicationError, setApplicationError] = useState();

    const onSubmit = async (data, event) => {
        event.preventDefault();
        data.site = site;
        data.leases = currentLeases.map(lease => {
            let ids = data[`lease_${lease.leaseId}_room_type_id`].split("_");
            return {lease_id: ids[0], room_type_id: ids[1]};
        }).filter(lease => !!lease.lease_id);
        data.share_info = data.do_not_share_info === "1" ? "0" : "1";
        data.created_by_user_id = user.id;

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${userId}/applications?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    setApplicationError("There was an error processing your application. Please try again.");
                    break;
                case 204:
                    location = `/deposit?site=${site}`;
            }
        } catch (e) {
            console.error(new Date().toISOString() + " - " +e);
        }
    }

    return (
        <>
            {applicationError &&
                <Alert variant={"danger"} dismissible
                       onClick={() => setApplicationError(null)}>{applicationError}</Alert>
            }
            <Form onSubmit={handleSubmit(onSubmit)} method="post">
                <Form.Group controlId="email">
                    <Form.Control {...register("email")} type="hidden" value={tenant.email}/>
                </Form.Group>
                {site === "suu" ?
                    <WorkFormGroups canChangeApplication={true} register={register}
                                    errors={errors}/> : null}
                <div className="h4">Room Type:</div>
                <br/>
                {currentLeases.map(lease => <CurrentLeases canChangeApplication={true} {...lease} register={register}/>)}
                {errors && errors.lease_room_type_id && <Form.Text className={classNames("text-danger")}>{errors && errors.lease_room_type_id.message}</Form.Text>}
                <ApplicationFormGroups canChangeApplication={true} register={register} errors={errors}
                                       esa_packet={esa_packet} previousRentalLabel={previous_rental}
                                       site={site}
                                       canEdit={canEdit}/>
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
                <div style={{width: "100%"}}
                     className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                    <Button variant="primary" type="submit" disabled={canEdit || !isDirty}>Submit</Button>
                </div>
            </Form>
        </>
    );
};

export default NewApplicationForm;