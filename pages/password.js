import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
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


const Home = ({site, page, links, user, ...restOfProps }) => {

    const {register, formState: {isValid, isDirty}, handleSubmit} = useForm();

    const onSubmit = async(data, event) => {
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
                case 400:
                    break;
                case 200:
                case 204:
                    location = `/index?site=${site}`;
            }

        } catch (e) {

        }
    }

    return (
        <Layout site={site}  user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user} />
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                <div className={classNames("main-content")} style={{width: "100%"}}>
                    <Form onSubmit={handleSubmit(onSubmit)} method="post">
                        <div className="h4">User Information:</div>
                        <Form.Group className="mb-3" controlId="current_password">
                            <Form.Label visuallyHidden={true}>First Name</Form.Label>
                            <Form.Control {...register("current_password", { required: true, minLength: 8, maxLength: 100 })} type="password" placeholder="current password" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                            <Form.Control {...register("password", {required: true, minLength: 8, maxLength: 100})} type="password" placeholder="new password" />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="confirm_password">
                            <Form.Label visuallyHidden={true}>Last Name</Form.Label>
                            <Form.Control  {...register("confirm_password", {required: true, minLength: 8, maxLength: 100})} type="password" placeholder="confirm new password" />
                        </Form.Group>
                        <div style={{width: "100%"}} className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                            <Button variant="primary" type="submit" disabled={!isDirty || !isValid}>Submit</Button>
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
