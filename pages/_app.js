import "../styles/globals.scss";
import {SSRProvider} from "react-bootstrap";

function UtahCollegeApartmentsApp({Component, pageProps}) {
    return <SSRProvider><Component {...pageProps} /></SSRProvider>;
}

export default UtahCollegeApartmentsApp
