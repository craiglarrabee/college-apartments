import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import classNames from "classnames";
import {Button, Form} from "react-bootstrap";
import {GetNavLinks} from "../lib/db/content/navLinks";
import {GetDynamicContent} from "../lib/db/content/dynamicContent";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../lib/session/options";
import {GetDynamicImageContent} from "../lib/db/content/dynamicImageContent";
import {useForm} from "react-hook-form";

const SITE = process.env.SITE;

const Home = ({site, page, links, canEdit, user}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";

    const {register, formState: {isValid, isDirty}, handleSubmit} = useForm();

    const onSubmit = async(data, event) => {
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
                    location = "/tenant";
            }

        } catch (e) {

        }
    }

    return (
        <Layout>
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user} />
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")} style={{width: "100%"}}>
                    <Form onSubmit={handleSubmit(onSubmit)} method="post">
                        <div className="h4">User Information:</div>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label visuallyHidden={true}>First Name</Form.Label>
                            <Form.Control {...register("username", { required: true, minLength: 5, maxLength: 25 })} type="text" placeholder="username" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                            <Form.Control {...register("password", {required: true, minLength: 8, maxLength: 100})} type="password" placeholder="password" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="confirm_password">
                            <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                            <Form.Control  {...register("confirm_password", {required: true, minLength: 8, maxLength: 100})} type="password" placeholder="confirm password" />
                        </Form.Group>
                        <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                            <Button variant="primary" type="submit" disabled={!isDirty || !isValid}>Next</Button>
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
    if (user && user.isLoggedIn) {
        context.res.writeHead(302, {Location: "/tenant?newApplication"});
        context.res.end();
        return {};
    }
    const page = context.resolvedUrl.replace(/\//, "");
    const site = SITE;
    const editing = !!user && !!user.editSite;
    const [nav] = await Promise.all([GetNavLinks(site, editing)]);
    return {props: {site: site, page: page, links: nav, canEdit: editing, user: {...user}}};
}, ironOptions);

export default Home;
