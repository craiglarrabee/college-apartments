import Layout from "../../components/layout";
import Navigation from "../../components/navigation";
import Title from "../../components/title";
import Footer from "../../components/footer";
import React from "react";
import {GetDynamicContent} from "../../lib/db/content/dynamicContent";
import {GetNavLinks} from "../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";
import classNames from "classnames";
import {Form} from "react-bootstrap";
import PageContent from "../../components/pageContent";
import {useForm} from "react-hook-form";
import LeaseDefinitionGroup from "../../components/leaseDefinitionGroup";
import {GetLease} from "../../lib/db/users/lease";
import {GetLeaseRooms} from "../../lib/db/users/roomType";
import LeaseRoom from "../../components/leaseRoom";

const SITE = process.env.SITE;

const Lease = ({
                   site, page, lease_header, accommodations_header, accommodations_body, rent_header,
                   rent_body, vehicle_header, vehicle_body, leaseDefinition,
                   lease_body, lease_acceptance, rules, cleaning, repairs, links, canEdit, user, rooms
               }) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const {register, formState: {isValid, isDirty}, handleSubmit} = useForm();
    const today = new Date().toLocaleDateString("en-US", {year: "numeric", month: "long", day: "numeric"});

    const onSubmit = async (data, event) => {
        event.preventDefault();

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${user.id}/leases/${leaseDefinition.id}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")}>
                    <Form onSubmit={handleSubmit(onSubmit)} method="post">
                        {canEdit ? <LeaseDefinitionGroup {...leaseDefinition} className={classNames("custom-content")} /> : null}
                        <PageContent
                            initialContent={lease_header}
                            site={site}
                            page={page}
                            name="lease_header"
                            canEdit={canEdit}/>
                        <div>This Contract is entered into on <strong>{today}</strong>, between Stadium Way/College Way Apartments, LLC, L.L.C.
                            (hereinafter &quot;Landlord&quot;), and __________________________________ (hereinafter &quot;Resident&quot;).
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
                        {rooms.map(room => <LeaseRoom {...room} canEdit={canEdit}/>)}
                        <div style={{fontWeight: "bold"}}>I pick room type #__ ABOVE FOR THE RENT PER SEMESTER SET FORTH less a discount per semester of
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
                        <div style={{fontWeight: "bold"}}>Resident&apos;s vehicle is: Color</div>
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
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    const page = context.resolvedUrl.replace(/\//, "");
    const site = SITE;
    if (user.admin !== site) {
        return {notFound: true};
    }
    const content = {};
    const editing = !!user && !!user.editSite;
    const [leaseDefinition, contentRows, nav, rooms] = await Promise.all([
        GetLease(context.query.leaseId),
        GetDynamicContent(site, page),
        GetNavLinks(user, site),
        GetLeaseRooms(context.query.leaseId)
    ]);
    contentRows.forEach(row => content[row.name] = row.content);

    return {props: {leaseDefinition: {...leaseDefinition}, site: site, page: page, ...content, links: nav, canEdit: editing, user: {...user}, rooms: rooms}};
}, ironOptions);

export default Lease;
