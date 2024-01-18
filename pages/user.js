import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React, {useState} from "react";
import classNames from "classnames";
import {Button, Form} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {useForm} from "react-hook-form";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Home = ({site, page, links, canEdit, user, ...restOfProps}) => {

    const {register, formState: {isDirty, errors}, handleSubmit} = useForm();
    const [pwd, setPwd] = useState("");

    const checkUsername = async (value) => {
        try {
            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
            const resp = await fetch(`api/users/${value}?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 200:
                    let json = await resp.json();
                    return json.id === undefined;
            }
        } catch (e) {

        }
    };

    const onSubmit = async (data, event) => {
        event.preventDefault();

        try {
            data.site = site;

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }

            const resp = await fetch(`api/users?site=${site}`, options)
            switch (resp.status) {
                case 400:
                    break;
                case 200:
                case 204:
                    await fetch(`/api/login?site=${site}`, options);
                    location = `/tenant?newApplication&site=${site}&form`;
            }

        } catch (e) {

        }
    };

    return (
        <Layout site={site} user={user}>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")} style={{width: "100%"}}>
                        <Form onSubmit={handleSubmit(onSubmit)} method="post">
                            <div className="h4">To apply, please create a username and password:</div>
                            <Form.Group className="mb-3" controlId="username">
                                <Form.Label visuallyHidden={true}>Username</Form.Label>
                                <Form.Control
                                    className={errors && errors.username && classNames("border-danger")} {...register("username", {
                                    required: {value: true, message: "Username is required."},
                                    validate: checkUsername
                                })} type="text" placeholder="username" maxLength={100}/>
                                {errors && errors.username && <Form.Text
                                    className={classNames("text-danger")}>{errors && errors.username.message}</Form.Text>}
                                {errors && errors.username && errors && errors.username.type === "validate" &&
                                    <Form.Text className={classNames("text-danger")}>Username is not
                                        available.</Form.Text>}
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="password">
                                <Form.Label visuallyHidden={true}>Password</Form.Label>
                                <Form.Control
                                    className={errors && errors.password && classNames("border-danger")} {...register("password", {
                                    required: {value: true, message: "Password is required."},
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/,
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
                                            one lower-case character
                                        </li>
                                        <li className={pwd.match(/.*[A-Z]/) ? "text-success" : "text-danger"}>At least
                                            one upper-case character
                                        </li>
                                        <li className={pwd.match(/.*[@$!%*?&]/) ? "text-success" : "text-danger"}>At
                                            least one special character
                                        </li>
                                    </ul>
                                </Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="confirm_password">
                                <Form.Label visuallyHidden={true}>Confirm Password</Form.Label>
                                <Form.Control
                                    className={errors && errors.confirm_password && classNames("border-danger")} {...register("confirm_password", {
                                    required: true,
                                    validate: (value, formValues) => {
                                        return value === formValues.password;
                                    }
                                })} type="password" placeholder="confirm password"/>
                                {errors && errors.confirm_password &&
                                    <Form.Text className={classNames("text-danger")}>Must match Password.</Form.Text>}
                            </Form.Group>
                            <div style={{width: "100%"}}
                                 className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                                <Button variant="primary" type="submit" disabled={!isDirty}>Next</Button>
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
    const user = context.req.session.user;
    const site = context.query.site || SITE;
    if (user?.isLoggedIn) {
        context.res.writeHead(302, {Location: `/tenant?newApplication&site=${site}&${new Date().getTime()}`});
        context.res.end();
        return {};
    }
    const page = "user";
    const editing = !!user && !!user.editSite;
    const [nav] = await Promise.all([GetNavLinks(user, site)]);
    return {props: {site: site, page: page, links: nav, canEdit: editing, user: {...user}}};
}, ironOptions);

export default Home;
