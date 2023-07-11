import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetTenant} from "../lib/db/users/tenant";
import {Button, Col, Form, Row} from "react-bootstrap";
import Image from "next/image";
import {useForm} from "react-hook-form";
import classNames from "classnames";

const SITE = process.env.SITE;

const Home = ({site, page, links, user, company}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const from = `${site}@uca.snowcollegeapartments.com`;

    const {register, formState: {isDirty, errors}, handleSubmit} = useForm();

    const sendEmail = async (data, event) => {
        event.preventDefault();

        try {
            const payload = {
                from: from,
                subject: `Message from ${company}`,
                address: user.email,
                body: data.body
            };

            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }

            const resp = await fetch(`/api/util/email`, options);
            switch (resp.status) {
                case 400:
                    alert("An error occurred sending the email.");
                    break;
                case 204:
                    alert("Email sent.");
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
                <Form onSubmit={handleSubmit(sendEmail)} method="post">
                    <Row>
                        <Col>
                            <Image src="/images/contactus.jpg" alt="Email" width={250} height={177}/>
                        </Col>
                        <Form.Group as={Col} xs={9} className="mb-3" controlId="body">
                            <Form.Label visuallyHidden={true}>Email Body</Form.Label>
                            <Form.Control
                                className={errors && errors.email && classNames("border-danger")} {...register("body", {
                                required: {value: true, message: "Email body is required."},
                                maxLength: 512
                            })} as="textarea" type="text" rows={7} placeholder="Enter email text here."/>
                            {errors && errors.email && <Form.Text className={classNames("text-danger")}>{errors && errors.email.message}</Form.Text>}
                        </Form.Group>
                    </Row>
                    <div>Now choose who should receive the email, then click <span style={{fontWeight: "bold"}}>Send Email</span> at the bottom of the page:</div>
                    <Form.Check className="mb-3" {...register("recipients", {
                        required: true,
                        setValueAs: value => value !== null ? value.toString() : ""
                    })} type="radio" inline value="1" label="Yes"/>
                    <Form.Check className="mb-3" {...register("recipients", {
                        required: true,
                        setValueAs: value => value !== null ? value.toString() : ""
                    })} type="radio" inline value="0" label="No"/>

                    <div style={{width: "100%"}}
                         className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                        <Button variant="primary" type="submit" disabled={!isDirty}>Send Email</Button>
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
        const [nav, tenant] = await Promise.all([
            GetNavLinks(user, site),
            GetTenant(user.id)
        ]);
        if (tenant) tenant.date_of_birth = tenant.date_of_birth.toISOString().split("T")[0];
        return {
            props: {
                company: company,
                site: site,
                page: page,
                links: nav,
                user: {...user},
                tenant: {...tenant}
            }
        };
    }
    , ironOptions);

export default Home;
