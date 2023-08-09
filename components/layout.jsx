import React from "react";
import classNames from "classnames";

const Layout = ({children, user, wide}) => {
    return (
        <div>
            <div className={classNames(
                "main-wrapper",
                wide ? "admin-main-wrapper" : "user-main-wrapper",
                "main-wrapper-responsive-lg"
            )}>
                {children}
            </div>
        </div>
    );
};

export default Layout;