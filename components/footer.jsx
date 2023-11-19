import classNames from "classnames";

const Footer = ({bg, ...restOfProps }) => {
    return (
        <div className={classNames("main-footer", `bg-${bg}`)}>We Accept Most Major Credit Cards! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Free Internet!</div>
    );
};

export default Footer;