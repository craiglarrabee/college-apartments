import React from "react";
import classNames from "classnames";
import useBodyClass from "../lib/db/content/body";

const Layout = ({children, user, wide, site, ...restOfProps}) => {
    useBodyClass(site);
    return (
        <div style={{display: "flex", flexDirection: "row"}}>
            <div className={classNames(
                "main-wrapper",
                wide ? "admin-main-wrapper" : "user-main-wrapper", "main-wrapper-responsive-lg"
            )}>
                {children}
            </div>
        </div>
    );
};

export default Layout;