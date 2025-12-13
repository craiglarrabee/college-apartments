import Image from "next/image";
import Link from "next/link";
import {useEffect, useState} from "react";
import classNames from "classnames";
import {Button, Nav, Offcanvas} from "react-bootstrap";
import {List} from "react-bootstrap-icons";
import {useWindowSize} from "../lib/window";

const Navigation = ({bg, variant, brandUrl, links, page, site, isBot}) => {
    const [isClient, setIsClient] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [expandedParents, setExpandedParents] = useState(new Set());
    const [width] = useWindowSize();

    useEffect(() => { setIsClient(true); }, []);

    const toggleParent = (parentKey) => {
        setExpandedParents(prev => {
            const next = new Set(prev);
            if (next.has(parentKey)) {
                next.delete(parentKey);
            } else {
                next.add(parentKey);
            }
            return next;
        });
    };

    const buildNavLinks = (allLinks = [], parent = "") => {
        return (allLinks || [])
            .filter(item => item.parent_page === parent)
            .map(item => buildNavLink(item, allLinks));
    };

    const buildNavLink = (item, allLinks) => {
        if (item.target && isBot) return <></>;
        const href = `${!item.target ? "/" : ""}${item.page}?site=${site}&t=${Date.now()}`;

        if (item.sub_menu) {
            const children = buildNavLinks(allLinks, item.page);
            if (children.length === 0) return <></>;
            const expanded = expandedParents.has(item.page);
            return (
                <div key={item.position} className="mb-2">
                    <button
                        type="button"
                        onClick={() => toggleParent(item.page)}
                        className="d-flex align-items-center w-100 border-0 bg-transparent px-0 py-2 fw-bold text-start nav-link text-primary"
                        aria-expanded={expanded}
                        aria-controls={`submenu-${item.page}`}
                    >
                        <span className="me-2" aria-hidden="true" style={{fontSize: "1.3rem", lineHeight: 1}}>{expanded ? "▾" : "▸"}</span>
                        <span className="mb-0 fw-bolder" style={{fontSize: "1.4rem"}}>{item.label}</span>
                    </button>
                    {expanded ? (
                        <div id={`submenu-${item.page}`} className="ms-4 mt-1">
                            {children}
                        </div>
                    ) : null}
                </div>
            );
        }

        return (
            <Nav.Item key={item.position}>
                <Nav.Link
                    as={Link}
                    href={href}
                    target={item.target}
                    active={page === item.page}
                >
                    {item.label}
                </Nav.Link>
            </Nav.Item>
        );
    };

    const navLinks = buildNavLinks(links || [], "");
    const brandHref = brandUrl || "http://www.utahcollegeapartments.com";
    const isDesktop = typeof width === "number" ? width >= 992 : false;
    const sidebarWidth = 320;

    useEffect(() => {
        if (!isClient) return;
        if (isDesktop && isOpen) {
            document.body.style.paddingLeft = `${sidebarWidth-80}px`;
        } else {
            document.body.style.paddingLeft = "";
        }
        return () => {
            document.body.style.paddingLeft = "";
        };
    }, [isDesktop, isOpen, isClient, sidebarWidth]);

    useEffect(() => {
        if (!isClient) return;
        if (isDesktop) {
            setIsOpen(true);
        }
    }, [isDesktop, isClient]);

    useEffect(() => {
        if (!isClient) return;
        const parentMap = new Map();
        (links || []).forEach(item => parentMap.set(item.page, item.parent_page));
        const toExpand = new Set();
        let current = page;
        while (current) {
            const parent = parentMap.get(current);
            if (!parent) break;
            toExpand.add(parent);
            current = parent;
        }
        setExpandedParents(toExpand);
    }, [links, page, isClient]);

    if (!isClient) return <></>;

    const brand = (
        <Link href={brandHref} className="d-flex align-items-center text-decoration-none">
            <Image width={24} height={24} priority src="/images/logo.png" alt="UtahCollegeApartments" />
            <span className="ms-2 h6 mb-0 text-body">UtahCollegeApartments</span>
        </Link>
    );

    return (
        <>
            <div
                className="d-flex flex-column align-items-start"
                style={{position: "fixed", top: 12, left: 12, zIndex: 1056, gap: 8}}
            >
                <Button
                    variant="light"
                    onClick={() => setIsOpen(current => !current)}
                    aria-label="Toggle navigation"
                    className="border-0 rounded-3 d-flex align-items-center justify-content-center"
                    style={{width: 32, height: 32, padding: 0}}
                >
                    <List className="text-primary" />
                </Button>
            </div>

            {isDesktop ? (
                isOpen ? (
                    <aside
                        className={classNames("d-flex", "flex-column", "px-3", bg && `bg-${bg}`)}
                        style={{width: sidebarWidth, minHeight: "100vh", position: "fixed", top: 0, left: 0, zIndex: 1054, paddingTop: 80, paddingBottom: 32}}
                    >
                        <div className="mb-3">
                            {brand}
                        </div>
                        <Nav className="flex-column mt-3" activeKey={page}>
                            {navLinks}
                        </Nav>
                    </aside>
                ) : null
            ) : (
                <Offcanvas
                    show={isOpen}
                    onHide={() => setIsOpen(false)}
                    placement="start"
                    scroll
                    backdrop
                    className={classNames("border-0", bg && `bg-${bg}`, variant && `text-${variant === "light" ? "dark" : "light"}`)}
                    style={{minHeight: "100vh", maxWidth: sidebarWidth, zIndex: 1055}}
                >
                    <Offcanvas.Body className="px-3" style={{paddingTop: 80, paddingBottom: 32}}>
                        <div className="mb-3">
                            {brand}
                        </div>
                        <Nav className="flex-column mt-3" activeKey={page}>
                            {navLinks}
                        </Nav>
                    </Offcanvas.Body>
                </Offcanvas>
            )}
        </>
    );
};

export default Navigation;
