import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import classNames from "classnames";
import {Button, Nav, Offcanvas} from "react-bootstrap";
import {List} from "react-bootstrap-icons";
import {useWindowSize} from "../lib/window";

const Navigation = ({bg, variant, brandUrl, links, page, site, isBot}) => {
    const router = useRouter();
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
        const href = `${!item.target ? "/" : ""}${item.page}?site=${site}`;

        const handleClick = (e) => {
            if (!item.target) {
                e.preventDefault();
                window.location.href = href;
            }
        };

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
                            style={{ touchAction: "manipulation" }}
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
                    href={href}
                    onClick={handleClick}
                    target={item.target}
                    active={page === item.page}
                    style={{ touchAction: "manipulation" }}
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
        if (isDesktop) {
            if (isOpen) {
                document.body.style.marginLeft = `${sidebarWidth}px`;
            } else {
                document.body.style.marginLeft = "56px";
            }
            document.body.style.marginRight = "80px";
            document.body.style.paddingLeft = "0";
            document.body.style.paddingRight = "0";
            document.body.style.paddingTop = "0";
        } else {
            // Mobile: same 56px gray strip as desktop collapsed mode
            document.body.style.marginLeft = "56px";
            document.body.style.marginRight = "0";
            document.body.style.paddingLeft = "0";
            document.body.style.paddingRight = "0";
            document.body.style.paddingTop = "0";
        }
        return () => {
            document.body.style.marginLeft = "";
            document.body.style.marginRight = "";
            document.body.style.paddingLeft = "";
            document.body.style.paddingRight = "";
            document.body.style.paddingTop = "";
        };
    }, [isDesktop, isOpen, isClient]);

    useEffect(() => {
        if (!isClient) return;
        if (isDesktop) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
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
            {/* Background strip - always visible on desktop AND mobile */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: isDesktop && isOpen ? sidebarWidth : 56,
                    height: "100vh",
                    zIndex: 1040,
                    transition: "width 0.3s ease",
                    backgroundColor: '#f8f9fa',
                    borderRight: '1px solid #dee2e6'
                }}
            />

            {/* Toggle button - always visible */}
            <div
                className="d-flex flex-row align-items-center"
                style={{position: "fixed", top: 12, left: 12, zIndex: 1056, gap: 12}}
            >
                <Button
                    onClick={() => setIsOpen(current => !current)}
                    aria-label="Toggle navigation"
                    className="border-0 rounded-3 d-flex align-items-center justify-content-center bg-transparent"
                    style={{width: 32, height: 32, padding: 0}}
                >
                    <List className="text-primary" style={{fontSize: "1.5rem"}} />
                </Button>
                {isDesktop && isOpen && brand}
            </div>

            {isDesktop ? (
                isOpen ? (
                    <aside
                        className={classNames("d-flex", "flex-column", "px-3", bg && `bg-${bg}`)}
                        style={{width: sidebarWidth, height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 1054, paddingTop: 80, paddingBottom: 32, overflowY: "auto", WebkitOverflowScrolling: "touch"}}
                    >
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
                    scroll={true}
                    backdrop={true}
                    className={classNames("border-0", bg && `bg-${bg}`, variant && `text-${variant === "light" ? "dark" : "light"}`)}
                    style={{height: "100dvh", maxWidth: sidebarWidth, zIndex: 1055}}
                >
                    <Offcanvas.Body
                        className="px-3"
                        style={{
                            paddingTop: 80,
                            paddingBottom: 80,
                            overflowY: "scroll",
                            WebkitOverflowScrolling: "touch",
                            height: "auto",
                            maxHeight: "100%",
                            display: "block",
                            position: "relative"
                        }}
                    >
                        <div className="mb-3">
                            {brand}
                        </div>
                        <Nav className="flex-column mt-3" activeKey={page} style={{paddingBottom: "150px", minHeight: "calc(100dvh + 1px)"}}>
                            {navLinks}
                        </Nav>
                    </Offcanvas.Body>
                </Offcanvas>
            )}
        </>
    );
};

export default Navigation;
