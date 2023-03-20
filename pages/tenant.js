import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import classNames from "classnames";
import {Button, Col, Form, Row} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetTenantInfo} from "../lib/db/users/tenantInfo";
import {GetDynamicImageContent} from "../lib/db/content/dynamicImageContent";
import {useForm} from "react-hook-form";

const SITE = process.env.SITE;

const Home = ({site, navPage, links, user, tenant, isNewApplication = false}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const {register, reset, formState: {isValid, isDirty}, handleSubmit} = useForm({ defaultValues: tenant });

    let [convictedCrime, setConvictedCrime] = useState(tenant.hasOwnProperty("convicted_crime") ? tenant.convicted_crime : false);
    let [chargedCrime, setChargedCrime] = useState(tenant.hasOwnProperty("charged_crime") ? tenant.charged_crime : false);

    const handleConvicted = () => setConvictedCrime(true);
    const handleNotConvicted = () => setConvictedCrime(false);
    const handleCharged = () => setChargedCrime(true);
    const handleNotCharged = () => setChargedCrime(false);

    const onSubmit = async (data, event) => {
        event.preventDefault();

        try {
            const options = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${user.id}/tenant`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 204:
                    reset(data);
                    if (isNewApplication || tenant?.pending_application) location = "/application";
            }
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Form onSubmit={handleSubmit(onSubmit)} method="post">
                        <div className="h4">Personal Information:</div>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="first_name">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control {...register("first_name", {required: true, maxLength: 25})} type="text"
                                              placeholder="First Name"/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="middle_name">
                                <Form.Label>Middle Name</Form.Label>
                                <Form.Control {...register("middle_name", {maxLength: 25})} type="text"
                                              placeholder="Middle Name"/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="last_name">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control {...register("last_name", {required: true, maxLength: 25})} type="text"
                                              placeholder="Last Name"/>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="gender" required>
                                <Form.Label>Gender</Form.Label>
                                <Form.Select>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="date_of_birth">
                                <Form.Label>Birthdate</Form.Label>
                                <Form.Control {...register("date_of_birth", {required: true})} type="date"/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="last_4_social">
                                <Form.Label>Last 4 Social Security #</Form.Label>
                                <Form.Control {...register("last_4_social", {required: true, maxLength: 4})} type="text"
                                              placeholder="Last 4 SSAN"/>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="cell_phone">
                                <Form.Label>Cell Phone</Form.Label>
                                <Form.Control {...register("cell_phone", {required: true, maxLength: 16})} type="tel"
                                              placeholder="Cell Phone"/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="cell_phone2">
                                <Form.Label>Alternate Cell Phone</Form.Label>
                                <Form.Control {...register("cell_phone2", {maxLength: 16})} type="tel"
                                              placeholder="Alternate Cell Phone"/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="home_phone">
                                <Form.Label>Home Phone</Form.Label>
                                <Form.Control {...register("home_phone", {required: true, maxLength: 16})} type="tel"
                                              placeholder="Home Phone"/>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} xs={6} className="mb-3" controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control {...register("email", {required: true, maxLength: 255})} type="email"
                                              placeholder="Email"/>
                            </Form.Group>
                            <Form.Group as={Col} xs={6} className="mb-3" controlId="email2">
                                <Form.Label>Alternate Email</Form.Label>
                                <Form.Control {...register("email2", {maxLength: 255})} type="email"
                                              placeholder="Alternate Email"/>
                            </Form.Group>
                        </Row>
                        <div className="d-inline-flex">
                            <div>Have you ever been convicted of a crime?&nbsp;</div>
                            <Form.Check className="mb-3" onClick={handleConvicted} {...register("convicted_crime", {
                                required: true,
                                setValueAs: value => value !== null ? value.toString() : ""
                            })} type="radio" inline value="1" label="Yes"/>
                            <Form.Check className="mb-3" onClick={handleNotConvicted} {...register("convicted_crime", {
                                required: true,
                                setValueAs: value => value !== null ? value.toString() : ""
                            })} type="radio" inline value="0" label="No"/>
                        </div>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="convicted_explain"
                                        hidden={!convictedCrime}>
                                <Form.Label>Explain</Form.Label>
                                <Form.Control {...register("convicted_explain", {maxLength: 1000})} as="textarea"
                                              type="text" placeholder="Explanation" rows={3}/>
                            </Form.Group>
                        </Row>
                        <div className="d-inline-flex">
                            <div>Have you ever been charged with a crime?&nbsp;</div>
                            <Form.Check className="mb-3" onClick={handleCharged} {...register("charged_crime", {
                                required: true,
                                setValueAs: value => value !== null ? value.toString() : ""
                            })} type="radio" inline value="1" label="Yes"/>
                            <Form.Check className="mb-3" onClick={handleNotCharged} {...register("charged_crime", {
                                required: true,
                                setValueAs: value => value !== null ? value.toString() : ""
                            })} type="radio" inline value="0" label="No"/>
                        </div>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="charged_explain" hidden={!chargedCrime}>
                                <Form.Label>Explain</Form.Label>
                                <Form.Control {...register("charged_explain", {maxLength: 1000})} as="textarea"
                                              type="text" placeholder="Explanation" rows={3}
                                />
                            </Form.Group>
                        </Row>
                        <div className="h4">Address:</div>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="street">
                                <Form.Label>Street Address</Form.Label>
                                <Form.Control {...register("street", {required: true, maxLength: 100})} type="text"
                                              placeholder="Street Address"/>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} xs={6} className="mb-3" controlId="city">
                                <Form.Label>City</Form.Label>
                                <Form.Control {...register("city", {required: true, maxLength: 25})} type="text"
                                              placeholder="City"/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="state">
                                <Form.Label>State</Form.Label>
                                <Form.Control {...register("state", {required: true, maxLength: 2})} type="text"
                                              placeholder="State"/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="zip">
                                <Form.Label>Zip Code</Form.Label>
                                <Form.Control {...register("zip", {required: true, maxLength: 10})} type="text"
                                              placeholder="Zip Code"/>
                            </Form.Group>
                        </Row>
                        <div className="h4">Parent/Guardian Info:</div>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="parent_name">
                                <Form.Label>Parent Name</Form.Label>
                                <Form.Control {...register("parent_name", {required: true, maxLength: 50})} type="text"
                                              placeholder="Name"/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="parent_phone">
                                <Form.Label>Parent Phone</Form.Label>
                                <Form.Control {...register("parent_phone", {required: true, maxLength: 16})} type="text"
                                              placeholder="Phone"/>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="parent_street">
                                <Form.Label>Parent Street Address</Form.Label>
                                <Form.Control {...register("parent_street", {required: true, maxLength: 100})}
                                              type="text" placeholder="Street Address"
                                />
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} xs={6} className="mb-3" controlId="parent_city">
                                <Form.Label>Parent City</Form.Label>
                                <Form.Control {...register("parent_city", {required: true, maxLength: 25})} type="text"
                                              placeholder="City"/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="parent_state">
                                <Form.Label>Parent State</Form.Label>
                                <Form.Control {...register("parent_state", {required: true, maxLength: 2})} type="text"
                                              placeholder="State"/>
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="parent_zip">
                                <Form.Label>Parent Zip Code</Form.Label>
                                <Form.Control {...register("parent_zip", {required: true, maxLength: 10})} type="text"
                                              placeholder="Zip Code"/>
                            </Form.Group>
                        </Row>
                        <div style={{width: "100%"}}
                             className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                            <Button variant="primary" type="submit"
                                    disabled={!isNewApplication && ( !isDirty || !isValid)}>{isNewApplication || tenant.pending_application ? "Next" : "Save"}</Button>
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
    if (!user.isLoggedIn) return {notFound: true};
    const tenant = await GetTenantInfo(user.id);
    const newApplication = context.query && context.query.hasOwnProperty("newApplication");
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: "/application"});
        context.res.end();
        return {};
    }
    const site = SITE;
    const content = {};
    const editing = !!user && !!user.editSite;
    const [nav] = await Promise.all([GetNavLinks(user, site)]);
    if (tenant) tenant.date_of_birth = tenant.date_of_birth.toISOString().split("T")[0];
    return {
        props: {
            site: site,
            navPage: newApplication || tenant?.pending_application ? "user" : "",
            ...content,
            links: nav,
            user: {...user},
            tenant: {...tenant},
            isNewApplication: newApplication
        }
    };
}, ironOptions);

export default Home;
