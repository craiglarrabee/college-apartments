import React, {useState} from "react";
import classNames from "classnames";
import PageContent from "./pageContent";
import {Alert, Button, Carousel, Form, Modal, Spinner, Image} from "react-bootstrap";
import {Trash} from "react-bootstrap-icons";
import {useForm} from "react-hook-form";
import FileResizer from "react-image-file-resizer";
import Router from "next/router";

const Content = ({site, page, top, bottom, images, canEdit, restOfProps}) => {
    images = images?.map(image => {
        return {name: image, value: restOfProps[image]}
    });
    if (!images) images = [];
    if (canEdit && !images.length) {
        images.push({name: "empty", value: null});
    }

    const [showUploader, setShowUploader] = useState(false);
    const [pageImages, setPageImages] = useState(images);
    const handleAddImage = () => {
        setShowUploader(true);
    };

    const handleDeleteImage = async (site, page, fileName) => {
        try {
            const options = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            }
            const resp = await fetch(`/api/util/image?fileName=${fileName}&site=${site}&page=${page}`, options);
            switch (resp.status) {
                case 204:
                    setPageImages(pageImages.filter(image => image.name !== fileName));
                    return;
                case 400:
                default:
                    alert("Error removing file.");
                    break;
            }

        } catch (e) {
            console.error(e);
        }
    };

    const handleCloseUploader = () => {
        setShowUploader(false);
        Router.reload();
    }

    return (
        <div className={classNames("main-content")}>
            <PageContent
                initialContent={top}
                site={site}
                page={page}
                name="top"
                canEdit={canEdit}/>
            {pageImages && pageImages.length ?
                <Carousel role="carousel" variant="dark" wrap={true} interval={5000} pause={canEdit ? "hover" : false}>
                    {pageImages.map((image, i) => {
                            let buttons = canEdit ?
                                <div>
                                    <Button role="edit" variant="primary-outline" size="lg"
                                            style={{fontSize: "xx-large"}} onClick={handleAddImage}>
                                        +
                                    </Button>
                                    <Button role="edit" variant="primary-outline" size="lg"
                                            onClick={() => handleDeleteImage(site, page, image.name)}>
                                        <Trash/>
                                    </Button>
                                </div> : null;

                            return (
                                <Carousel.Item role="carousel-item" key={i}>
                                    {buttons}
                                    {
                                        // all images on this site are converted to jpg
                                        // everything else in thes folders are videos

                                        image.name !== null ?
                                            <Image role="carousel-image"
                                                   src={`/upload/images/${site}/${page}/${image.name}`} alt={image.name}/> :
                                            <></>
                                    }
                                    <Carousel.Caption>
                                        <PageContent
                                            initialContent={image.value}
                                            site={site}
                                            page={page}
                                            name={image.name}
                                            canEdit={canEdit}/>
                                    </Carousel.Caption>
                                    <div style={{height: "90px"}}></div>
                                </Carousel.Item>
                            );
                        }
                    )}
                </Carousel> : null}
            <Uploader show={showUploader} handleClose={handleCloseUploader} title="Choose image to upload" site={site}
                      page={page}/>
            {bottom ? <PageContent
                initialContent={bottom}
                site={site}
                page={page}
                name="bottom"
                canEdit={canEdit}/> : null}
        </div>
    );
};

function Uploader({handleClose, title, show, site, page}) {
    const {register, formState: {isValid, isDirty, errors}, handleSubmit} = useForm({mode: "onChange"});
    const [file, setFile] = useState();
    const [showSpinner, setShowSpinner] = useState(false);

    const handleFileChange = async (event) => {
        setFile(event.target.files[0]);
    }

    const uploadVideo = async (data) => {
        const formData = new FormData();
        formData.append(data.image[0].name, data.image[0]);
        try {
            const options = {
                // The method is POST because we are sending data.
                method: "POST",
                body: formData,
            }
            const resp = await fetch(`/api/util/video?site=${site}&page=${page}`, options);
            switch (resp.status) {
                case 204:
                    setShowSpinner(false);
                    handleClose();
                    return;
                case 400:
                default:
                    setShowSpinner(false);
                    errors.images = {message: resp.body};
                    break;
            }

        } catch (e) {
            console.error(e);
        }
    };
    const uploadImage = async (data, uri, fileName, fileType) => {
        try {
            const options = {
                // The method is POST because we are sending data.
                method: "POST",
                headers: {
                    "Content-Type": fileType,
                    "Content-Length": uri.size
                },
                body: uri || formData,
            }
            const resp = await fetch(`/api/util/image?fileName=${fileName}&site=${site}&page=${page}`, options);
            switch (resp.status) {
                case 204:
                    setShowSpinner(false);
                    handleClose();
                    return;
                case 400:
                default:
                    setShowSpinner(false);
                    errors.images = {message: resp.body};
                    break;
            }

        } catch (e) {
            console.error(e);
        }
    };

    const resizeFile = (data, callback) => {
        FileResizer.imageFileResizer(file, 600, 900, "JPEG", 75, 0, (uri) => {
            callback(data, uri, file.name, file.type)
        });
    };

    const onSubmit = async (data, event) => {
        event.preventDefault();
        setShowSpinner(true);
        if (file.type.toLowerCase().startsWith("image")) {
            resizeFile(data, uploadImage);
        } else {
            uploadVideo(data);
        }
    };

    return (
        <Modal show={show}
               onHide={handleClose}
               size="lg"
               aria-labelledby="contained-modal-title-vcenter"
               centered
               enforceFocus={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)} method="post">
                    {!isValid && errors && errors.image && <Alert variant="danger">{errors.image.message}</Alert>}
                    <Form.Group className="mb-3" controlId="image">
                        <Form.Label visuallyHidden={true}>Image</Form.Label>
                        <Form.Control {...register("image", {
                            validate: {
                                lessThan10MB: files => files && files[0]?.size < 20971520 || "Max filesize is 20MB",
                                acceptedFormats: files => !files ||
                                    ["image/jpeg", "image/png", "image/gif", "image/svg"].includes(
                                        files[0]?.type
                                    ) || "Only image files allowed",
                            }, onChange: handleFileChange
                        })} type="file" accept={["image/*"]} placeholder="image" maxLength={1024}/>
                    </Form.Group>
                    <div style={{width: "100%"}}
                         className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                        {showSpinner ?
                            <Spinner variant="primary"></Spinner> :
                            <Button variant="primary" type="submit" disabled={!isDirty || !isValid}>Upload</Button>
                        }
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default Content;