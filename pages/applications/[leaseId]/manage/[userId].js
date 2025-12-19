import Layout from "../../../../components/layout";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("../../../../components/navigation"), { ssr: false });
import Title from "../../../../components/title";
import Footer from "../../../../components/footer";
import React, {useRef} from "react";
import classNames from "classnames";
import {Button, Tab, Tabs} from "react-bootstrap";
import {GetNavLinks} from "../../../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../../../lib/session/options";
import {GetUserLeaseTenant} from "../../../../lib/db/users/tenant";
import {TenantForm} from "../../../../components/tenantForm";
import ApplicationForm from "../../../../components/applicationForm";
import {GetLeaseRoomsMap} from "../../../../lib/db/users/roomType";
import {GetApplication} from "../../../../lib/db/users/application";
import {GetDynamicContent} from "../../../../lib/db/content/dynamicContent";
import {isBot} from "../../../../lib/bots";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Home = ({
                  site, isABot,
                  navPage,
                  links,
                  user,
                  tenant,
                  currentLeases,
                  application,
                  userId,
                  leaseId,
                  content,
                  company,
                  body,
                  ...restOfProps
              }) => {
    const printRef = useRef(null);

    const handlePrint = () => {
        if (!printRef.current) return;
        const cloned = printRef.current.cloneNode(true);

        const replaceInputs = (root) => {
            const inputs = root.querySelectorAll('input, textarea, select');
            inputs.forEach(inp => {
                let text = '';
                if (inp.tagName.toLowerCase() === 'select') {
                    const sel = inp;
                    const opt = sel.options[sel.selectedIndex];
                    text = opt ? opt.text : '';
                } else if (inp.type === 'checkbox' || inp.type === 'radio') {
                    text = inp.checked ? (inp.getAttribute('data-true-text') || 'Yes') : (inp.getAttribute('data-false-text') || 'No');
                } else {
                    text = inp.value || inp.getAttribute('value') || '';
                }
                const span = document.createElement('div');
                span.textContent = text;
                span.style.whiteSpace = 'pre-wrap';
                inp.parentNode && inp.parentNode.replaceChild(span, inp);
            });
        };

        replaceInputs(cloned);

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Unable to open print window. Please allow popups or use your browser print.');
            return;
        }

        const doc = printWindow.document;
        doc.open();
        doc.write('<!doctype html><html><head><meta charset="utf-8"><title>Application Print</title>');

        const styleNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
        styleNodes.forEach(node => {
            try { doc.write(node.outerHTML); } catch(e) {}
        });
        doc.write('<style>body{background:#fff;padding:20px;color:#000} @media print { a, button { display: none !important } }</style>');
        doc.write('</head><body>');
        doc.write(cloned.outerHTML);
        doc.write('</body></html>');
        doc.close();

        const closePrintWindow = () => { try { printWindow.close(); } catch(e) {} };
        try {
            if ('onafterprint' in printWindow) {
                printWindow.onafterprint = () => { closePrintWindow(); };
            } else if (printWindow.matchMedia) {
                try {
                    const mql = printWindow.matchMedia('print');
                    const listener = (m) => {
                        if (!m.matches) {
                            closePrintWindow();
                            try { mql.removeEventListener('change', listener); } catch(e){}
                        }
                    };
                    if (mql.addEventListener) mql.addEventListener('change', listener);
                    else if (mql.addListener) mql.addListener(listener);
                } catch(e) {}
            }
            printWindow.focus();
            setTimeout(() => { try { printWindow.print(); } catch(e) { console.error('Print failed', e); } setTimeout(closePrintWindow, 1500); }, 500);
        } catch(e) { console.error('Print window handling failed', e); }
    };

    return (
        <Layout site={site} user={user}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")}>
                        <Tabs defaultActiveKey={1}>
                            <Tab title="Personal Info" eventKey={1} key={1}>
                                <TenantForm tenant={tenant} site={site} userId={userId} leaseId={leaseId}/>
                            </Tab>
                            <Tab title="Application" eventKey={2} key={2}>
                                <ApplicationForm {...content} application={application} site={site} userId={userId}
                                                 leaseId={leaseId} navPage={navPage} currentLeases={currentLeases}
                                                 roomTypeId={tenant.room_type_id} emailAddress={tenant.email} company={company} body={body} />
                            </Tab>
                            <Tab title="Printable" eventKey={3} key={3}>
                                <div style={{display: 'flex', justifyContent: 'flex-end'}} className="mb-2">
                                    <Button variant="primary" onClick={handlePrint}>Print</Button>
                                </div>
                                <div ref={printRef}>
                                    <TenantForm tenant={tenant} site={site} userId={userId} leaseId={leaseId}
                                                hideButton={true}/>
                                    <ApplicationForm {...content} printing={true} application={application} site={site}
                                                     userId={userId} leaseId={leaseId} navPage={navPage}
                                                     currentLeases={currentLeases} roomTypeId={tenant.room_type_id}/>
                                </div>
                            </Tab>
                        </Tabs>
                    </div>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    await context.req.session.save();
	const {userId, leaseId, roomTypeId} = context.query;
    const navPage = context.resolvedUrl.substring(0, context.resolvedUrl.indexOf("?")).replace(/\//, "")
        .replace(`/${userId}`, "");
    const page = "application";
    const welcomePage = "welcome";
    const site = context.query.site || SITE;
    const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";
    const user = context.req.session.user;
    let content = {};

    if (!user?.isLoggedIn) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: `/application?site=${site}`});
        context.res.end();
        return {};
    }
    const [welcomeRows, contentRows, emailContentRows, nav, tenant, currentLeases, application] = await Promise.all([
        GetDynamicContent(site, welcomePage),
        GetDynamicContent(site, page),
        GetDynamicContent(site, "response"),
        GetNavLinks(user, site),
        GetUserLeaseTenant(userId, leaseId, roomTypeId),
        GetLeaseRoomsMap(leaseId),
        GetApplication(site, userId, leaseId, roomTypeId)
    ]);

    contentRows.forEach(row => content[row.name] = row.content);
    const emailContent = [];
    emailContentRows.forEach(row => emailContent[row.name] = row.content);
    if (application) {
        application.lease_room_type_id = `${application.lease_id}_${application.room_type_id}`;
        application.do_not_share_info = !application.share_info;
    }

    return {
        props: {
            site: site,
            links: nav,
            isABot: isBot(context),
            user: {...user},
            tenant: {...tenant},
            content: content,
            ...welcomeRows,
            ...emailContent,
            currentLeases: currentLeases,
            application: application,
            navPage: navPage,
            page: page,
            welcomePage: welcomePage,
            userId: userId,
            leaseId: leaseId,
            company: company
        }
    };
}, ironOptions);

export default Home;
