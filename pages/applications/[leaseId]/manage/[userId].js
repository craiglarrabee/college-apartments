import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import Footer from "../../../../components/footer";
import React from "react";
import classNames from "classnames";
import {Tab, Tabs} from "react-bootstrap";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {GetUserLeaseTenant} from "../../../../lib/db/users/tenant";
import {useForm} from "react-hook-form";
import {TenantForm} from "../../../../components/tenantForm";
import ApplicationForm from "../../../../components/applicationForm";
import {GetCurrentLeaseRooms} from "../../../../lib/db/users/roomType";
import {GetApplication} from "../../../../lib/db/users/application";
import {WelcomeEmailBody} from "../../../../components/welcomeEmailBody";
import ReactDomServer from "react-dom/server";
import {GetDynamicContent} from "../../../../lib/db/content/dynamicContent";

const SITE = process.env.SITE;

const Home = ({site, navPage, links, user, tenant, currentLeases, application, userId, leaseId, header, body, page, company, year, semester}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const from = `${site}@snowcollegeapartments.com`;
    const {register, reset, formState: {isValid, isDirty, errors}, handleSubmit} = useForm({defaultValues: {...tenant, ...application}});
    const emailBody = <WelcomeEmailBody tenant={tenant} header={header} body={body}
                                        canEdit={false} company={`${company}, LLC`}
                                        site={site} page={page} leaseId={leaseId} year={year} semester={semester} ></WelcomeEmailBody>;
    const emailBodyString = ReactDomServer.renderToString(emailBody);
    const sendEmail = async () => {

        try {
            const payload = {
                from: from,
                subject: `Welcome Email from ${company}`,
                address: user.email,
                body: emailBodyString
            };

            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }

            const resp = await fetch(`/api/util/email`, options);
            switch (resp.status) {
                case 400:
                    alert("An error occurred sending the welcome email.");
                    break;
                case 204:
                    alert("Welcome email sent.");
                    break;
            }
        } catch (e) {
            alert(`An error occurred sending the welcome email. ${e.message}`);
            console.log(e);
        }
    }

    return (
        <Layout user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={1}>
                        <Tab title="Personal Info" eventKey={1}>
                            <TenantForm tenant={tenant} site={site} userId={userId} />
                        </Tab>
                        <Tab title="Application" eventKey={2}>
                            <ApplicationForm application={application} site={site} userId={userId} leaseId={leaseId} navPage={navPage} currentLeases={currentLeases} />
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
    const welcomePage = "welcome";
    const site = context.query.site || SITE;
    const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";
    const user = context.req.session.user;
    let year;
    let semester;

    if (!user.isLoggedIn) return {notFound: true};
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: "/application"});
        context.res.end();
        return {};
    }
    const [contentRows, nav, tenant, currentLeases, application] = await Promise.all([
        GetDynamicContent(site, welcomePage),
        GetNavLinks(user, site),
        GetUserLeaseTenant(userId, leaseId),
        GetCurrentLeaseRooms(leaseId),
        GetApplication(site, userId, leaseId)
    ]);

    if (application) {
        application.lease_room_type_id = `${application.lease_id}_${application.room_type_id}`;
        application.do_not_share_info = !application.share_info;
    }
    if (tenant) tenant.date_of_birth = tenant.date_of_birth.toISOString().split("T")[0];
    if (tenant.fall_year) {
        year = tenant.fall_year;
        semester = "fall";
    } else if (tenant.spring_year) {
        year = tenant.spring_year;
        semester = "spring";
    } else if (tenant.summer_year) {
        year = tenant.summer_year;
        semester = "summer";
    }
    return {
        props: {
            site: site,
            links: nav,
            user: {...user},
            tenant: {...tenant},
            ...contentRows,
            currentLeases: currentLeases,
            application: application,
            navPage: navPage,
            page: welcomePage,
            userId: userId,
            leaseId: leaseId,
            company: company,
            year: year,
            semester: semester
        }
    };
}, ironOptions);

export default Home;
