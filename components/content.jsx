import React, {useState} from "react";
import classNames from "classnames";
import PageContent from "./pageContent";
import {Alert, Button, Carousel, Form, Modal} from "react-bootstrap";
import {Trash} from "react-bootstrap-icons";
import {useForm} from "react-hook-form";
import FileResizer from "react-image-file-resizer";
import Router from "next/router";

const Content = ({site, page, top, bottom, images, canEdit}) => {
    const [showUploader, setShowUploader] = useState(false);
    const [pageImages, setPageImages] = useState(images);
    const handleAddImage = () => {
        setShowUploader(true);
        console.log("here");
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
                    setPageImages(pageImages.filter(image => image !== fileName));
                    return;
                case 400:
                default:
                    alert("Error removing file.");
                    break;
            }

        } catch (e) {
            console.log(e);
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
                                            onClick={() => handleDeleteImage(site, page, image)}>
                                        <Trash/>
                                    </Button>
                                </div> : null;

                            return (
                                <Carousel.Item role="carousel-item" key={i}>
                                    {buttons}
                                    <img role="carousel-image" src={`/upload/images/${site}/${page}/${image}`} alt={image}
                                         width={"560px"} />
                                </Carousel.Item>
                            );
                        }
                    )}
                </Carousel> : null}
            <Uploader show={showUploader} handleClose={handleCloseUploader} title="Choose image to image" site={site}
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

    const handleFileChange = async (event) => {
        setFile(event.target.files[0]);
    }

    const uploadFile = async (data, uri, fileName, fileType) => {
        try {
            const options = {
                // The method is POST because we are sending data.
                method: "POST",
                headers: {
                    "Content-Type": fileType,
                    "Content-Length": uri.size
                },
                body: uri,
            }
            const resp = await fetch(`/api/util/image?fileName=${fileName}&site=${site}&page=${page}`, options);
            switch (resp.status) {
                case 204:
                    handleClose();
                    return;
                case 400:
                default:
                    break;
            }

        } catch (e) {
            console.log(e);
        }
    };

    const resizeFile = (data, callback) => {
        FileResizer.imageFileResizer(file, 600, 900, "JPEG", 75, 0, (uri) => {
            callback(data, uri, file.name, file.type)
        });
    };

    const onSubmit = async (data, event) => {
        event.preventDefault();
        resizeFile(data, uploadFile);
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
                                // lessThan10MB: files => files && files[0]?.size < 102400 || "Max filesize is 100KB",
                                acceptedFormats: files => !files ||
                                    ["image/jpeg", "image/png", "image/gif", "image/svg"].includes(
                                        files[0]?.type
                                    ) || "Only image files allowed",
                            }, onChange: handleFileChange
                        })} type="file" accept="image/*" placeholder="image" maxLength={1024}/>
                    </Form.Group>
                    <div style={{width: "100%"}}
                         className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                        <Button variant="primary" type="submit" disabled={!isDirty || !isValid}>Upload</Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default Content;