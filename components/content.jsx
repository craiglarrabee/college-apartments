import React from "react";
import classNames from "classnames";

const Content = ({children}) => {
    return (
        <div className={classNames("main-content")}>
            {children}
        </div>
    );
};

export default Content;