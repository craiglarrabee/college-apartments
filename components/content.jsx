import React from "react";
import classNames from "classnames";
import PageContent from "./pageContent";
import {Carousel} from "react-bootstrap";
import Image from "next/image";

const Content = ({site, page, top, bottom, images, canEdit}) => {
    return (
        <div className={classNames("main-content")}>
            <PageContent
                initialContent={top}
                site={site}
                page={page}
                name="top"
                canEdit={canEdit}/>
            {images && images.length ? <Carousel role="carousel" variant="dark" wrap={true} interval={3000}>
                {images.map((image, i) => {
                        return (
                            <Carousel.Item role="carousel-item" key={i}>
                                <Image role="carousel-image" src={`/images/${site}/${page}/${image}`} alt={image} width="650" height="425" priority={true}/>
                            </Carousel.Item>
                        );
                    }
                )}
            </Carousel> : null}
            {bottom ? <PageContent
                initialContent={bottom}
                site={site}
                page={page}
                name="bottom"
                canEdit={canEdit}/> : null}
        </div>
    );
};

export default Content;