import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import classNames from "classnames";
import {Person} from "react-bootstrap-icons";
import Login from "./login";
import {useState} from "react";

const Title = ({bg, variant, initialUser, site, startWithLogin = false, ...restOfProps}) => {
    const [showLogin, setShowLogin] = useState(startWithLogin);
    const [actionText, setActionText] = useState(initialUser.isLoggedIn ? "Sign out" : "Sign In");
    const [user, setUser] = useState(initialUser);
    const [editSite, setEditSite] = useState(!!user.editSite);

    const setNewUser = (newUser) => {
        setUser(newUser);
        setActionText(newUser.isLoggedIn ? "Sign out" : "Sign In");
    };

    const handleEditSite = async () => {
        const canEdit = !editSite;
        setEditSite(canEdit);
        if (user.isLoggedIn) {
            try {
                const JSONdata = JSON.stringify({editSite: canEdit});
                // API endpoint where we send form data.
                const endpoint = `/api/maintain?site=${site}`;

                // Form the request for sending data to the server.
                const options = {
                    // The method is POST because we are sending data.
                    method: "POST",
                    // Tell the server we're sending JSON.
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSONdata
                }

                await fetch(endpoint, options);
                location = `/index?site=${site}`;
            } catch (e) {
                console.error(e);
            }
        }
    }

    const handleManageApartment = async () => {
        if (user.isLoggedIn) {
            try {
                const endpoint = `/api/manage?site=${site}`
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
                await fetch(endpoint, options);
                location = `/index?site=${site}`;
            } catch (e) {
                console.error(e);
            }
        }
    }

    const handleViewSite = async () => {
        if (user.isLoggedIn) {
            try {
                const endpoint = `/api/view?site=${site}`
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
                await fetch(endpoint, options);
                location = `/index?site=${site}`;
            } catch (e) {
                console.error(e);
            }
        }
    }

    const handleCloseLogin = () => {
        setShowLogin(false);
    }

    const handleUserAction = async (event) => {
        if (user.isLoggedIn) {
            await signOut(event);
            location = `/index?site=${site}`;
        } else {
            setShowLogin(true);
        }
    }

    const signOut = async () => {
        try {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            };

            const resp = await fetch(`/api/logout?site=${site}`, options);
            const user = await resp.json();
            setNewUser(user);
            location = `/index?site=${site}`;
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Navbar style={{display: "block", borderTopRightRadius: "50px"}} expand={true} bg={bg} variant={variant}>
            <Navbar.Brand><span
                className={classNames("h3", "sub-brand")}>{site === "snow" ? "Park Place Apartments @ Snow College" : "Stadium Way & College Way @ SUU"}</span></Navbar.Brand>
            <Navbar.Brand style={{width: "100%"}}>
                <span className={classNames("d-inline-flex", "justify-content-end", "navbar-brand")}
                      style={{width: "100%"}}>
                {user && user.isLoggedIn ?
                    <Navbar.Text>{`Welcome ${user.firstName ? user.firstName : user.username}`}</Navbar.Text> :
                    <Navbar.Text style={{cursor: "pointer"}} onClick={handleUserAction}>{actionText}</Navbar.Text>
                }
                    <Nav style={{paddingRight: "1.5rem"}} className={classNames("justify-content-end")}>
                        <NavDropdown align="end" style={{fontSize: "1rem"}}
                                     title={<Person className={classNames("h3")}/>}>
                            {user.editSite || user.manageApartment ?
                                <NavDropdown.Item onClick={handleViewSite}>View Site</NavDropdown.Item> : <></>}
                            {user.admin && user.admin.includes(site) && !user.editSite ?
                                <NavDropdown.Item onClick={handleEditSite}>Manage Site</NavDropdown.Item> : <></>}
                            {user.manage && user.manage.includes(site) && !user.manageApartment ?
                                <NavDropdown.Item onClick={handleManageApartment}>Manage
                                    Apartments</NavDropdown.Item> : <></>}
                            {!editSite ?
                                <NavDropdown.Item href={`/tenants/${user.id}?site=${site}`} hidden={!user.isLoggedIn}>Manage
                                    Profile</NavDropdown.Item> : <></>}
                            {!editSite ? <NavDropdown.Item href={`/password?site=${site}`} hidden={!user.isLoggedIn}>Change
                                Password</NavDropdown.Item> : <></>}
                            <NavDropdown.Item onClick={handleUserAction}>{actionText}</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </span>
            </Navbar.Brand>
            <Login close={handleCloseLogin} setNewUser={setNewUser} show={showLogin} site={site}/>
        </Navbar>
    );
};

export default Title;