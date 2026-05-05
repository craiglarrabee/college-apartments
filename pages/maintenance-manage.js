import Layout from "../components/layout";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("../components/navigation"), { ssr: false });
import {isBot} from "../lib/bots";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import classNames from "classnames";
import {Alert, Button, Form, Table, Tabs, Tab, Dropdown} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetClosedMaintenanceRequests, GetOpenMaintenanceRequests, GetAllMaintenanceSemesters} from "../lib/db/users/maintenance";
import {GetActiveSemesters} from "../lib/db/users/userLease";
import {useRouter} from "next/router";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;

const MaintenanceManage = ({site, isABot, links, user, openRequests, closedRequests, activeSemesters, selectedSemester}) => {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [openRows, setOpenRows] = useState(openRequests || []);
    const [closedRows, setClosedRows] = useState(closedRequests || []);
    const [commentsMap, setCommentsMap] = useState({});
    const [copiedId, setCopiedId] = useState(null);

    // Update local state when props change (due to router navigation)
    React.useEffect(() => {
        setOpenRows(openRequests || []);
        setClosedRows(closedRequests || []);
    }, [openRequests, closedRequests]);

    const handleSemesterSelect = (semester) => {
        const query = {...router.query};
        if (semester) {
            query.semester = semester;
        } else {
            delete query.semester;
        }
        router.push({pathname: router.pathname, query});
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const closeRequest = async (id) => {
        setError(null);
        try {
            const resp = await fetch(`/api/maintenance/${id}?site=${site}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({comments: commentsMap[id] || ""})
            });
            if (resp.status === 204 || resp.status === 200) {
                setOpenRows(openRows.filter(r => r.id !== id));
            } else {
                setError("There was an error closing this request. Please try again.");
            }
        } catch (e) {
            console.error(`${new Date().toISOString()} -`, e);
            setError("There was an error closing this request. Please try again.");
        }
    };

    return (
        <Layout site={site} user={user} wide={true}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page="maintenance"/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    {error && <Alert dismissible onClose={() => setError(null)} variant="danger">{error}</Alert>}
                    <div className={classNames("main-content")}
                         style={{marginTop: "10px"}}>
                        <div className="mb-3 d-flex align-items-center" style={{gap: "10px"}}>
                            <Form.Label className="mb-0"><strong>Semester</strong></Form.Label>
                            <Dropdown onSelect={handleSemesterSelect}>
                                <Dropdown.Toggle variant="outline-secondary" id="dropdown-semester">
                                    {selectedSemester || "All Semesters"}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey="">All Semesters</Dropdown.Item>
                                    {activeSemesters?.map((s, idx) => (
                                        <Dropdown.Item key={idx} eventKey={s.semester}>{s.semester}</Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <Tabs defaultActiveKey="open" id="maintenance-manage-tabs" className="mb-3">
                            <Tab eventKey="open" title={`Open Requests (${openRows.length})`}>
                                <Table>
                                    <thead>
                                    <tr>
                                        <th>Created Date</th>
                                        <th>Semester</th>
                                        <th>Tenant</th>
                                        <th>Email</th>
                                        <th>Apartment</th>
                                        <th>Room</th>
                                        <th>Request</th>
                                        <th>Comment</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {openRows.map(row => (
                                        <tr key={row.id}>
                                            <td>{row.created_datetime}</td>
                                            <td>{row.semester}</td>
                                            <td><a href={`/tenants/${row.user_id}?site=${site}`}>{row.tenant_name}</a></td>
                                            <td>{row.email}</td>
                                            <td>{row.apartment_number}</td>
                                            <td>{row.room}</td>
                                            <td style={{whiteSpace: 'pre-wrap'}}>
                                                {row.request}
                                                <div className="mt-1">
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => handleCopy(row.request, row.id)}
                                                    >
                                                        {copiedId === row.id ? "Copied!" : "Copy"}
                                                    </Button>
                                                </div>
                                            </td>
                                            <td>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    style={{resize: "both"}}
                                                    value={commentsMap[row.id] || ''}
                                                    onChange={(e) => setCommentsMap({...commentsMap, [row.id]: e.target.value})}
                                                    placeholder="Add closing comment"
                                                />
                                            </td>
                                            <td>
                                                <Button onClick={() => closeRequest(row.id)}>Close</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {openRows.length === 0 && (
                                        <tr>
                                            <td colSpan={8} style={{textAlign: 'center'}}>No open maintenance requests.</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </Table>
                            </Tab>
                            <Tab eventKey="closed" title={`Closed Requests (${closedRows.length})`}>
                                <Table>
                                    <thead>
                                    <tr>
                                        <th>Tenant</th>
                                        <th>Email</th>
                                        <th>Apartment</th>
                                        <th>Room</th>
                                        <th>Semester</th>
                                        <th>Request</th>
                                        <th>Created Date</th>
                                        <th>Closed Date</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {closedRows.map(row => (
                                        <tr key={row.id}>
                                            <td><a href={`/tenants/${row.user_id}?site=${site}`}>{row.tenant_name}</a></td>
                                            <td>{row.email}</td>
                                            <td>{row.apartment_number}</td>
                                            <td>{row.room}</td>
                                            <td>{row.semester}</td>
                                            <td style={{whiteSpace: 'pre-wrap'}}>
                                                {row.request}
                                                <div className="mt-1">
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => handleCopy(row.request, row.id)}
                                                    >
                                                        {copiedId === row.id ? "Copied!" : "Copy"}
                                                    </Button>
                                                </div>
                                            </td>
                                            <td>{row.created_datetime}</td>
                                            <td>{row.closed_datetime}</td>
                                        </tr>
                                    ))}
                                    {closedRows.length === 0 && (
                                        <tr>
                                            <td colSpan={7} style={{textAlign: 'center'}}>No closed maintenance requests.</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </Table>
                            </Tab>
                        </Tabs>
                    </div>
                    <Footer bg={bg}/>
                </main>
            </div>
        </Layout>
    );
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    await context.req.session.save();
    const site = context.query.site || SITE;
    const semester = context.query.semester || null;
    const user = context.req.session.user;
    if (!user?.isLoggedIn || !user?.admin?.includes(site) || !user?.manageApartment) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }

    const allSemesters = await GetAllMaintenanceSemesters(site);
    const selectedSemester = context.query.semester || allSemesters[0]?.semester || "";

    const [nav, open, closed] = await Promise.all([
        GetNavLinks(user, site),
        GetOpenMaintenanceRequests(site, selectedSemester),
        GetClosedMaintenanceRequests(site, selectedSemester)
    ]);

    return {
        props: {
            site,
            links: nav,
            isABot: isBot(context),
            user: {...user},
            openRequests: open,
            closedRequests: closed,
            activeSemesters: allSemesters,
            selectedSemester: selectedSemester
        }
    };
}, ironOptions);

export default MaintenanceManage;
