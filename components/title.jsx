import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import classNames from "classnames";
import {Person} from "react-bootstrap-icons";
import Login from "./login";
import {useState} from "react";
import Router from "next/router";

const Title = ({bg, variant, initialUser, site}) => {
    const [showLogin, setShowLogin] = useState(false);
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
                const endpoint = "/api/maintain"

                // Form the request for sending data to the server.
                const options = {
                    // The method is POST because we are sending data.
                    method: "POST",
                    // Tell the server we"re sending JSON.
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSONdata
                }

                await fetch(endpoint, options);
                location = "/index";
            } catch (e) {
                console.log(e);
            }
        }
    }

    const handleManageApartment = async () => {
        if (user.isLoggedIn) {
            try {
                const endpoint = "/api/manage"
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
                await fetch(endpoint, options);
                location = "/index";
            } catch (e) {
                console.log(e);
            }
        }
    }

    const handleViewSite = async () => {
        if (user.isLoggedIn) {
            try {
                const endpoint = "/api/view"
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
                await fetch(endpoint, options);
                location = "/index";
            } catch (e) {
                console.log(e);
            }
        }
    }

    const handleCloseLogin = () => {
        setShowLogin(false);
    }

    const handleUserAction = async (event) => {
        if (user.isLoggedIn) {
            await signOut(event);
            location = "/index";
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

            const resp = await fetch("/api/logout", options);
            const user = await resp.json();
            setNewUser(user);
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <Navbar className={classNames("d-inline-flex", "flex-row")}  expand={true} bg={bg} variant={variant}>
            <Navbar.Brand>presents: <span className={classNames("h3", "sub-brand")}>Park Place Apartments</span></Navbar.Brand>
            <Navbar.Brand style={{width: "100%"}} ><span className={classNames("d-inline-flex", "justify-content-end", "navbar-brand")} style={{width: "100%"}}>
            <Navbar.Text>{user.isLoggedIn ? `Welcome ${user.firstName ? user.firstName : user.username}` : ""}</Navbar.Text>
            <Nav style={{paddingRight: "1.5rem"}} className={classNames("justify-content-end")}>
                <NavDropdown align="end" style={{fontSize: "1rem"}} title={<Person className={classNames("h3")}/>}>
                    {user && (user.editSite || user.manageApartment) ? <NavDropdown.Item onClick={handleViewSite} >View Site</NavDropdown.Item> : <></>}
                    {user.admin  && !user.editSite ? <NavDropdown.Item onClick={handleEditSite} >Manage Site</NavDropdown.Item> : <></>}
                    {user.admin && !user.manageApartment ? <NavDropdown.Item onClick={handleManageApartment} >Manage Apartments</NavDropdown.Item> : <></>}
                    {!editSite ? <NavDropdown.Item href={"/tenant"} hidden={!user.isLoggedIn}>Manage Profile</NavDropdown.Item> : <></>}
                    {!editSite ? <NavDropdown.Item href={"/password"} hidden={!user.isLoggedIn}>Change Password</NavDropdown.Item> : <></>}
                    <NavDropdown.Item onClick={handleUserAction}>{actionText}</NavDropdown.Item>
                </NavDropdown>
            </Nav>
            </span>
            </Navbar.Brand>
            <Login close={handleCloseLogin} setNewUser={setNewUser} show={showLogin} site={site} />
        </Navbar>
    );
};

export default Title;