import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import classNames from "classnames";
import {Alert, Button, Col, Form, Row} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetTenantInfo} from "../lib/db/users/tenantInfo";
import {useForm} from "react-hook-form";

const SITE = process.env.SITE;

const Home = ({site, navPage, links, user, tenant, isNewApplication = false}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const {register, reset, formState: {isValid, isDirty, errors}, handleSubmit} = useForm({defaultValues: tenant});

    let [convictedCrime, setConvictedCrime] = useState(tenant.hasOwnProperty("convicted_crime") ? tenant.convicted_crime : false);
    let [chargedCrime, setChargedCrime] = useState(tenant.hasOwnProperty("charged_crime") ? tenant.charged_crime : false);

    const handleConvicted = () => setConvictedCrime(true);
    const handleNotConvicted = () => setConvictedCrime(false);
    const handleCharged = () => setChargedCrime(true);
    const handleNotCharged = () => setChargedCrime(false);

    const isValidBirthdate = (date) => {
      const sixteenYearsAgo = new Date();
      sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);
      return new Date(date) <= sixteenYearsAgo;
    };

    const onSubmit = async (data, event) => {
        event.preventDefault();

        try {
            const options = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data),
            }

            const resp = await fetch(`/api/users/${user.id}/tenant`, options);
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
                                <Form.Control className={errors.first_name && classNames("border-danger")} {...register("first_name", {
                                    required: {value: true, message: "First Name is required"},
                                    maxLength: 25
                                })} type="text" placeholder="First Name"/>
                                {errors.first_name && <Form.Text className={classNames("text-danger")}>{errors.first_name.message}</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="middle_name">
                                <Form.Label>Middle Name</Form.Label>
                                <Form.Control
                                    className={errors.middle_name && classNames("border-danger")} {...register("middle_name", {maxLength: 25})}
                                    type="text" placeholder="Middle Name"/>
                                {errors.middle_name && <Form.Text className={classNames("text-danger")}>{errors.middle_name.message}</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="last_name">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control className={errors.last_name && classNames("border-danger")} {...register("last_name", {
                                    required: {
                                        value: true,
                                        message: "Last Name is required."
                                    }
                                })} type="text" placeholder="Last Name"/>
                                {errors.last_name && <Form.Text className={classNames("text-danger")}>{errors.last_name.message}</Form.Text>}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="gender" required>
                                <Form.Label>Gender</Form.Label>
                                <Form.Select {...register("gender")}>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </Form.Select>
                                {errors.gender && <Form.Text className={classNames("text-danger")}>{errors.gender.message}</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="date_of_birth">
                                <Form.Label>Birthdate</Form.Label>
                                <Form.Control className={errors.date_of_birth && classNames("border-danger")} {...register("date_of_birth", {
                                    required: {value: true, message: "Birthdate is required."},
                                    validate: isValidBirthdate
                                })} type="date"/>
                                {errors.date_of_birth && <Form.Text className={classNames("text-danger")}>{errors.date_of_birth.message}</Form.Text>}
                                {errors.date_of_birth && errors.date_of_birth.type === "validate" && <Form.Text className={classNames("text-danger")}>Please enter a valid birthdate.</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="last_4_social">
                                <Form.Label>Last 4 Social Security #</Form.Label>
                                <Form.Control className={errors.last_4_social && classNames("border-danger")} {...register("last_4_social", {
                                    required: {
                                        value: true,
                                        message: "Last 4 Social Security # is required."
                                    }
                                })} type="text"
                                              placeholder="Last 4 SSAN"/>
                                {errors.last_4_social && <Form.Text className={classNames("text-danger")}>{errors.last_4_social.message}</Form.Text>}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="cell_phone">
                                <Form.Label>Cell Phone</Form.Label>
                                <Form.Control className={errors.cell_phone && classNames("border-danger")} {...register("cell_phone", {
                                    required: {
                                        value: true,
                                        message: "Cell Phone is required."
                                    }
                                })} type="tel"
                                              placeholder="Cell Phone"/>
                                {errors.cell_phone && <Form.Text className={classNames("text-danger")}>{errors.cell_phone.message}</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="cell_phone2">
                                <Form.Label>Alternate Cell Phone</Form.Label>
                                <Form.Control className={errors.cell_phone2 && classNames("border-danger")} {...register("cell_phone2")} type="tel"
                                              placeholder="Alternate Cell Phone"/>
                                {errors.cell_phone2 && <Form.Text className={classNames("text-danger")}>{errors.cell_phone2.message}</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="home_phone">
                                <Form.Label>Home Phone</Form.Label>
                                <Form.Control className={errors.home_phone && classNames("border-danger")} {...register("home_phone", {
                                    required: {
                                        value: true,
                                        message: "Home Phone is required."
                                    }
                                })} type="tel"
                                              placeholder="Home Phone"/>
                                {errors.home_phone && <Form.Text className={classNames("text-danger")}>{errors.home_phone.message}</Form.Text>}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} xs={6} className="mb-3" controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control className={errors.email && classNames("border-danger")} {...register("email", {
                                    required: {value: true, message: "Email is required."},
                                    maxLength: 255,
                                    pattern: {
                                        value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                        message: "Please enter a valid email address"
                                    }})} type="email" placeholder="Email"
                                />
                                {errors.email && <Form.Text className={classNames("text-danger")}>{errors.email.message}</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} xs={6} className="mb-3" controlId="email2">
                                <Form.Label>Alternate Email</Form.Label>
                                <Form.Control className={errors.email2 && classNames("border-danger")} {...register("email2", {
                                    maxLength: 255,
                                    pattern: {
                                        value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                        message: "Please enter a valid email address"
                                    }})} type="email" placeholder="Alternate Email"
                                />
                                {errors.email2 && <Form.Text className={classNames("text-danger")}>{errors.email2.message}</Form.Text>}
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
                            <Form.Group as={Col} className="mb-3" controlId="convicted_explain" hidden={!convictedCrime}>
                                <Form.Label>Explain</Form.Label>
                                <Form.Control
                                    className={errors.convicted_explain && classNames("border-danger")} {...register("convicted_explain",
                                    {required: {value: convictedCrime, message: "Please enter an explanation"},
                                        maxLength: 1000
                                    })} as="textarea" type="text" placeholder="Explanation" rows={3}/>
                                {errors.convicted_explain && <Form.Text className={classNames("text-danger")}>{errors.convicted_explain.message}</Form.Text>}
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
                                <Form.Control className={errors.charged_explain && classNames("border-danger")} {...register("charged_explain", {
                                    required: {
                                        value: chargedCrime,
                                        message: "Please enter an explanation."
                                    }
                                })} as="textarea" type="text" placeholder="Explanation" rows={3}
                                />
                                {errors.charged_explain && <Form.Text className={classNames("text-danger")}>{errors.charged_explain.message}</Form.Text>}
                            </Form.Group>
                        </Row>
                        <div className="h4">Address:</div>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="street">
                                <Form.Label>Street Address</Form.Label>
                                <Form.Control className={errors.street && classNames("border-danger")} {...register("street", {
                                    required: {
                                        value: true,
                                        message: "Street Address is required."
                                    }
                                })} type="text" placeholder="Street Address"/>
                                {errors.street && <Form.Text className={classNames("text-danger")}>{errors.street.message}</Form.Text>}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} xs={6} className="mb-3" controlId="city">
                                <Form.Label>City</Form.Label>
                                <Form.Control className={errors.city && classNames("border-danger")} {...register("city", {
                                    required: {
                                        value: true,
                                        message: "City is required."
                                    }
                                })} type="text" placeholder="City"/>
                                {errors.city && <Form.Text className={classNames("text-danger")}>{errors.city.message}</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="state">
                                <Form.Label>State</Form.Label>
                                <Form.Control className={errors.state && classNames("border-danger")} {...register("state", {
                                    required: {
                                        value: true,
                                        message: "State is required."
                                    }
                                })} type="text" placeholder="State"/>
                                {errors.state && <Form.Text className={classNames("text-danger")}>{errors.state.message}</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="zip">
                                <Form.Label>Zip Code</Form.Label>
                                <Form.Control className={errors.zip && classNames("border-danger")} {...register("zip", {
                                    required: {
                                        value: true,
                                        message: "Zip Code is required."
                                    }
                                })} type="text" placeholder="Zip Code"/>
                                {errors.zip && <Form.Text className={classNames("text-danger")}>{errors.zip.message}</Form.Text>}
                            </Form.Group>
                        </Row>
                        <div className="h4">Parent/Guardian Info:</div>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="parent_name">
                                <Form.Label>Parent Name</Form.Label>
                                <Form.Control className={errors.parent_name && classNames("border-danger")} {...register("parent_name", {
                                    required: {
                                        value: true,
                                        message: "Parent Name is required."
                                    }
                                })} type="text" placeholder="Name"/>
                                {errors.parent_name && <Form.Text className={classNames("text-danger")}>{errors.parent_name.message}</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="parent_phone">
                                <Form.Label>Parent Phone</Form.Label>
                                <Form.Control className={errors.parent_phone && classNames("border-danger")} {...register("parent_phone", {
                                    required: {
                                        value: true,
                                        message: "Parent Phone is required."
                                    }
                                })} type="text" placeholder="Phone"/>
                                {errors.parent_phone && <Form.Text className={classNames("text-danger")}>{errors.parent_phone.message}</Form.Text>}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} className="mb-3" controlId="parent_street">
                                <Form.Label>Parent Street Address</Form.Label>
                                <Form.Control className={errors.parent_street && classNames("border-danger")} {...register("parent_street", {
                                    required: {
                                        value: true,
                                        message: "Parent Street Address is required."
                                    }
                                })} type="text" placeholder="Street Address"
                                />
                                {errors.parent_street && <Form.Text className={classNames("text-danger")}>{errors.parent_street.message}</Form.Text>}
                            </Form.Group>
                        </Row>
                        <Row>
                            <Form.Group as={Col} xs={6} className="mb-3" controlId="parent_city">
                                <Form.Label>Parent City</Form.Label>
                                <Form.Control className={errors.parent_city && classNames("border-danger")} {...register("parent_city", {
                                    required: {
                                        value: true,
                                        message: "Parent City is required."
                                    }
                                })} type="text" placeholder="City"/>
                                {errors.parent_city && <Form.Text className={classNames("text-danger")}>{errors.parent_city.message}</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="parent_state">
                                <Form.Label>Parent State</Form.Label>
                                <Form.Control className={errors.parent_state && classNames("border-danger")} {...register("parent_state", {
                                    required: {
                                        value: true,
                                        message: "Parent State is required."
                                    }
                                })} type="text" placeholder="State"/>
                                {errors.parent_state && <Form.Text className={classNames("text-danger")}>{errors.parent_state.message}</Form.Text>}
                            </Form.Group>
                            <Form.Group as={Col} className="mb-3" controlId="parent_zip">
                                <Form.Label>Parent Zip Code</Form.Label>
                                <Form.Control className={errors.parent_zip && classNames("border-danger")} {...register("parent_zip", {
                                    required: {
                                        value: true,
                                        message: "Parent Zip Code is required."
                                    }
                                })} type="text" placeholder="Zip Code"/>
                                {errors.parent_zip && <Form.Text className={classNames("text-danger")}>{errors.parent_zip.message}</Form.Text>}
                            </Form.Group>
                        </Row>
                        <div style={{width: "100%"}}
                             className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                            <Button variant="primary" type="submit"
                                    disabled={!isNewApplication && (!isDirty || !isValid)}>{isNewApplication || tenant.pending_application ? "Next" : "Save"}</Button>
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
