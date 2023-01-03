import SidebarMenu, {
    SidebarMenuBrand,
    SidebarMenuCollapse,
    SidebarMenuFooter, SidebarMenuNavIcon
} from "react-bootstrap-sidebar-menu";
import Image from "next/image";
import classNames from "classnames";
import ConnectionPool from "../lib/db/connection";
import {forEach} from "react-bootstrap/ElementChildren";

const Navigation = ({bg, variant, brandUrl, links}) => {
    const navLinks = buildNavLinks(links, "");
    return (
        <SidebarMenu
            bg={bg}
            variant={variant}
            expand="md"
            defaultExpanded={true}
            hide="sm"
            exclusiveExpand={true}
            collapseOnSelect={true}
            activeKey={"index"}
        >
            <SidebarMenuCollapse>
                <SidebarMenu.Header>
                    <SidebarMenuNavIcon>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</SidebarMenuNavIcon>
                    <SidebarMenu.Brand className={classNames("navbar-dark")}
                                       href={brandUrl}>UtahCollegeApartments</SidebarMenu.Brand>
                </SidebarMenu.Header>
                <SidebarMenu.Body>
                    <SidebarMenu.Nav>
                        {navLinks}
                    </SidebarMenu.Nav>
                </SidebarMenu.Body>
                <SidebarMenuFooter>
                    <SidebarMenuBrand href={brandUrl}>
                        <Image priority={true} src="/images/logo.gif" alt="UtahCollegeApartments" width={120}
                               height={120}></Image>
                    </SidebarMenuBrand>
                </SidebarMenuFooter>
            </SidebarMenuCollapse>
        </SidebarMenu>
    );
};

function buildNavLinks(links, parent) {
    const navLinks = links.filter(item => item.parent_page === parent)
        .map(item => buildNavLink(item, links));

    return navLinks
}

function buildNavLink(item, links) {
    if (item.sub_menu) {
        const sub_items = buildNavLinks(links, item.page);
        return (
            <SidebarMenu.Sub eventKey={item.page}>
                <SidebarMenu.Sub.Toggle>
                    <SidebarMenu.Nav.Icon/>
                    <SidebarMenu.Nav.Title>{item.label}</SidebarMenu.Nav.Title>
                </SidebarMenu.Sub.Toggle>
                <SidebarMenu.Sub.Collapse>
                    {sub_items}
                </SidebarMenu.Sub.Collapse>
            </SidebarMenu.Sub>

        );
    } else {
        return (
            <SidebarMenu.Nav.Link href={item.page} eventKey={item.page}>
                <SidebarMenu.Nav.Item>
                    <SidebarMenu.Nav.Title>{item.label}</SidebarMenu.Nav.Title>
                </SidebarMenu.Nav.Item>
            </SidebarMenu.Nav.Link>
        );
    }
}

export default Navigation;
