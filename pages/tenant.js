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
import {GetTenantInfo} from "../lib/db/users/tenantInfo";
import {useForm} from "react-hook-form";
import {TenantFormGroups} from "../components/tenantFormGroups";

const SITE = process.env.SITE;

const Home = ({site, navPage, links, user, tenant, isNewApplication = false}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const {register, reset, formState: {isValid, isDirty, errors}, handleSubmit} = useForm({defaultValues: tenant});

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
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={navPage}/>
            <main>
                <div className={classNames("main-content")}>
                    <Form onSubmit={handleSubmit(onSubmit)} method="post">
                        <TenantFormGroups tenant={tenant} register={register} errors={errors}></TenantFormGroups>
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
    const newApplication = context.query && context.query.hasOwnProperty("newApplication");
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: "/application"});
        context.res.end();
        return {};
    }
    const site = context.query.site || SITE;
    const content = {};
    const editing = !!user && !!user.editSite;
    const [nav, tenant] = await Promise.all([
        GetNavLinks(user, site),
        GetTenantInfo(user.id)
    ]);
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
