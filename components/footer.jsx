import classNames from "classnames";

const Footer = ({bg, ...restOfProps}) => {
    const safeBg = bg ?? "light"; // default to a stable value to avoid hydration mismatches
    return (
        <div className={classNames("main-footer", `bg-${safeBg}`)}>We Accept Most Major Credit
            Cards! &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Free Internet!</div>
    );
};

export default Footer;