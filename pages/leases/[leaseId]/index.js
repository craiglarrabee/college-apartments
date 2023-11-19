import Layout from "../../../components/layout";
import Navigation from "../../../components/navigation";
import Title from "../../../components/title";
import Footer from "../../../components/footer";
import React from "react";
import {GetDynamicContent} from "../../../lib/db/content/dynamicContent";
import {GetNavLinks} from "../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../lib/session/options";
import classNames from "classnames";
import {Button, Col, Form, Row} from "react-bootstrap";
import PageContent from "../../../components/pageContent";
import {useForm} from "react-hook-form";
import LeaseDefinitionGroup from "../../../components/leaseDefinitionGroup";
import {GetLease} from "../../../lib/db/users/lease";
import {GetLeaseRooms} from "../../../lib/db/users/roomType";
import LeaseRoom from "../../../components/leaseRoom";
import {GetUserLease} from "../../../lib/db/users/userLease";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Lease = ({
                   site, page, lease_header, accommodations_header, accommodations_body, rent_header,
                   rent_body, vehicle_header, vehicle_body, lease, signed,
                   lease_body, lease_acceptance, rules, cleaning, repairs, links, canEdit, user, rooms
               , ...restOfProps }) => {
    const {register, formState: {errors, isValid, isDirty}, handleSubmit, reset} = useForm({mode: "onChange"});

    const onSubmit = async (data, event) => {
        event.preventDefault();

        try {
            const options = {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${user.id}/leases/${lease.lease_id}?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    reset(data);
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <Layout site={site}  user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user} startWithLogin={!user.isLoggedIn} />
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")}>
                    {user && user.isLoggedIn ?
                    <Form onSubmit={handleSubmit(onSubmit)} method="post">
                        {canEdit ? <LeaseDefinitionGroup {...lease} register={register} className={classNames("custom-content")}/> : null}
                        <PageContent
                            initialContent={lease_header}
                            site={site}
                            page={page}
                            name="lease_header"
                            canEdit={canEdit}/>

                        <Form.Group controlId="signed_date">
                            <Form.Control {...register("signed_date")} type="hidden" value={lease.signed_date}/>
                        </Form.Group>
                        <div>This Contract is entered into on <strong>{lease.signed_date}</strong>, {site === "suu" ? "between Stadium Way/College Way" : "between Park Place Apartments, L.L.C."}
                            Apartments, LLC, L.L.C.
                            (hereinafter &quot;Landlord&quot;),
                            and <strong>{lease.name ? lease.name : "____________________________"}</strong> (hereinafter &quot;Resident&quot;).
                        </div>
                        <PageContent
                            initialContent={accommodations_header}
                            site={site}
                            page={page}
                            name="accommodations_header"
                            canEdit={canEdit}/>
                        <PageContent
                            initialContent={accommodations_body}
                            site={site}
                            page={page}
                            name="accommodations_body"
                            canEdit={canEdit}/>
                        <PageContent
                            initialContent={rent_header}
                            site={site}
                            page={page}
                            name="rent_header"
                            canEdit={canEdit}/>
                        {rooms.map(room => <LeaseRoom {...room} canEdit={canEdit} site={site}/>)}
                        <div style={{fontWeight: "bold"}}>I pick room type
                            #{lease.room_type_id ? lease.room_type_id : "__"} ABOVE FOR THE RENT PER SEMESTER SET FORTH
                            less a discount per semester of
                            $0 .
                        </div>
                        <PageContent
                            initialContent={rent_body}
                            site={site}
                            page={page}
                            name="rent_body"
                            canEdit={canEdit}/>
                        <PageContent
                            initialContent={vehicle_header}
                            site={site}
                            page={page}
                            name="vehicle_header"
                            canEdit={canEdit}/>
                        <div style={{fontWeight: "bold"}}>Resident&apos;s vehicle is:
                            <Row>
                                <Form.Label column="sm" >Color</Form.Label>
                                <Col xs="2">
                                    <Form.Control{...register("vehicle_color", {disabled: signed, maxLength: 50})} type="text"/>
                                </Col>
                                <Form.Label column="sm" >Make/Model</Form.Label>
                                <Col xs="5">
                                    <Form.Control{...register("vehicle_make_model", {disabled: signed, maxLength: 100})} type="text"/>
                                </Col>
                            </Row>
                            <Row>
                                <Form.Label column="sm" >License No.</Form.Label>
                                <Col xs="2">
                                    <Form.Control{...register("vehicle_license", {disabled: signed, maxLength: 10})} type="text"/>
                                </Col>
                                <Form.Label column="sm" >State</Form.Label>
                                <Col xs="5">
                                    <Form.Control{...register("vehicle_state", {disabled: signed, maxLength: 30})} type="text"/>
                                </Col>
                            </Row>
                            <Row>
                                <Form.Label column="sm" >REGISTERED OWNER&apos;S NAME</Form.Label>
                                <Col xs="8">
                                    <Form.Control{...register("vehicle_owner", {disabled: signed, maxLength: 100})} type="text"/>
                                </Col>
                            </Row>
                        </div>
                        <PageContent
                            initialContent={vehicle_body}
                            site={site}
                            page={page}
                            name="vehicle_body"
                            canEdit={canEdit}/>
                        <PageContent
                            initialContent={lease_body}
                            site={site}
                            page={page}
                            name="lease_body"
                            canEdit={canEdit}/>
                        <PageContent
                            initialContent={lease_acceptance}
                            site={site}
                            page={page}
                            name="lease_acceptance"
                            canEdit={canEdit}/>
                        <Row>
                            <Form.Label column >Resident Name</Form.Label>
                            <Col xs="9">
                                <Form.Control{...register("signature", {disabled: signed, required: true, maxLength: 100})} type="text"/>
                            </Col>
                        </Row>
                        <div>(Signature-Type for electronic signature over internet)</div>
                        <br/>
                        <Row>
                            <Form.Label column >Email Address</Form.Label>
                            <Col xs="9">
                                <Form.Control{...register("lease_email", {disabled: signed, required: true, maxLength: 100})} type="text"/>
                            </Col>
                        </Row>
                        <br/>
                        <Row>
                            <Col>
                                <Form.Control{...register("lease_address", {disabled: signed, required: true, maxLength: 200})} type="text"/>
                            </Col>
                        </Row>
                        <div>Tenant&apos;s Full Address: Street, City, State and Zip Code (NO P.O. BOXES)</div>
                        <br/>
                        <Row>
                            <Form.Label column >Tenant&apos;s Cell Phone with Area Code</Form.Label>
                            <Col>
                                <Form.Control{...register("lease_cell_phone", {disabled: signed, required: true, maxLength: 20})} type="text"/>
                            </Col>
                        </Row>
                        <br/>
                        <div>FOR EMERGENCY PURPOSES</div>
                        <Row>
                            <Form.Label column >Parents&apos; names</Form.Label>
                            <Col>
                                <Form.Control{...register("lease_parent_name", {disabled: signed, required: true, maxLength: 255})} type="text"/>
                            </Col>
                        </Row>
                        <br/>
                        <Row>
                            <Form.Label column >and cell phone number with area codes</Form.Label>
                            <Col>
                                <Form.Control{...register("lease_parent_phone", {disabled: signed, required: true, maxLength:50})} type="text"/>
                            </Col>
                        </Row>
                        <br/>
                        <br/>
                        {signed ? <></> : <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}><Button variant="primary" type="submit" disabled={!isDirty || !isValid}>Submit</Button></div> }
                        <PageContent
                            initialContent={rules}
                            site={site}
                            page={page}
                            name="rules"
                            canEdit={canEdit}/>
                        <PageContent
                            initialContent={repairs}
                            site={site}
                            page={page}
                            name="repairs"
                            canEdit={canEdit}/>
                        <PageContent
                            initialContent={cleaning}
                            site={site}
                            page={page}
                            name="cleaning"
                            canEdit={canEdit}/>
                    </Form>
                        : <></> }
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    const page = context.resolvedUrl.substring(0,context.resolvedUrl.indexOf("?")).replace(/\//, "");
    const site = context.query.site || SITE;
    const content = {};
    const today = new Date().toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"});
    const editing = !!user && !!user.editSite;
    const [lease, contentRows, nav, rooms] = await Promise.all([
        editing ? GetLease(context.query.leaseId) : (user && user.isLoggedIn ? GetUserLease(user.id, context.query.leaseId) : {}),
        GetDynamicContent(site, page),
        GetNavLinks(user, site),
        GetLeaseRooms(context.query.leaseId)
    ]);
    const signed = !!lease.signed_date;
    if (!signed) lease.signed_date = today;
    contentRows.forEach(row => content[row.name] = row.content);

    return {
        props: {
            lease: {...lease},
            site: site,
            page: page, ...content,
            links: nav,
            canEdit: editing,
            user: {...user},
            rooms: rooms,
            signed: signed
        }
    };
}, ironOptions);

export default Lease;
