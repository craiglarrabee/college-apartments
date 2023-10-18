import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import classNames from "classnames";
import {GetActiveSemesters, GetActiveSemesterTenants} from "../lib/db/users/userLease";
import {CSVLink} from "react-csv";

const SITE = process.env.SITE;

const Export = ({site, page, links, user, semesters, tenants}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    return (
        <Layout user={user}>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div style={{minHeight: "400px", display: "flex", flexDirection: "column"}} >
                {semesters.map((item) => {
                    const semester_tenants = tenants.filter(tenant => tenant.Semester === item.semester);
                    return (
                    <div className={classNames("mb-3", "d-inline-flex")}>
                        <CSVLink style={{width: "270px", display: "flex", justifyContent: "left"}}
                                 data={semester_tenants}
                                 separator=","
                                 className={"btn btn-primary"}
                                 filename={`${item.semester.toLowerCase().replace(" ", "_")}_tenant_export.csv`}>{`Export ${item.semester} tenants`}</CSVLink>
                    </div>
                    )
                })}
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
        const user = context.req.session.user;
        const page = "export";
        const site = context.query.site || SITE;
        const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";

        if (!user.admin.includes(site)) return {notFound: true};
        const [nav, tenants, semesters] = await Promise.all([
            GetNavLinks(user, site),
            GetActiveSemesterTenants(site),
            GetActiveSemesters(site)
        ]);

        return {
            props: {
                company: company,
                site: site,
                page: page,
                links: nav,
                user: {...user},
                tenants: [...tenants],
                semesters: [...semesters]
            }
        };
    }
    , ironOptions);

export default Export;
