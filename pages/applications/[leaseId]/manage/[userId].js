import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import Footer from "../../../../components/footer";
import React from "react";
import classNames from "classnames";
import {Button, Form, Tab, Tabs} from "react-bootstrap";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {GetUserLeaseTenant} from "../../../../lib/db/users/tenant";
import {useForm} from "react-hook-form";
import {TenantFormGroups} from "../../../../components/tenantFormGroups";
import WorkFormGroups from "../../../../components/workFormGroups";
import CurrentLeases from "../../../../components/currentLeases";
import ApplicationFormGroups from "../../../../components/applicationFormGroups";
import {GetLeaseRooms} from "../../../../lib/db/users/roomType";
import {GetApplication} from "../../../../lib/db/users/application";

const SITE = process.env.SITE;

const Home = ({site, navPage, links, user, tenant, currentLeases, application, userId, leaseId}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const {register, reset, formState: {isValid, isDirty, errors}, handleSubmit} = useForm({defaultValues: {...tenant, ...application}});

    const onSubmitPersonal = async (data, event) => {
        event.preventDefault();

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${userId}/tenant?site=${site}`, options);
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    reset(data);
            }
        } catch (e) {
            console.log(e);
        }
    }
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


    return (
        <Layout user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={1}>
                        <Tab title="Personal Info" eventKey={1}>
                            <Form onSubmit={handleSubmit(onSubmitPersonal)} method="post">
                                <TenantFormGroups tenant={tenant} register={register}
                                                  errors={errors}></TenantFormGroups>
                                <div style={{width: "100%"}}
                                     className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                                    <Button variant="primary" type="submit"
                                            disabled={!isDirty || !isValid}>Save</Button>
                                </div>
                            </Form>
                        </Tab>
                        <Tab title="Application" eventKey={2}>
                            <Form onSubmit={handleSubmit(onSubmitApplication)} method="post">
                                {site === "suu" ? <WorkFormGroups register={register} application={application} errors={errors} /> : null}
                                <div className="h4">Room Type:</div>
                                <br/>
                                {currentLeases.map(lease => <CurrentLeases {...lease} register={register} enabled={application === undefined || application === null || application.lease_id === lease.leaseId} />)}
                                {errors && errors.lease_room_type_id && <Form.Text className={classNames("text-danger")}>{errors && errors.lease_room_type_id.message}</Form.Text>}
                                <ApplicationFormGroups register={register} errors={errors} />
                                <div className={classNames("mb-3", "d-inline-flex")}>
                                    <Form.Check className="mb-3" {...register("installments", {setValueAs: value => value !== null ? value.toString() : ""})} type="checkbox" id="installments" value="1" />
                                    <span>
                                <div>
                                    Check here if you want to pay in installments. <br/>
                                </div>
                            </span>
                                </div>
                                <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                                    <Button variant="primary" type="submit" style={{margin: "5px"}}>{isDirty ? "Save" : application.processed ? "Mark Unprocessed" : "Mark Processed"}</Button>
                                    <Button variant="primary" onClick={handleDelete} style={{margin: "5px"}}>{"Delete"}</Button>
                                </div>
                            </Form>
                        </Tab>
                    </Tabs>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const {userId, leaseId} = context.query;
    const navPage = context.resolvedUrl.substring(0,context.resolvedUrl.indexOf("?")).replace(/\//, "")
        .replace(`/${userId}`, "");
    const user = context.req.session.user;
    if (!user.isLoggedIn) return {notFound: true};
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: "/application"});
        context.res.end();
        return {};
    }
    const site = context.query.site || SITE;
    const [nav, tenant, currentRooms, application] = await Promise.all([
        GetNavLinks(user, site),
        GetUserLeaseTenant(userId, leaseId),
        GetLeaseRooms(leaseId),
        GetApplication(site, userId, leaseId)
    ]);
    let currentLeases = [...new Set(currentRooms.map(room => room.lease_id))];
    currentLeases = currentLeases.map(lease => {
        let rooms = currentRooms.filter(room => room.lease_id === lease);
        return {leaseId: lease, leaseDescription: rooms[0].description, rooms: rooms};
    });
    if (application) {
        application.submit_date = application.submit_date.toISOString().split("T")[0];
        application.lease_room_type_id = `${application.lease_id}_${application.room_type_id}`;
        application.do_not_share_info = !application.share_info;
    }
    if (tenant) tenant.date_of_birth = tenant.date_of_birth.toISOString().split("T")[0];
    return {
        props: {
            site: site,
            links: nav,
            user: {...user},
            tenant: {...tenant},
            currentLeases: currentLeases,
            application: application,
            navPage: navPage,
            userId: userId,
            leaseId: leaseId
        }
    };
}, ironOptions);

export default Home;
