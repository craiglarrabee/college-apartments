import SidebarMenu, {SidebarMenuBrand, SidebarMenuCollapse, SidebarMenuFooter, SidebarMenuNavIcon} from "react-bootstrap-sidebar-menu";
import Image from "next/image";
import classNames from "classnames";

const Navigation = ({bg, variant, brandUrl, links, page, site, ...restOfProps }) => {
    const navLinks = buildNavLinks(links, "", site);

    return (
        <SidebarMenu
            bg={bg}
            variant={variant}
            expand="md"
            defaultExpanded={true}
            hide="sm"
            exclusiveExpand={true}
            collapseOnSelect={false}
            activeKey={page}
        >
            <SidebarMenuCollapse>
                <SidebarMenu.Header>
                    <SidebarMenuNavIcon>&nbsp;&nbsp;&nbsp;&nbsp;</SidebarMenuNavIcon>
                    <SidebarMenu.Brand className={classNames("navbar-dark", "h4")}
                                       href={"http://www.utahcollegeapartments.com"}>UtahCollegeApartments</SidebarMenu.Brand>
                </SidebarMenu.Header>
                <SidebarMenu.Body>
                    <SidebarMenu.Nav>
                        {navLinks}
                    </SidebarMenu.Nav>
                </SidebarMenu.Body>
                <SidebarMenuFooter>
                    <SidebarMenuBrand href={"http://www.utahcollegeapartments.com"}>
                        <Image priority={true} src={`/images/logo.png`} alt="UtahCollegeApartments" width={120}
                               height={120}></Image>
                    </SidebarMenuBrand>
                </SidebarMenuFooter>
            </SidebarMenuCollapse>
        </SidebarMenu>
    );
};

function buildNavLinks(links, parent, site) {
    const navLinks = links.filter(item => item.parent_page === parent)
        .map(item => buildNavLink(item, links, site));

    return navLinks
}

function buildNavLink(item, links, site) {
    if (item.sub_menu) {
        const sub_items = buildNavLinks(links, item.page, site);
        if (sub_items.length === 0) return <></>;
        return (
            <SidebarMenu.Sub key={item.position} eventKey={item.page}>
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
            <SidebarMenu.Nav.Link href={`${!item.target ? "/" : ""}${item.page}?site=${site}${item.page === "user" ? ("&" + new Date().getTime()) : ""}`} key={item.position} eventKey={item.page} target={item.target}>
                <SidebarMenu.Nav.Item>
                    <SidebarMenu.Nav.Title>{item.label}</SidebarMenu.Nav.Title>
                </SidebarMenu.Nav.Item>
            </SidebarMenu.Nav.Link>
        );
    }
}

export default Navigation;
