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
                        <EditableText initialContent={availability} location={location}/>
                    </div>
                    <Image src="/images/students.jpg" alt="students" width={650} height={350} priority={true}/>
                    <div className={classNames("d-flex", "justify-content-evenly")}>
                        <EditableText initialContent={description} location={location}/>
                    </div>
                </Content>
                <Footer bg={bg}/>
            </main>
        </Layout>

    );
};

export async function getStaticProps() {
    console.log(process.env);
    return {
        props: {
            availability: "",
            description: ""
        }
    }
}

export default Home;
