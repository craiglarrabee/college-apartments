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
                  body
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

        // We'll open the print window first, write the head/styles, import the cloned DOM
        // into that document, then measure and insert page-breaks only where necessary.
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Unable to open print window. Please allow popups or use your browser print.');
            return;
        }

        const doc = printWindow.document;
        doc.open();
        // include lang for accessibility and a minimal body with a wrapper we'll populate
        doc.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Application Print</title>');

        const styleNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
        styleNodes.forEach(node => { try { doc.write(node.outerHTML); } catch(e) {} });

        // same injected print styles as before (kept intact)
        doc.write(`<style>
          @page { size: auto; margin: 6mm 6mm 6mm 6mm !important; }
          html, body { margin: 0 !important; padding: 0 !important; background: #fff; color: #000; }
          .print-radio { display: inline-block; width: 1em; height: 1em; margin-right: 0.25rem; vertical-align: middle; border: 1px solid #000; border-radius: 50%; background: transparent; }
          .print-radio.checked { background-image: radial-gradient(circle at center, #000 45%, transparent 46%); }
          @media print {
            a, button { display: none !important; }
            @page { margin: 6mm 6mm 6mm 6mm; }
            body { margin: 0 !important; padding: 6mm !important; }
            input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="search"], input:not([type]), textarea, select, .form-control { border: 1px solid #000 !important; padding: 0.15rem 0.4rem !important; display: inline-block !important; white-space: pre-wrap !important; background: transparent !important; color: #000 !important; }
            textarea { white-space: pre-wrap !important; }
            input[type="checkbox"], input[type="radio"] { transform: scale(1.15) !important; margin: 0 0.25rem 0 0 !important; vertical-align: middle !important; -webkit-print-color-adjust: exact; }
            body { orphans: 2; widows: 2; -webkit-print-color-adjust: exact; }
            h1, h2, h3, h4, h5, h6 { page-break-after: avoid; page-break-inside: avoid; break-inside: avoid; }
            .form-group, fieldset, legend, .field, label, .value, .print-radio { page-break-inside: avoid; break-inside: avoid; }
            .row, .form-row { page-break-inside: auto; break-inside: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            tr { page-break-inside: avoid; break-inside: avoid; }
            .page-break { page-break-before: always; break-before: page; }
            .avoid-break { page-break-inside: avoid; break-inside: avoid; }
            * { -webkit-print-color-adjust: exact; box-sizing: border-box; }
            img { max-width: 100% !important; height: auto !important; }
          }
        </style>`);

        // open body and an empty wrapper; we'll populate and measure in the new document
        doc.write('</head><body><div id="print-wrapper"></div></body></html>');
        doc.close();

        try {
            // Import the cloned node into the print document to keep event/ownership correct
            const wrapper = printWindow.document.getElementById('print-wrapper');
            const imported = printWindow.document.importNode(cloned, true);
            wrapper.appendChild(imported);

            // Measure px per mm in the print window (useful to convert our 6mm margin)
            const mmTest = printWindow.document.createElement('div');
            mmTest.style.height = '1mm';
            mmTest.style.position = 'absolute';
            mmTest.style.top = '-1000mm';
            printWindow.document.body.appendChild(mmTest);
            const pxPerMm = Math.max(1, mmTest.getBoundingClientRect().height || mmTest.offsetHeight || 1);
            mmTest.parentNode.removeChild(mmTest);

            // Determine likely paper height in px by comparing A4 and Letter to the window height
            const a4Px = 297 * pxPerMm; // mm
            const letterPx = 279.4 * pxPerMm; // 11in
            const winH = printWindow.innerHeight || printWindow.document.documentElement.clientHeight || a4Px;
            const pageHeightBasePx = (Math.abs(winH - a4Px) < Math.abs(winH - letterPx)) ? a4Px : letterPx;

            // Subtract the top+bottom padding (6mm each) to compute usable content height
            const marginPx = 6 * pxPerMm;
            const usablePageHeight = Math.max(200, pageHeightBasePx - (marginPx * 2));

            // Recursive splitter: walk the DOM and insert page breaks only where needed.
            let currentPageBottom = usablePageHeight;

            const insertPageBreakBefore = (node) => {
                const br = printWindow.document.createElement('div');
                br.className = 'page-break';
                node.parentNode.insertBefore(br, node);
            };

            // Walk children of `parent` and insert breaks when a child would overflow the current page.
            const walk = (parent) => {
                // Snapshot child list because we'll mutate DOM by inserting breaks
                const children = Array.from(parent.children || []);
                for (let i = 0; i < children.length; i++) {
                    const ch = children[i];

                    // Force layout read so measurements are updated
                    const chTop = ch.offsetTop;
                    const chBottom = chTop + ch.offsetHeight;

                    if (chBottom > currentPageBottom) {
                        // If this single child itself is taller than a page, try to split it by recursing
                        if (ch.offsetHeight > usablePageHeight && ch.children && ch.children.length > 0) {
                            // Recurse into the child to try to split it by its children
                            walk(ch);
                            // re-measure after possible splits
                            const newBottom = ch.offsetTop + ch.offsetHeight;
                            if (newBottom > currentPageBottom) {
                                insertPageBreakBefore(ch);
                                const pagesSpanned = Math.floor((newBottom - currentPageBottom) / usablePageHeight) + 1;
                                currentPageBottom += pagesSpanned * usablePageHeight;
                            }
                        } else {
                            // Otherwise insert a page break before this child
                            insertPageBreakBefore(ch);
                            const pagesSpanned = Math.floor((chBottom - currentPageBottom) / usablePageHeight) + 1;
                            currentPageBottom += pagesSpanned * usablePageHeight;
                        }
                    }

                    // Even if this child fit, its inner children might overflow; recurse to allow finer splits
                    if (ch.children && ch.children.length > 0) {
                        walk(ch);
                    }
                }
            };

            walk(wrapper);
        } catch (e) {
             // If anything goes wrong, fall back to simple printing of the cloned markup
             console.error('Split heuristic failed, falling back to un-split print', e);
             const doc = printWindow.document;
             doc.open();
             doc.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Application Print</title>');
             const styleNodes2 = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
             styleNodes2.forEach(node => { try { doc.write(node.outerHTML); } catch(e) {} });
             doc.write('</head><body>');
             doc.write(`<div style="padding:6mm;">${cloned.outerHTML}</div>`);
             doc.write('</body></html>');
             doc.close();
         }

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
    const emailContent = {};
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
