import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {Button, Col, Form, Row, Tab, Tabs} from "react-bootstrap";
import Image from "next/image";
import {useForm} from "react-hook-form";
import classNames from "classnames";
import {GetActiveSemesterApartments, GetActiveSemesters, GetActiveSemesterTenants} from "../lib/db/users/userLease";
import {BulkEmailOptions} from "../components/bulkEmailOptions";
import async from "async";

const SITE = process.env.SITE;

const Email = ({site, page, links, user, company, semesters, tenants, apartments}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const from = `${site}@uca.snowcollegeapartments.com`;
    const [semester, setSemester] = useState();
    const [year, setYear] = useState();
    const {register, formState: {isDirty, errors, isValid}, handleSubmit} = useForm({mode: "all"});

    const handleSemester = (semester) => {
        let arr = semester.split(" ");
        setSemester(arr[0]);
        setYear(arr[1]);
    }
    const sendBulkEmail = async (data, event) => {
        event.preventDefault();

        try {
            const payload = {
                from: from,
                subject: `Message from ${company}`,
                recipients: data.recipients,
                ids: "Tenants" === data.recipients ? data.selected_recipients : data.selected_apartments,
                site: site,
                semester: semester,
                year: year,
                body: data.body
            };

            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }

            const resp = await fetch(`/api/util/bulk-email`, options);
            switch (resp.status) {
                case 400:
                    alert("An error occurred sending the emails.");
                    break;
                case 200:
                    let json = await resp.json();
                    alert(`${json.count} Emails sent.`);
                    break;
            }
        } catch (e) {
            alert(`An error occurred sending the email. ${e.message}`);
            console.log(e);
        }
    }

    return (
        <Layout user={user}>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <Form onSubmit={handleSubmit(sendBulkEmail)} method="post">
                    <Row>
                        <Col>
                            <Image src="/images/contactus.jpg" alt="Email" width={250} height={177}/>
                        </Col>
                        <Form.Group as={Col} xs={9} className="mb-3" controlId="body">
                            <Form.Label visuallyHidden={true}>Email Body</Form.Label>
                            <Form.Control
                                className={errors && errors.body && classNames("border-danger")} {...register("body", {
                                required: {value: true, message: "Email body is required."}
                            })} as="textarea" type="text" rows={7} placeholder="Enter email text here."/>
                            {errors && errors.body && <Form.Text hidden={false}
                                                                 className={classNames("text-danger")}>{errors && errors.body.message}</Form.Text>}
                        </Form.Group>
                    </Row>
                    <div>Now choose who should receive the email, then click <span style={{fontWeight: "bold"}}>Send Email</span> at
                        the bottom of the page:
                    </div>
                    <Tabs>
                        {semesters.map((item) =>
                            <Tab title={item.semester} eventKey={item.semester.replace(" ", "_")}
                                 onClick={() => handleSemester(item.semester)}>
                                <BulkEmailOptions register={register} errors={errors}
                                                  tenants={tenants.filter(tenant => tenant.semester === item.semester)}
                                                  apartments={apartments.filter(apartment => apartment.semester === item.semester)}
                                />
                            </Tab>
                        )}
                    </Tabs>

                    <div style={{width: "100%"}}
                         className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                        <Button variant="primary" type="submit" disabled={!isDirty || !isValid}>Send Email</Button>
                    </div>
                </Form>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
        const user = context.req.session.user;
        const page = "email";
        const site = context.query.site || SITE;
        const company = site === "suu" ? "Stadium Way/College Way Apartments" : "Park Place Apartments";

        if (!user.admin.includes(site)) return {notFound: true};
        const [nav, tenants, semesters, apartments] = await Promise.all([
            GetNavLinks(user, site),
            GetActiveSemesterTenants(site),
            GetActiveSemesters(site),
            GetActiveSemesterApartments(site)
        ]);

        return {
            props: {
                company: company,
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

export default Email;
