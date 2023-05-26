import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import classNames from "classnames";
import {Button, Form} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import ApplicationFormGroups from "../components/applicationFormGroups";
import WorkFormGroups from "../components/workFormGroups";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import PageContent from "../components/pageContent";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {useForm} from "react-hook-form";
import {GetUserAvailableLeaseRooms} from "../lib/db/users/roomType";
import CurrentLeases from "../components/currentLeases";
import {GetTenant} from "../lib/db/users/tenant";

const SITE = process.env.SITE;

const Application = ({site, page, navPage, rules, disclaimer, guaranty, links, canEdit, user, currentLeases, company, body, tenant}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const from = `${site}@snowcollegeapartments.com`;
    const {register, formState: {isValid, isDirty, errors}, handleSubmit} = useForm(tenant);

    const sendEmail = async (emailAddress) => {

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

            const resp = await fetch(`/api/util/email`, options);
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    break;
            }
        } catch (e) {
            alert(`An error occurred sending the welcome email. ${e.message}`);
            console.log(e);
        }
    }

    const onSubmit = async (data, event) => {
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

            const resp = await fetch(`/api/users/${user.id}/leases/${data.lease_id}/application`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    await sendEmail(data.email);
                    location = "/deposit";
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <Layout user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Form onSubmit={handleSubmit(onSubmit)} method="post">
                        <Form.Group controlId="email">
                            <Form.Control {...register("email")} type="hidden" value={tenant.email}/>
                        </Form.Group>
                        {site === "suu" ? <WorkFormGroups register={register}  errors={errors} /> : null}
                        <div className="h4">Room Type:</div>
                        <br/>
                        {currentLeases.map(lease => <CurrentLeases {...lease} register={register} />)}
                        {errors && errors.lease_room_type_id && <Form.Text className={classNames("text-danger")}>{errors && errors.lease_room_type_id.message}</Form.Text>}
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
                            <Form.Check className="mb-3" {...register("installments", {setValueAs: value => value !== null ? value.toString() : ""})} type="checkbox" id="installments" value="1" />
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
                            <Button variant="primary" type="submit" disabled={canEdit || !isDirty}>Submit</Button>
                        </div>
                    </Form>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    if (!user.isLoggedIn) return {notFound: true};
    const page = "application";
    const site = context.query.site || SITE;
    const content = {};
    const emailContent = {};
    const editing = !!user && !!user.editSite;
    const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";
    const [contentRows, emailContenRows, nav, currentRooms, tenant] = await Promise.all([
        GetDynamicContent(site, page),
        GetDynamicContent(site, "response"),
        GetNavLinks(user, site),
        GetUserAvailableLeaseRooms(site, user.id),
        GetTenant(user.id)
    ]);

    if(!currentRooms || currentRooms.length === 0) {
        context.res.writeHead(302, {Location: "/deposit"});
        context.res.end();
        return {};
    }
    if (tenant) tenant.date_of_birth = tenant.date_of_birth.toISOString().split("T")[0];
    contentRows.forEach(row => content[row.name] = row.content);
    emailContenRows.forEach(row => emailContent[row.name] = row.content);
    let currentLeases = [...new Set(currentRooms.map(room => room.lease_id))];
    currentLeases = currentLeases.map(lease => {
        let rooms = currentRooms.filter(room => room.lease_id === lease);
        return {leaseId: lease, leaseDescription: rooms[0].description, rooms: rooms};
    });

    return {
        props: {
            site: site,
            page: page,
            navPage: "user",
            ...content,
            ...emailContent,
            links: nav,
            canEdit: editing,
            user: {...user},
            currentLeases: currentLeases,
            company: company,
            tenant: {...tenant}
        }
    };
}, ironOptions);

export default Application;
