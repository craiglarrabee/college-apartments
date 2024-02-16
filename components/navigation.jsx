import SidebarMenu, {SidebarMenuFooter} from "react-bootstrap-sidebar-menu";
import Image from "next/image";
import classNames from "classnames";
import {List} from "react-bootstrap-icons";
import Link from "next/link";
import {useEffect, useRef, useState} from "react";
import {useWindowSize} from "../lib/window";

const Navigation = ({bg, variant, brandUrl, links, page, site, ...restOfProps}) => {
    const navLinks = buildNavLinks(links, "", site);
    const [width, height] = useWindowSize();
    const [extraClass, setExtraClass] = useState("");
    const [expandOn, setExpandOn] = useState("lg");
    const handleToggle = (expanded) => {
        if (width < 992 && expanded) {
            setExtraClass("showall");
            setExpandOn("xs");
        } else {
            setExtraClass("");
            setExpandOn("lg");
        }
    };

    useEffect(() => {
        if (window.innerWidth < 992) {
           document.getElementsByClassName("sidebar-menu-toggle")[0].click();
        }
    }, []);


    return (
        <>
            <SidebarMenu
                bg={bg}
                variant={variant}
                expand={expandOn}
                defaultExpanded={true}
                exclusiveExpand={true}
                collapseOnSelect={false}
                activeKey={page}
                className={extraClass}
                onToggle={handleToggle}
            >
                <SidebarMenu.Collapse >
                    <SidebarMenu.Toggle ><List/></SidebarMenu.Toggle>
                    <SidebarMenu.Header>
                        <SidebarMenu.Nav.Icon>
                            <Link href={"http://www.utahcollegeapartments.com"}>
                                <Image width={120} height={120} priority={true} src={`/images/logo.png`} alt="UtahCollegeApartments" ></Image>
                            </Link>
                        </SidebarMenu.Nav.Icon>
                        <SidebarMenu.Brand className={classNames("navbar-dark", "h6")}
                                          href={"http://www.utahcollegeapartments.com"}>
                                <div>UtahCollegeApartments</div>
                        </SidebarMenu.Brand>
                    </SidebarMenu.Header>
                    <SidebarMenu.Body>
                        <SidebarMenu.Nav>
                            {navLinks}
                        </SidebarMenu.Nav>
                    </SidebarMenu.Body>
                    <SidebarMenuFooter>

                    </SidebarMenuFooter>
                </SidebarMenu.Collapse>
            </SidebarMenu>
        </>
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
            <SidebarMenu.Nav.Link
                href={`${!item.target ? "/" : ""}${item.page}?site=${site}&t=${new Date().getTime()}`}
                key={item.position} eventKey={item.page} target={item.target} >
                <SidebarMenu.Nav.Item>
                    <SidebarMenu.Nav.Title>{item.label}</SidebarMenu.Nav.Title>
                </SidebarMenu.Nav.Item>
            </SidebarMenu.Nav.Link>
        );
    }
}

export default Navigation;
