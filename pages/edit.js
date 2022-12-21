import React from "react";
import Image from "next/image";
import Layout from "../components/layout";
import Menu from "../components/navigation";
import Footer from "../components/footer";
import Content from "../components/content";
import classNames from "classnames";
import EditableText from "../components/editableText";
import Title from "../components/title";

const Home = (props) => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com"
    const managerOne = props.managerOne;
    const managerTwo = props.managerTwo;
    const availability = props.availability;
    const description = props.description;
    const location = "suu";

    return (
        <Layout>
            <Title bg={bg} variant={variant} brandUrl={brandUrl}/>
            <Menu bg={bg} variant={variant} brandUrl={brandUrl}/>
            <main>
                <Content>
                    <div className={classNames("d-flex", "justify-content-evenly")}>
                        <EditableText initialContent={managerOne} location={location} />
                        <EditableText initialContent={managerTwo} location={location} />
                    </div>
                    <EditableText initialContent={availability} location={location} />
                    <Image src="/images/students.jpg" alt="students" width={650} height={350} priority={true} />
                    <EditableText initialContent={description} location={location} />
                </Content>
                <Footer bg={bg}/>
            </main>
        </Layout>

    );
};

export async function getStaticProps() {
    return {
        props: {
            managerOne: "This is a test",
            managerTwo: "",
            availability: "",
            description: ""
        }
    }
}

export default Home;
