import {Navbar} from "react-bootstrap";
import classNames from "classnames";

const Title = ({bg, variant}) => {
    return (
        <Navbar className={classNames("main-header")} expand={true} bg={bg} variant={variant}>
            <Navbar.Brand className={classNames("module-float-left")}>presents: </Navbar.Brand>
        </Navbar>
    );
};

export default Title;