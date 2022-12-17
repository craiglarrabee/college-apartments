import React, {useState} from "react";
import Image from "next/image";
import Layout from "../components/layout";
import Menu from "../components/navigation";
import Footer from "../components/footer";
import Content from "../components/content";
import classNames from "classnames";
import EditableText from "../components/editableText";
import Title from "../components/title";

export default (props) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com"
    const [managerOne, setManagerOne] = useState(props.managerOneText);
    const [managerTwo, setManagerTwo] = useState("");
    const [availabilityContent, setAvailabilityContent] = useState("");
    const [descriptionContent, setDescriptionContent] = useState("");

    return (
        <Layout>
            <Title bg={bg} variant={variant} brandUrl={brandUrl}/>
            <Menu bg={bg} variant={variant} brandUrl={brandUrl}/>
            <main>
                <Content>
                    <div className={classNames("d-flex", "justify-content-evenly")}>
                        <EditableText initialContent={managerOne} />
                        <EditableText initialContent={managerTwo} />
                    </div>
                    <EditableText initialContent={availabilityContent} />
                    <Image src="/images/students.jpg" alt="students" width={650} height={350} priority={true} />
                    <EditableText initialContent={descriptionContent} />
                </Content>
                <Footer bg={bg}/>
            </main>
        </Layout>

    );
}

export async function getStaticProps() {
    return {
        props: {
            managerOneText: "This is a test"
        }
    }
}
