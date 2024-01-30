import {Alert, Button, Col, Form, FormCheck, Row} from "react-bootstrap";
import React, {useState} from "react";
import classNames from "classnames";
import WorkFormGroups from "./workFormGroups";
import {useForm} from "react-hook-form";
import CurrentLeases from "./currentLeases";
import ApplicationFormGroups from "./ApplicationFormGroups";
import PageContent from "./pageContent";

const ApplicationForm = ({
                             printing,
                             isTenant,
                             page,
                             navPage,
                             site,
                             rules,
                             previousRentalLabel,
                             esa_packet,
                             disclaimer,
                             guaranty,
                             links,
                             canEdit,
                             userId,
                             leaseId,
                             application,
                             currentLeases,
                             roomTypeId,
                             emailAddress,
                             company,
                             body,
                             ...restOfProps
                         }) => {
    application[`lease_${leaseId}_room_type_id`] = application.lease_room_type_id;
    const {
        register,
        reset,
        formState: {isValid, isDirty, errors},
        handleSubmit
    } = useForm({defaultValues: {...application}});
    const [error, setError] = useState();
    const [success, setSuccess] = useState();
    const [processed, setProcessed] = useState(application.processed);
    const [depositReceived, setDepositReceived] = useState(!!application.deposit_date);
    const [sendEmail, setSendEmail] = useState(true);
    const canChangeApplication = !isTenant || !application.processed;
    const showButtons = canChangeApplication && !printing;
    const from = `${site}@snowcollegeapartments.com`;


    const receiveDeposit = async () => {
        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/deposit?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    setError(`An error occured receiving the deposit. Please try again. ${JSON.stringify(await resp.json())}`);
                    break;
                case 204:
                case 200:
                    setDepositReceived(true);
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteDeposit = async () => {
        try {
            const options = {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/deposit?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    setError(`An error occurred deleting the deposit. Please try again. ${JSON.stringify(await resp.json())}`);
                    break;
                case 204:
                case 200:
                    setDepositReceived(false);
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async () => {
        try {
            const options = {
                method: "DELETE",
                headers: {"Content-Type": "application/json"}
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}&roomTypeId=${roomTypeId}`, options)
            switch (resp.status) {
                case 400:
                    setError(`An error occurred deleting the application. Please try again. ${JSON.stringify(await resp.json())}`);
                    break;
                case 204:
                    location = `/${navPage}?site=${site}`;
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    };

    const sendResponseEmail = async () => {
        try {
            const payload = {
                from: from,
                subject: `Welcome to ${company}`,
                address: emailAddress,
                body: body
            };

            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }

            const resp = await fetch(`/api/util/email?site=${site}`, options);
            switch (resp.status) {
                case 400:
                    setError("An error occurred sending the application response email.");
                    break;
                case 204:
                    setSuccess(`Application response email sent.`);
                    break;
            }
        } catch (e) {
            setError(`An error occurred sending the application response email. ${e.message}`);
            console.error(e);
        }
    };

    const handleSetProcessedStatus = async (processed) => {

        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({processed: processed}),
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    setError(`An error occurred updating the application. Please try again. ${JSON.stringify(await resp.json())}`);
                    break;
                case 204:
                    if (sendEmail && !processed) await sendResponseEmail();
                    setProcessed(processed);
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    };

    const onSubmitApplication = async (data, event) => {
        event.preventDefault();
        data.site = site;
        let ids = data.lease_room_type_id.split("_");
        data.lease_id = ids[0];
        data.room_type_id = ids[1];
        data.share_info = data.do_not_share_info === "1" ? "0" : "1";

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${userId}/leases/${leaseId}/application?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    setError(`An error occurred updating the application. Please try again. ${JSON.stringify(await resp.json())}`);
                    break;
                case 204:
                    location = `/${navPage}?site=${site}`;
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <Form onSubmit={handleSubmit(onSubmitApplication)} method="post">
                {error && <Alert dismissible variant="danger" onClose={() => setError(null)}>{error}</Alert>}
                {success &&
                    <Alert dismissible variant="success" onClose={() => setSuccess(null)}>{success}</Alert>}
                {site === "suu" ?
                    <WorkFormGroups register={register} application={application} errors={errors}
                                    canChangeApplication={canChangeApplication}/> : null}
                <div className="h4">Room Type:</div>
                <br/>
                {currentLeases.map(lease => <CurrentLeases canChangeApplication={canChangeApplication} {...lease}
                                                           register={register}
                                                           enabled={application === undefined || application === null || application.lease_id === lease.leaseId}/>)}
                {errors && errors.lease_room_type_id && <Form.Text
                    className={classNames("text-danger")}>{errors && errors.lease_room_type_id.message}</Form.Text>}
                <ApplicationFormGroups canChangeApplication={canChangeApplication} register={register} errors={errors}
                                       previousRentalLabel={previousRentalLabel} esa_packet={esa_packet} site={site}
                                       canEdit={canEdit} application={application}/>
                {!printing &&
                    <>
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
                    </>
                }
                <div className={classNames("mb-3", "d-inline-flex")}>
                    <Form.Check
                        disabled={!canChangeApplication}
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
                {showButtons &&
                    <div style={{width: "100%"}}
                         className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                        {isDirty || isTenant ?
                            <Button variant="primary" disabled={!isDirty} type="submit"
                                    style={{margin: "5px"}}>{"Save"}</Button> :
                            <>
                                {!processed &&
                                    <div style={{height: "100%", alignSelf: "end", display: "inline-flex",}}>
                                        <Form.Check onClick={() => setSendEmail(!sendEmail)} className="mb-3"
                                                    type="checkbox" id="sendEmailBox" checked={sendEmail}/>
                                        <span>Send Email</span>
                                    </div>
                                }
                                <Button variant="primary"
                                        onClick={() => handleSetProcessedStatus(!processed)}>{processed ? "Mark Unprocessed" : "Mark Processed"}</Button>
                            </>
                        }
                        {!isTenant &&
                            <>
                            {depositReceived ?
                                <Button variant="primary" onClick={deleteDeposit} style={{margin: "5px"}}>{"Remove Deposit"}</Button> :
                                <Button variant="primary" onClick={receiveDeposit} style={{margin: "5px"}}>{"Receive Deposit"}</Button> }
                                <Button variant="primary" onClick={handleDelete} style={{margin: "5px"}}>{"Delete"}</Button>
                            </>
                        }
                    </div>
                }
            </Form>
        </>
    );
}

export default ApplicationForm;