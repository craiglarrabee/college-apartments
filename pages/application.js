import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import classNames from "classnames";
import {Alert, Button, Form} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import WorkFormGroups from "../components/workFormGroups";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import PageContent from "../components/pageContent";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {useForm} from "react-hook-form";
import {GetUserAvailableLeaseRooms} from "../lib/db/users/roomType";
import CurrentLeases from "../components/currentLeases";
import {GetTenant} from "../lib/db/users/tenant";
import ApplicationFormGroups from "../components/ApplicationFormGroups";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Application = ({
                         site,
                         page,
                         navPage,
                         rules,
                         previous_rental,
                         esa_packet,
                         disclaimer,
                         guaranty,
                         links,
                         canEdit,
                         user,
                         currentLeases,
                         company,
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

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${user.id}/applications?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    setApplicationError("There was an error processing your application. Please try again.");
                    break;
                case 204:
                    location = `/deposit?site=${site}`;
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <Layout site={site} user={user} wide={false}>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                {applicationError &&
                    <Alert variant={"danger"} dismissible onClick={() => setApplicationError(null)}>{applicationError}</Alert>
                }
                <div className={classNames("main-content")}>
                    <Form onSubmit={handleSubmit(onSubmit)} method="post">
                        <Form.Group controlId="email">
                            <Form.Control {...register("email")} type="hidden" value={tenant.email}/>
                        </Form.Group>
                        {site === "suu" ?
                            <WorkFormGroups canChangeApplication={true} register={register} errors={errors}/> : null}
                        <div className="h4">Room Type:</div>
                        <br/>
                        {currentLeases.map(lease => <CurrentLeases canChangeApplication={true} {...lease}
                                                                   register={register}/>)}
                        {errors && errors.lease_room_type_id && <Form.Text
                            className={classNames("text-danger")}>{errors && errors.lease_room_type_id.message}</Form.Text>}
                        <ApplicationFormGroups canChangeApplication={true} register={register} errors={errors}
                                               esa_packet={esa_packet} previousRentalLabel={previous_rental} site={site}
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
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    if (!user?.isLoggedIn) return {notFound: true};
    const page = "application";
    const site = context.query.site || SITE;
    const content = {};
    const editing = !!user && !!user.editSite;
    const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";
    const [contentRows, nav, currentRooms, tenant] = await Promise.all([
        GetDynamicContent(site, page),
        GetNavLinks(user, site),
        GetUserAvailableLeaseRooms(site, editing ? "" : user.id),
        GetTenant(site, user.id)
    ]);

    if (!currentRooms || currentRooms.length === 0) {
        console.error("redirecting to deposit due to no current rooms");
        context.res.writeHead(302, {Location: `/deposit?site=${site}`});
        context.res.end();
        return {};
    }
    contentRows.forEach(row => content[row.name] = row.content);
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
