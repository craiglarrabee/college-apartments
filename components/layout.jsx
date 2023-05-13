import React from "react";
import classNames from "classnames";

const Layout = ({children, user}) => {
    return (
        <div>
            <div className={classNames(
                "main-wrapper",
                user.editSite || user.manageApartment ? "admin-main-wrapper" : "user-main-wrapper",
                "main-wrapper-responsive-lg"
            )}>
                {children}
            </div>
        </div>
    );
};

export default Layout;