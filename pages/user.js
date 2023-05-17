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

const Home = ({site, page, links, canEdit, user}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    const {register, formState: {isDirty, errors}, handleSubmit} = useForm();

    const checkUsername = async (value) => {
        try {
            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
            const resp = await fetch(`api/users/${value}`, options)
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

            const resp = await fetch("api/users", options)
            switch (resp.status) {
                case 400:
                    break;
                case 200:
                case 204:
                    await fetch("/api/login", options);
                    location = "/tenant?newApplication";
            }

        } catch (e) {

        }
    };

    return (
        <Layout user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")} style={{width: "100%"}}>
                    <Form onSubmit={handleSubmit(onSubmit)} method="post">
                        <div className="h4">User Information:</div>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label visuallyHidden={true}>Username</Form.Label>
                            <Form.Control className={errors && errors.username && classNames("border-danger")} {...register("username", {
                                required: {value: true, message: "Username is required."},
                                validate: checkUsername
                            })} type="text" placeholder="username"/>
                            {errors && errors.username && <Form.Text className={classNames("text-danger")}>{errors && errors.username.message}</Form.Text>}
                            {errors && errors.username && errors && errors.username.type === "validate" && <Form.Text className={classNames("text-danger")}>Username is not available.</Form.Text>}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label visuallyHidden={true}>Password</Form.Label>
                            <Form.Control className={errors && errors.password && classNames("border-danger")} {...register("password", {
                                required: {value: true, message: "Password is required."},
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,100}$/,
                                    message: "Password must be between 8 and 100 chars, and contain: a number, a lower-case character, an upper-case character, a special character"}
                            })} type="password" placeholder="password" />
                            {errors && errors.password && <Form.Text className={classNames("text-danger")}>{errors && errors.password.message}</Form.Text>}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="confirm_password">
                            <Form.Label visuallyHidden={true}>Confirm Password</Form.Label>
                            <Form.Control className={errors && errors.confirm_password && errors && errors.confirm_password.message !=="" && classNames("border-danger")} {...register("confirm_password", {
                                required: true,
                                validate: (value, formValues) => {return value === formValues.password;}
                            })} type="password" placeholder="confirm password"/>
                            {errors && errors.confirm_password && <Form.Text className={classNames("text-danger")}>Must match Password.</Form.Text>}
                        </Form.Group>
                        <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                            <Button variant="primary" type="submit" disabled={!isDirty}>Next</Button>
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
    const site = context.query.site || SITE;
    if (user && user.isLoggedIn) {
        context.res.writeHead(302, {Location: `/tenant?newApplication&site=${site}`});
        context.res.end();
        return {};
    }
    const page = "user";
    const editing = !!user && !!user.editSite;
    const [nav] = await Promise.all([GetNavLinks(user, site)]);
    return {props: {site: site, page: page, links: nav, canEdit: editing, user: {...user}}};
}, ironOptions);

export default Home;
