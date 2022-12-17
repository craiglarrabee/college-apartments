import SidebarMenu, {
    SidebarMenuBrand,
    SidebarMenuCollapse,
    SidebarMenuFooter, SidebarMenuNavIcon
} from "react-bootstrap-sidebar-menu";
import Image from "next/image";
import classNames from "classnames";

const Navigation = ({bg, variant, brandUrl}) => {
    return (
        <SidebarMenu
            bg={bg}
            variant={variant}
            expand="md"
            defaultExpanded={true}
            hide="sm"
            exclusiveExpand={true}
            collapseOnSelect={true}
            activeKey={"Home"}
        >
            <SidebarMenuCollapse>
                <SidebarMenu.Header>
                    <SidebarMenuNavIcon>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</SidebarMenuNavIcon>
                    <SidebarMenu.Brand className={classNames("navbar-dark")} href={brandUrl}>UtahCollegeApartments</SidebarMenu.Brand>
                </SidebarMenu.Header>
                <SidebarMenu.Body>
                    <SidebarMenu.Nav>
                        <SidebarMenu.Nav.Link>
                            <SidebarMenu.Nav.Item>
                                <SidebarMenu.Nav.Title>Home</SidebarMenu.Nav.Title>
                            </SidebarMenu.Nav.Item>
                        </SidebarMenu.Nav.Link>
                        <SidebarMenu.Nav.Link>
                            <SidebarMenu.Nav.Item>
                                <SidebarMenu.Nav.Title>Apartments</SidebarMenu.Nav.Title>
                            </SidebarMenu.Nav.Item>
                        </SidebarMenu.Nav.Link>
                        <SidebarMenu.Nav.Link>
                            <SidebarMenu.Nav.Item>
                                <SidebarMenu.Nav.Title>Clubhouse</SidebarMenu.Nav.Title>
                            </SidebarMenu.Nav.Item>
                        </SidebarMenu.Nav.Link>
                        <SidebarMenu.Nav.Link>
                            <SidebarMenu.Nav.Item>
                                <SidebarMenu.Nav.Title>Park & Grounds</SidebarMenu.Nav.Title>
                            </SidebarMenu.Nav.Item>
                        </SidebarMenu.Nav.Link>
                        <SidebarMenu.Nav.Link>
                            <SidebarMenu.Nav.Item>
                                <SidebarMenu.Nav.Title>Activities</SidebarMenu.Nav.Title>
                            </SidebarMenu.Nav.Item>
                        </SidebarMenu.Nav.Link>
                        <SidebarMenu.Nav.Link>
                            <SidebarMenu.Nav.Item>
                                <SidebarMenu.Nav.Title>Local Area</SidebarMenu.Nav.Title>
                            </SidebarMenu.Nav.Item>
                        </SidebarMenu.Nav.Link>
                        <SidebarMenu.Nav.Link>
                            <SidebarMenu.Nav.Item>
                                <SidebarMenu.Nav.Title>Application</SidebarMenu.Nav.Title>
                            </SidebarMenu.Nav.Item>
                        </SidebarMenu.Nav.Link>
                        <SidebarMenu.Nav.Link>
                            <SidebarMenu.Nav.Item>
                                <SidebarMenu.Nav.Title>Parent Guaranty</SidebarMenu.Nav.Title>
                            </SidebarMenu.Nav.Item>
                        </SidebarMenu.Nav.Link>
                        <SidebarMenu.Sub eventKey={0}>
                            <SidebarMenu.Sub.Toggle>
                                <SidebarMenu.Nav.Icon />
                                <SidebarMenu.Nav.Title>Maintenance</SidebarMenu.Nav.Title>
                            </SidebarMenu.Sub.Toggle>
                            <SidebarMenu.Sub.Collapse>
                                <SidebarMenu.Nav.Link>
                                    <SidebarMenu.Nav.Item>
                                        <SidebarMenu.Nav.Icon />
                                        <SidebarMenu.Nav.Title>College Way</SidebarMenu.Nav.Title>
                                    </SidebarMenu.Nav.Item>
                                </SidebarMenu.Nav.Link>
                                <SidebarMenu.Nav.Link>
                                    <SidebarMenu.Nav.Item>
                                        <SidebarMenu.Nav.Icon />
                                        <SidebarMenu.Nav.Title>Stadium Way</SidebarMenu.Nav.Title>
                                    </SidebarMenu.Nav.Item>
                                </SidebarMenu.Nav.Link>
                            </SidebarMenu.Sub.Collapse>
                        </SidebarMenu.Sub>
                        <SidebarMenu.Nav.Link>
                            <SidebarMenu.Nav.Item>
                                <SidebarMenu.Nav.Title>F.A.Q.</SidebarMenu.Nav.Title>
                            </SidebarMenu.Nav.Item>
                        </SidebarMenu.Nav.Link>
                        <SidebarMenu.Nav.Link>
                            <SidebarMenu.Nav.Item>
                                <SidebarMenu.Nav.Title>Summer Rental</SidebarMenu.Nav.Title>
                            </SidebarMenu.Nav.Item>
                        </SidebarMenu.Nav.Link>
                        <SidebarMenu.Nav.Link>
                            <SidebarMenu.Nav.Item>
                                <SidebarMenu.Nav.Title>Contact Us</SidebarMenu.Nav.Title>
                            </SidebarMenu.Nav.Item>
                        </SidebarMenu.Nav.Link>
                    </SidebarMenu.Nav>
                </SidebarMenu.Body>
                <SidebarMenuFooter>
                    <SidebarMenuBrand href={brandUrl}>
                        <Image priority={true} src="/images/logo.gif" alt="UtahCollegeApartments" width={120} height={120}></Image>
                    </SidebarMenuBrand>
                </SidebarMenuFooter>
            </SidebarMenuCollapse>
        </SidebarMenu>
    );
};

export default Navigation;