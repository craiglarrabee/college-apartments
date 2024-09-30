import Layout from "../../components/layout";
import Navigation from "../../components/navigation";
import Title from "../../components/title";
import Footer from "../../components/footer";
import React, {useState} from "react";
import {GetNavLinks} from "../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";
import {Alert, Button, Col, Form, Row, Tab, Tabs} from "react-bootstrap";
import Image from "next/image";
import {useForm} from "react-hook-form";
import classNames from "classnames";
import {
    GetActiveSemesterApartments,
    GetActiveSemesters,
    GetActiveSemesterTenantNames
} from "../../lib/db/users/userLease";
import {BulkEmailOptions} from "../../components/bulkEmailOptions";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Send = ({site, page, links, user, semesters, tenants, apartments, ...restOfProps}) => {
    const from = `${site}@uca.snowcollegeapartments.com`;
    const {register, formState: {isDirty, errors, isValid}, handleSubmit} = useForm({mode: "all"});
    const [message, setMessage] = useState();
    const [semester, setSemester] = useState(semesters[0].semester);

    const sendBulkEmail = async (data, event) => {
        event.preventDefault();

        try {
            const payload = {
                from: from,
                subject: data.subject,
                recipients: data.recipients,
                ids: "Tenants" === data.recipients ? data.selected_recipients : data.selected_apartments,
                site: site,
                body: data.body,
                semester: semester
            };

            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }

            const resp = await fetch(`/api/util/bulk-email?site=${site}`, options);
            switch (resp.status) {
                case 400:
                    setMessage({value: "An error occurred submitting the email.", type: "error"});
                    break;
                case 200:
                    let json = await resp.json();
                    setMessage({value: "Message submitted.", type: "info"});
                    setTimeout(() => location = `/email/status?site=${site}`, 1000);
                    break;
            }
        } catch (e) {
            setMessage({value: "An error occurred submitting the email.", type: "error"});
            console.error(new Date().toISOString() + " - " +e);
        }
    }

    return (
        <Layout site={site} user={user} wide={true}>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    {message &&
                        <Alert variant={message.type === "error" ? "danger" : "primary"}>{message.value}</Alert>}
                    <Form onSubmit={handleSubmit(sendBulkEmail)} method="post">
                        <Row>
                            <Col>
                                <Image src="/images/contactus.jpg" alt="Send" width={250} height={177}/>
                            </Col>
                            <Col xs={9}>
                                <Form.Group className="mb-3" controlId="subject">
                                    <Form.Label visuallyHidden={true}>Subject</Form.Label>
                                    <Form.Control
                                        className={errors && errors.subject && classNames("border-danger")} {...register("subject", {
                                        required: {value: true, message: "Subject is required."}
                                    })} as="input" type="text" placeholder="Enter subject here."/>
                                    {errors && errors.subject && <Form.Text hidden={false}
                                                                            className={classNames("text-danger")}>{errors && errors.subject.message}</Form.Text>}
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="body">
                                    <Form.Label visuallyHidden={true}>Send Body</Form.Label>
                                    <Form.Control
                                        className={errors && errors.body && classNames("border-danger")} {...register("body", {
                                        required: {value: true, message: "Send body is required."}
                                    })} as="textarea" type="text" rows={5} placeholder="Enter email text here."/>
                                    {errors && errors.body && <Form.Text hidden={false}
                                                                         className={classNames("text-danger")}>{errors && errors.body.message}</Form.Text>}
                                </Form.Group>
                            </Col>
                        </Row>
                        <div>Now choose who should receive the email, then click <span style={{fontWeight: "bold"}}>Send Send</span> at
                            the bottom of the page:
                        </div>
                        <Tabs>
                            {semesters.map((item) =>
                                <Tab title={item.semester} eventKey={item.semester.replace(" ", "_")}
                                     key={item.semester.replace(" ", "_")}
                                     onClick={() => setSemester(item.semester)}>
                                    <BulkEmailOptions register={register} errors={errors}
                                                      tenants={tenants.filter(tenant => tenant.semester === item.semester)}
                                                      apartments={apartments.filter(apartment => apartment.semester === item.semester)}
                                    />
                                </Tab>
                            )}
                        </Tabs>

                        <div style={{width: "100%"}}
                             className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                            <Button variant="primary" type="submit" disabled={!isDirty || !isValid}>Send</Button>
                        </div>
                    </Form>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
        await context.req.session.save();
	const user = context.req.session.user;
        const page = "email/send";
        const site = context.query.site || SITE;
        if (!user.manage.includes(site)) {
            res.status(403).send();
            return;
        }
        const [nav, tenants, semesters, apartments] = await Promise.all([
            GetNavLinks(user, site),
            GetActiveSemesterTenantNames(site),
            GetActiveSemesters(site),
            GetActiveSemesterApartments(site)
        ]);

        return {
            props: {
                site: site,
                page: page,
                links: nav,
                user: {...user},
                tenants: [...tenants],
                semesters: [...semesters],
                apartments: [...apartments]
            }
        };
    }
    , ironOptions);

export default Send;
