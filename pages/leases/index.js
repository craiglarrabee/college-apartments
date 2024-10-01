import Layout from "../../components/layout";
import Navigation from "../../components/navigation";
import Title from "../../components/title";
import Footer from "../../components/footer";
import React from "react";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";
import {GetNavLinks} from "../../lib/db/content/navLinks";
import {Button, Col, Form, Row} from "react-bootstrap";
import {useForm} from "react-hook-form";
import classNames from "classnames";
import {GetLeases} from "../../lib/db/users/lease";
import {isBot} from "../../lib/bots";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Leases = ({site, isABot,  links, page, user, leases, ...restOfProps}) => {
    const {register, formState: {isValid, isDirty, errors}, handleSubmit} = useForm();

    const createLease = async (data, event) => {
        event.preventDefault();
        data.site = site;

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/leases?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 200:
                    let json = await resp.json();
                    location = `/leases/${json.id}?site=${site}`;
                    break;
            }
        } catch (e) {
            console.error(new Date().toISOString() + " - " +e);
        }
    }

    return (
        <Layout site={site} user={user}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")}>
                        <Form onSubmit={handleSubmit(createLease)} method="post">
                            <div className="h4">Lease Definition Information:</div>
                            <Row>
                                <Form.Group as={Col} xs={3} className="mb-3" controlId="leasename">
                                    <Form.Label visuallyHidden={true}>Lease Definition Name</Form.Label>
                                    <Form.Control {...register("leasename", {
                                        required: {
                                            value: true,
                                            message: "Required"
                                        },
                                        minLength: {value: 5, message: "Too short"},
                                        maxLength: {value: 15, message: "Too long"}
                                    })} type="text"
                                                  placeholder="LeaseId Name"/>
                                    {errors && errors.leasename && <Form.Text
                                        className={classNames("text-danger")}>{errors && errors.leasename.message}</Form.Text>}
                                </Form.Group>
                                <Form.Group as={Col} xs={9} className="mb-3" controlId="description">
                                    <Form.Label visuallyHidden={true}>LeaseId Description</Form.Label>
                                    <Form.Control {...register("description", {
                                        required: {
                                            value: true,
                                            message: "Required"
                                        },
                                        minLength: {value: 5, message: "Too short"},
                                        maxLength: {value: 50, message: "Too long"}
                                    })} type="text"
                                                  placeholder="LeaseId Description"/>
                                    {errors && errors.description && <Form.Text
                                        className={classNames("text-danger")}>{errors && errors.description.message}</Form.Text>}
                                </Form.Group>
                            </Row>
                            <Form.Group className="mb-3" controlId="template">
                                <Form.Label>Choose Lease Definition to copy</Form.Label>
                                <Form.Select {...register("template")} type="select">
                                    <option></option>
                                    {leases.map((def, index) => (
                                        <option key={index} value={def.page}>{def.label}</option>))}
                                </Form.Select>
                            </Form.Group>
                            <div style={{width: "100%"}}
                                 className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                                <Button variant="primary" type="submit"
                                        disabled={!isDirty || !isValid}>{"Submit"}</Button>
                            </div>
                        </Form>
                    </div>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    await context.req.session.save();
	const user = context.req.session.user;
    const site = context.query.site || SITE;
    const editing = !!user && !!user.editSite;
    if (!editing) return {notFound: true};
    const [nav, leases] = await Promise.all([GetNavLinks(user, site), GetLeases(site)]);
    return {props: {site: site, user: {...user}, links: nav, isABot: isBot(context), leases: leases}};
}, ironOptions);

export default Leases;
