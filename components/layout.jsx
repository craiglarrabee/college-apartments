import React from "react";
import classNames from "classnames";

const Layout = ({children, bg}) => {
    return (
        <div>
            <div className={classNames(
                "main-wrapper",
                "main-wrapper-responsive-lg"
            )}>
                {children}
            </div>
        </div>
    );
};

export default Layout;