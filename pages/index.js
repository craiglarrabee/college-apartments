import Layout from "../components/layout";
import Navigation from "../components/navigation";
import Title from "../components/title";
import Footer from "../components/footer";
import React from "react";
import Content from "../components/content";
import Image from "next/image";

export default function Home() {
    const bg = "black";
    const variant = "dark";
    const brandUrl = "http://www.utahcollegeapartments.com"

    return (
        <Layout>
            <Title bg={bg} variant={variant}></Title>
            <Navigation bg={bg} variant={variant} brandUrl={brandUrl}></Navigation>
            <main>
                <Content>
                    <Image src="/images/students.jpg" alt="students" width={650} height={350} priority={true} ></Image>
                </Content>
                <Footer bg={bg}></Footer>
            </main>
        </Layout>
    )
}
