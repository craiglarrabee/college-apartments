import Layout from "../../components/layout";
import Navigation from "../../components/navigation";
import Title from "../../components/title";
import Footer from "../../components/footer";
import React, {useState} from "react";
import {GetNavLinks} from "../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";
import {Alert, Tab, Table, Tabs} from "react-bootstrap";
import SearchBar from "../../components/searchbar";

const SITE = process.env.SITE;

const Tenants = ({site, page, links, user}) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com";
    const [tenants, setTenants] = useState([]);
    const [searchString, setSearchString] = useState();
    const [message, setMessage] = useState();

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const options = {
                method: "GET",
                headers: {"Content-Type": "application/json"}
            }

            const resp = await fetch(`/api/users/search?site=${site}&search=${searchString}`, options);
            switch (resp.status) {
                case 400:
                    setMessage({value:"An error occurred searching for the user.", type: "error"});
                    break;
                case 404:
                    setMessage({value: "No tenants found", type: "error"});
                    break;
                case 200:
                    let json = await resp.json();
                    setMessage(null);
                    setTenants(json.tenants);
                    break;
            }
        } catch (e) {
            setMessage({value:"An error occurred searching for the user.", type: "error"});
            console.log(e);
        }
    };

    const updateSearchStr = (e) => {
        setSearchString(e.target.value);
    }

    return (
        <Layout user={user} >
            <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
            <Navigation site={site} bg={bg} variant={variant} brandUrl={brandUrl} links={links} page={page}/>
            <main>
                {message && <Alert variant={message.type === "error" ? "danger" : "primary"} >{message.value}</Alert> }
                <SearchBar click={handleSearch} change={updateSearchStr}/>
                <ul style={{minHeight: "350px"}}>
                    {tenants.map(tenant =>
                        (<li key={tenant.user_id}>
                            <a href={`/tenants/${tenant.user_id}?site=${site}`}>{tenant.name}</a>
                        </li>))}
                </ul>
                <Footer bg={bg}/>
            </main>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
        const user = context.req.session.user;
        const page = "tenants";
        const site = context.query.site || SITE;
        if (!user.manageApartment || !user.admin.includes(site)) {
            res.status(403).send();
            return;
        }
        const [nav] = await Promise.all([
            GetNavLinks(user, site)
        ]);

        return {
            props: {
                site: site,
                page: page,
                links: nav,
                user: {...user}
            }
        };
    }
    , ironOptions);

export default Tenants;