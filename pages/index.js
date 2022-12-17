import Layout from "../components/layout";
import Menu from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import Content from "../components/content";
import Image from "next/image";

export default () => {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com"

    return (
        <Layout>
            <Title bg={bg} variant={variant} brandUrl={brandUrl}></Title>
            <Menu bg={bg} variant={variant} brandUrl={brandUrl}></Menu>
            <main>
                <Content>
                    <Image src="/images/students.jpg" alt="students" width={650} height={350} priority={true} ></Image>
                </Content>
                <Footer bg={bg}></Footer>
            </main>
        </Layout>
    )
}
