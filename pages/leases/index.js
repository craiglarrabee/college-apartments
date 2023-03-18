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

const SITE = process.env.SITE;

const Leases = ({site, links, page, user, leases}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const {register, formState: {isValid, isDirty}, handleSubmit} = useForm();

    const createLease = async (data, event) => {
        event.preventDefault();
        data.site = site;

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/leases`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 200:
                    let json = await resp.json();
                    location = `/leases/${json.id}`;
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")}>
                    <Form onSubmit={handleSubmit(createLease)} method="post">
                        <div className="h4">LeaseId Information:</div>
                        <Row>
                            <Form.Group as={Col} xs={3} className="mb-3" controlId="leasename">
                                <Form.Label visuallyHidden={true}>LeaseId Name</Form.Label>
                                <Form.Control {...register("leasename", {required: true, minLength: 5, maxLength: 15})} type="text"
                                              placeholder="LeaseId Name"/>
                            </Form.Group>
                            <Form.Group as={Col} xs={9} className="mb-3" controlId="description">
                                <Form.Label visuallyHidden={true}>LeaseId Description</Form.Label>
                                <Form.Control {...register("description", {required: true, minLength: 5, maxLength: 50})} type="text"
                                              placeholder="LeaseId Description"/>
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-3" controlId="template">
                            <Form.Label visuallyHidden={true}>LeaseId Template</Form.Label>
                            <Form.Select {...register("template", {required: true})} type="select">
                                <option>Choose LeaseId to copy</option>
                                {leases.map((def, index) => (<option key={index} value={def.page}>{def.label}</option>))}
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
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    const user = context.req.session.user;
    const site = "suu";
    const editing = !!user && !!user.editSite;
    if (!editing) return {notFound: true};
    const [nav, leases] = await Promise.all([GetNavLinks(site, editing), GetLeases(site)]);
    return {props: {site: site, user: {...user}, links: nav, leases: leases}};
}, ironOptions);

export default Leases;
