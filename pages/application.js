import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import classNames from "classnames";
import {Button, Form} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import ApplicationFormGroups from "../components/applicationFormGroups";
import WorkFormGroups from "../components/workFormGroups";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import PageContent from "../components/pageContent";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetDynamicImageContent} from "../lib/db/content/dynamicImageContent";
import {useForm} from "react-hook-form";
import {GetActiveSiteLeaseRooms} from "../lib/db/users/roomType";
import CurrentLeases from "../components/currentLeases";

const SITE = process.env.SITE;

const Application = ({site, page, navPage, rules, disclaimer, guaranty, links, canEdit, user, currentLeases}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const {register, formState: {isValid, isDirty}, handleSubmit} = useForm();
    const [leaseId, setLeaseId] = useState();

    const updateLeaseId = (id) => {
        setLeaseId(id)
    }

    const onSubmit = async (data, event) => {
        event.preventDefault();
        data.site = site;

        try {
            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${user.id}/leases/${leaseId}/application`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    location = "/deposit";
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user} />
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Form onSubmit={handleSubmit(onSubmit)} method="post">
                        {site === "suu" ? <WorkFormGroups register={register} /> : null}
                        <div className="h4">Room Type:</div><br/>
                        {currentLeases.map(lease => <CurrentLeases {...lease} register={register} updateLeaseId={updateLeaseId} />)}
                        <ApplicationFormGroups register={register}/>
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
                            <Form.Check className="mb-3" name="installments" type="checkbox" id="installments" />
                            <span>
                                <div>
                                    Check here if you want to pay in installments. <br/>
                                    <PageContent
                                        initialContent={guaranty}
                                        site={site}
                                        page={page}
                                        name="guaranty"
                                        canEdit={canEdit} />
                                </div>
                            </span>
                        </div>
                        <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                            <Button variant="primary" type="submit" disabled={canEdit || !isDirty || !isValid}>Submit</Button>
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
    const page = context.resolvedUrl.replace(/\//, "");
    const site = "suu";
    const content = {};
    const editing = !!user && !!user.editSite;
    const [contentRows, nav, currentRooms] = await Promise.all([
        GetDynamicContent(site, page),
        GetNavLinks(site, editing),
        GetActiveSiteLeaseRooms(site)
    ]);
    contentRows.forEach(row => content[row.name] = row.content);
    let currentLeases = [... new Set(currentRooms.map(room => room.lease_id))];
    currentLeases = currentLeases.map(lease => {
        let rooms = currentRooms.filter(room => room.lease_id === lease);
        return {leaseId: lease, leaseDescription: rooms[0].description, rooms: rooms};
    });
    return {props: {site: site, page: page, navPage: "user", ...content, links: nav, canEdit: editing, user: {...user}, currentLeases: currentLeases}};
}, ironOptions);

export default Application;
