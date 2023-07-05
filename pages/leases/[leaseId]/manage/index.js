import Layout from "../../../../components/layout";
import Navigation from "../../../../components/navigation";
import Title from "../../../../components/title";
import Footer from "../../../../components/footer";
import React, {useState} from "react";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import classNames from "classnames";
import {Tab, Tabs} from "react-bootstrap";
import {SentLeaseList, SignedLeaseList, WelcomedApplicationList} from "../../../../components/applicationList";
import {GetUserLeases} from "../../../../lib/db/users/userLease";

const SITE = process.env.SITE;

const Lease = ({site, page, links, user, leaseId, leases}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const [pendingLeases, setPendingLeases] = useState(leases.filter(lease => !lease.signed_date));
    const [signedLeases, setSignedLeases] = useState(leases.filter(lease => lease.signed_date));

    return (
        <Layout user={user}>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")}>
                    <Tabs defaultActiveKey={1}>
                        <Tab eventKey={1} title="Welcomed">
                            <WelcomedApplicationList data={pendingLeases} page={page} site={site} leaseId={leaseId} />
                        </Tab>
                        <Tab eventKey={2} title="Signed">
                            <SignedLeaseList data={signedLeases} page={page} site={site} leaseId={leaseId} />
                        </Tab>
                    </Tabs>
                </div>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    const page = context.resolvedUrl.substring(0, context.resolvedUrl.indexOf("?")).replace(/\//, "");
    const site = context.query.site || SITE;
    if (user.admin !== site && !user.manageApartment) {
        return {notFound: true};
    }
    const editing = !!user && !!user.editSite;
    const [nav, leases] = await Promise.all([
        GetNavLinks(user, site),
        GetUserLeases(context.query.leaseId)
    ]);

    return {
        props: {
            site: site,
            page: page,
            links: nav,
            canEdit: editing,
            user: {...user},
            leases: [...leases],
            leaseId: context.query.leaseId
        }
    };
}, ironOptions);

export default Lease;
