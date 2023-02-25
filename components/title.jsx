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
        setShowLogin(false);
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
                const endpoint = '/api/maintain'

                // Form the request for sending data to the server.
                const options = {
                    // The method is POST because we are sending data.
                    method: 'POST',
                    // Tell the server we're sending JSON.
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSONdata
                }

                await fetch(endpoint, options);
            } catch (e) {
                console.log(e);
            }
            Router.reload();
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

    const signOut = async (event) => {
        try {

            // API endpoint where we send form data.
            const endpoint = '/api/logout'

            // Form the request for sending data to the server.
            const options = {
                // The method is POST because we are sending data.
                method: 'POST',
                // Tell the server we're sending JSON.
                headers: {
                    'Content-Type': 'application/json',
                },
            }

            const resp = await fetch(endpoint, options);
            const user = await resp.json();
            setNewUser(user);
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <Navbar className={classNames("d-inline-flex", "flex-row")} expand={true} bg={bg} variant={variant}>
            <Navbar.Brand>presents: <span className={classNames("h3", "sub-brand")}>Park Place Apartments</span></Navbar.Brand>
            <Navbar.Brand><span className={classNames("d-inline-flex", "justify-content-end", "navbar-brand")} style={{width: "100%"}}>
            <Navbar.Text>{user.isLoggedIn ? `Welcome ${user.firstName}` : ""}</Navbar.Text>
            <Nav style={{paddingRight: "1.5rem"}}>
                <NavDropdown align="end" style={{fontSize: "1rem"}} title={<Person className={classNames("h3")}/>}>
                    {user.admin ? <NavDropdown.Item onClick={handleEditSite} >{editSite ? "View Site" : "Maintain Site"}</NavDropdown.Item> : <></>}
                    <NavDropdown.Item href={"/tenant"} hidden={!user.isLoggedIn}>Manage Profile</NavDropdown.Item>
                    <NavDropdown.Item onClick={handleUserAction}>{actionText}</NavDropdown.Item>
                </NavDropdown>
            </Nav>
            </span>
            </Navbar.Brand>
            <Login handleClose={handleCloseLogin} setNewUser={setNewUser} show={showLogin} site={site} />
        </Navbar>
    );
};

export default Title;