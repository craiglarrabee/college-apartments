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

        // Copy current form state from the live DOM into the cloned DOM so checked radios/checkboxes
        // and selected options are preserved in the print HTML. We pair source and cloned elements
        // by their order in the DOM for simplicity (the cloned structure mirrors the source).
        const syncFormState = (sourceRoot, clonedRoot) => {
            const sourceEls = Array.from(sourceRoot.querySelectorAll('input, textarea, select'));
            const clonedEls = Array.from(clonedRoot.querySelectorAll('input, textarea, select'));
            const len = Math.min(sourceEls.length, clonedEls.length);
            for (let i = 0; i < len; i++) {
                const src = sourceEls[i];
                const dst = clonedEls[i];
                const tag = dst.tagName.toLowerCase();
                const type = dst.type;
                try {
                    if (tag === 'input') {
                        if (type === 'checkbox' || type === 'radio') {
                            // set both attribute and property so native input visuals reflect state
                            if (src.checked) {
                                dst.setAttribute('checked', 'checked');
                                try { dst.checked = true; dst.defaultChecked = true; } catch(e){}
                            } else {
                                dst.removeAttribute('checked');
                                try { dst.checked = false; dst.defaultChecked = false; } catch(e){}
                            }
                        } else {
                            // reflect value both as property and attribute
                            try { dst.value = src.value || ''; } catch(e){}
                            try { dst.setAttribute('value', src.value || ''); } catch(e){}
                        }
                    } else if (tag === 'textarea') {
                        try { dst.value = src.value || src.textContent || ''; } catch(e){}
                        try { dst.textContent = src.value || src.textContent || ''; } catch(e){}
                    } else if (tag === 'select') {
                        try { dst.selectedIndex = src.selectedIndex; } catch(e){}
                        Array.from(dst.options).forEach(opt => opt.removeAttribute('selected'));
                        if (src.selectedIndex >= 0 && dst.options[src.selectedIndex]) {
                            dst.options[src.selectedIndex].setAttribute('selected', 'selected');
                        }
                    }
                } catch (e) {
                    // ignore per-element failures
                }
            }
        };

        syncFormState(printRef.current, cloned);

        // Keep the printable tab layout as-is; do not replace other inputs. Instead we'll inject
        // print-specific CSS into the print window so form controls and user-entered values
        // keep visible borders/padding when printed. This preserves the on-screen formatting.

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Unable to open print window. Please allow popups or use your browser print.');
            return;
        }

        const doc = printWindow.document;
        doc.open();
        // include lang for accessibility
        doc.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Application Print</title>');

        const styleNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
        styleNodes.forEach(node => {
            try { doc.write(node.outerHTML); } catch(e) {}
        });
        // Include print-specific styles so form controls keep visible borders/padding when printed
        // Also include styles for the replaced radio visuals so they are visible immediately in the
        // print window as well as in the print preview.
        doc.write(`<style>
          body{background:#fff;padding:20px;color:#000}
          /* Styles for replaced radio spans inserted into the cloned DOM (visible on-screen in the print window) */
          .print-radio {
            display: inline-block;
            width: 1em;
            height: 1em;
            margin-right: 0.25rem;
            vertical-align: middle;
            border: 1px solid #000;
            border-radius: 50%;
            background: transparent;
          }
          .print-radio.checked {
            background-image: radial-gradient(circle at center, #000 45%, transparent 46%);
          }
          /* Make form controls visibly boxed in print while preserving layout */
          @media print {
            a, button { display: none !important; }
            input[type="text"], input[type="email"], input[type="tel"], input[type="number"],
            input[type="search"], input:not([type]), textarea, select, .form-control {
              border: 1px solid #000 !important;
              padding: 0.15rem 0.4rem !important;
              display: inline-block !important;
              white-space: pre-wrap !important;
              background: transparent !important;
              color: #000 !important;
            }
            textarea { white-space: pre-wrap !important; }

            /* For print, use native radio/checkbox visuals but scale them slightly so selection is clear */
            input[type="checkbox"], input[type="radio"] {
              transform: scale(1.15) !important;
              margin: 0 0.25rem 0 0 !important;
              vertical-align: middle !important;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>`);
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
