import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import classNames from "classnames";
import {Alert, Button, Form} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {useForm} from "react-hook-form";
const util = require("util");
const sleep = util.promisify(setTimeout);

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Home = ({site, page, links, user, ...restOfProps}) => {

    const {register, getValues, formState: {isValid, isDirty, errors}, handleSubmit} = useForm({mode: "all"});
    const [error, setError] = useState();
    const [success, setSuccess] = useState("");
    const [pwd, setPwd] = useState("");

    const onSubmit = async (data, event) => {
        event.preventDefault();

        try {
            data.site = site;
            data.username = user.username;

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }

            const resp = await fetch(`api/users/${user.id}/password?site=${site}`, options)
            switch (resp.status) {
                case 200:
                case 204:
                    setSuccess("Successfully changed password");
                    sleep(3000);
                    location = `/index?site=${site}`;
                    break;
                case 401:
                case 403:
                    setError("Your current password was incorrect");
                    break;
                case 400:
                default:
                    setError("An error occurred changing your password")
                    break;
            }

        } catch (e) {

        }
    }

    return (
        <Layout site={site} user={user}>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")} style={{width: "100%"}}>
                        {error &&
                            <Alert variant={"danger"} dismissible onClick={() => setError(null)}>{error}</Alert>
                        }
                        {success &&
                            <Alert variant={"success"} dismissible onClick={() => setSuccess(null)}>{success}</Alert>
                        }
                        <Form onSubmit={handleSubmit(onSubmit)} method="post">
                            <div className="h4">User Information:</div>
                            <Form.Group className="mb-3" controlId="current_password">
                                <Form.Label visuallyHidden={true}>First Name</Form.Label>
                                <Form.Control {...register("current_password", {
                                    required: true,
                                    minLength: 8,
                                    maxLength: 100
                                })} type="password" placeholder="current password"/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="password">
                                <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                                <Form.Control
                                    className={errors && errors.password && classNames("border-danger")} {...register("password", {
                                    required: {value: true, message: "Password is required."},
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\.@$!%*?&#])[A-Za-z\d\.@$!%*?&#]{8,100}$/,
                                    }
                                })} type="password" placeholder="password"
                                    onChange={(e) => setPwd(e.currentTarget.value)}/>
                                {errors && errors.password && <Form.Text
                                    className={classNames("text-danger")}>{errors && errors.password.message}</Form.Text>}
                                <Form.Text>
                                    <div>Password must contain:</div>
                                    <ul style={{listStyleType: "none"}}>
                                        <li className={pwd.length > 8 && pwd.length < 101 ? "text-success" : "text-danger"}>Between
                                            8 and 100 chars
                                        </li>
                                        <li className={pwd.match(/.*\d/) ? "text-success" : "text-danger"}>At least one
                                            number
                                        </li>
                                        <li className={pwd.match(/.*[a-z]/) ? "text-success" : "text-danger"}>At least
                                            one
                                            lower-case character
                                        </li>
                                        <li className={pwd.match(/.*[A-Z]/) ? "text-success" : "text-danger"}>At least
                                            one
                                            upper-case character
                                        </li>
                                        <li className={pwd.match(/.*[\.@$!%*?&#]/) ? "text-success" : "text-danger"}>At
                                            least
                                            one special character
                                        </li>
                                    </ul>
                                </Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="confirm_password">
                                <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                                <Form.Control  {...register("confirm_password",
                                    {
                                        validate: {
                                            passwordEqual: (value) => value === getValues().password || "Must match new password"
                                        }
                                    })} type="password" placeholder="confirm new password"/>
                                {errors && errors.confirm_password &&
                                    <Form.Text
                                        className={classNames("text-danger")}>{errors && errors.confirm_password.message}</Form.Text>
                                }
                            </Form.Group>
                            <div style={{width: "100%"}}
                                 className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                                <Button variant="primary" type="submit" disabled={!isDirty}>Submit</Button>
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
    if (!user || !user.isLoggedIn) {
        context.res.writeHead(302, {Location: `/index.js?site=${site}`});
        context.res.end();
        return {};
    }
    const page = "password";
    const site = context.query.site || SITE;
    const [nav] = await Promise.all([GetNavLinks(user, site)]);
    return {props: {site: site, page: page, links: nav, user: {...user}}};
}, ironOptions);

export default Home;
