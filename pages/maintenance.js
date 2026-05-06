import Layout from "../components/layout";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("../components/navigation"), { ssr: false });
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import classNames from "classnames";
import {Alert, Button, Col, Form, Row, Dropdown} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {GetTenant} from "../lib/db/users/tenant";
import {GetMostRecentTenantApartment} from "../lib/db/users/userLease";
import {ExecuteQuery} from "../lib/db/pool";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {isBot} from "../lib/bots";
import {getEstimatedSemesters} from "../lib/util";
import Link from "next/link";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;

const Maintenance = ({site, isABot, links, user, tenant, apartment_number}) => {
    const [room, setRoom] = useState("");
    const [request, setRequest] = useState("");
    const [apartment, setApartment] = useState(apartment_number || "");
    const estimatedSemesters = getEstimatedSemesters();
    const [semester, setSemester] = useState(estimatedSemesters[0]);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);

    const {
        register,
        formState: {errors, isDirty, isValid},
        handleSubmit,
        resetField,
        setValue
    } = useForm({mode: "all"});

    // Set initial value for semester in react-hook-form
    React.useEffect(() => {
        setValue("semester", semester, { shouldValidate: true });
    }, [semester, setValue]);

    const onSubmit = async (data, e) => {
        e?.preventDefault();
        setError(null);
        setInfo(null);
        const selectedSemester = data?.semester || semester;
        try {
            const resp = await fetch(`/api/maintenance?site=${site}` , {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    tenant_first_name: tenant?.first_name,
                    tenant_last_name: tenant?.last_name,
                    username: tenant?.username,
                    email: tenant?.email,
                    apartment_number: apartment_number || data?.apartment_number?.trim() || "",
                    room: data?.room?.trim(),
                    request: data?.request?.trim(),
                    semester: selectedSemester
                })
            });
            if (resp.status === 204 || resp.status === 200) {
                setInfo("Maintenance request sent.");
                setRoom("");
                setRequest("");
                const estimatedSemesters = getEstimatedSemesters();
                setSemester(estimatedSemesters[0]);
                if (!apartment_number) { setApartment(""); }
                try { 
                    resetField("room"); 
                    resetField("request"); 
                    resetField("semester");
                    if (!apartment_number) resetField("apartment_number"); 
                } catch {}
            } else {
                let errText = "There was an error sending your request.";
                try {
                    const data = await resp.json();
                    errText = data?.description || errText;
                } catch {}
                setError(errText);
            }
        } catch (e) {
            console.error(`${new Date().toISOString()} -`, e);
            setError("There was an error sending your request. Please try again.");
        }
    };

    return (
        <Layout site={site} user={user} wide={false}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page="maintenance"/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")}
                         style={{marginTop: "30px", display: "grid"}}>
                        {info && <Alert dismissible={true} variant="primary" onClose={() => setInfo(null)}>{info}</Alert>}
                        {error && (
                            <Alert dismissible={true} variant="danger" onClose={() => setError(null)}>
                                {error} Please verify your data and try again or <Link href="/contact">Contact us</Link>.
                            </Alert>
                        )}
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Row>
                                <Form.Group as={Col} className="mb-3" controlId="identity" style={{display: "none"}}>
                                    {/* Hidden identity fields */}
                                    <Form.Control type="hidden" value={tenant?.first_name || ""} {...register("tenant_first_name")} />
                                    <Form.Control type="hidden" value={tenant?.last_name || ""} {...register("tenant_last_name")} />
                                    <Form.Control type="hidden" value={tenant?.username || ""} {...register("username")} />
                                    <Form.Control type="hidden" value={tenant?.email || ""} {...register("email")} />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-3" controlId="apartment">
                                    <Form.Label className="required">Apartment Number</Form.Label>
                                    {apartment_number ? (
                                        <Form.Control type="text" value={apartment_number} readOnly/>
                                    ) : (
                                        <>
                                            <Form.Control
                                                className={errors && errors.apartment_number && classNames("border-danger")}
                                                {...register("apartment_number", {
                                                    required: {value: true, message: "Apartment Number is required."},
                                                    maxLength: 20
                                                })}
                                                placeholder=""
                                                type="text"
                                                value={apartment}
                                                onChange={(e) => setApartment(e.target.value)}
                                            />
                                            {errors && errors.apartment_number && (
                                                <Form.Text className={classNames("text-danger")}>
                                                    {errors.apartment_number.message}
                                                </Form.Text>
                                            )}
                                        </>
                                    )}
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} className="mb-3" controlId="semester">
                                    <Form.Label className="required">Semester</Form.Label>
                                    <Dropdown onSelect={(val) => {
                                        setSemester(val);
                                        setValue("semester", val, { shouldValidate: true, shouldDirty: true });
                                    }}>
                                        <Dropdown.Toggle variant="outline-secondary" id="dropdown-semester" className="w-100 d-flex justify-content-between align-items-center">
                                            {semester}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="w-100">
                                            {estimatedSemesters?.map((s, idx) => (
                                                <Dropdown.Item key={idx} eventKey={s}>{s}</Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <input type="hidden" {...register("semester", {
                                        required: {value: true, message: "Semester is required."}
                                    })} value={semester} />
                                    {errors && errors.semester && (
                                        <Form.Text className={classNames("text-danger")}>
                                            {errors.semester.message}
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} className="mb-3" controlId="room">
                                    <Form.Label className="required">Room</Form.Label>
                                    <Form.Control
                                        className={errors && errors.room && classNames("border-danger")}
                                        {...register("room", {
                                            required: {value: true, message: "Room is required."},
                                            maxLength: 100
                                        })}
                                        placeholder="e.g. Kitchen, Bathroom, Bedroom"
                                        type="text"
                                        value={room}
                                        onChange={(e) => setRoom(e.target.value)}
                                    />
                                    {errors && errors.room && (
                                        <Form.Text className={classNames("text-danger")}>
                                            {errors.room.message}
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Row>
                            <Row>
                                <Form.Group as={Col} className="mb-3" controlId="request">
                                    <Form.Label className="required">Maintenance Request</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={6}
                                        placeholder="Describe the maintenance issue..."
                                        className={errors && errors.request && classNames("border-danger")}
                                        {...register("request", {
                                            required: {value: true, message: "Maintenance Request is required."},
                                            maxLength: 5000
                                        })}
                                        value={request}
                                        onChange={(e) => setRequest(e.target.value)}
                                    />
                                    {errors && errors.request && (
                                        <Form.Text className={classNames("text-danger")}>
                                            {errors.request.message}
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Row>
                            <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                                <Button variant="primary" disabled={!isValid} type="submit" style={{margin: "5px"}}>Submit</Button>
                            </div>
                        </Form>
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
    const user = context.req.session.user;
    if (!user?.isLoggedIn) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }

    const [nav, tenantFull, mostRecent] = await Promise.all([
        GetNavLinks(user, site),
        GetTenant(site, user.id),
        GetMostRecentTenantApartment(site, user.id)
    ]);

    const apartment_number = mostRecent?.apartment_number || "";

    // Build a minimal tenant object from most recent lease info, fallback to full tenant if needed
    const tenant = {
        first_name: mostRecent?.first_name ?? tenantFull?.first_name ?? "",
        last_name: mostRecent?.last_name ?? tenantFull?.last_name ?? "",
        username: mostRecent?.username ?? tenantFull?.username ?? "",
        email: mostRecent?.email ?? tenantFull?.email ?? ""
    };

    return {
        props: {
            site,
            links: nav,
            isABot: isBot(context),
            user: {...user},
            tenant,
            apartment_number
        }
    };
}, ironOptions);

export default Maintenance;
