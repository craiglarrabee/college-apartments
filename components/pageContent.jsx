import {Button, Modal} from "react-bootstrap";
import React, {useState} from "react";
import {Pencil} from "react-bootstrap-icons";
import classNames from "classnames";
import dynamic from "next/dynamic";

const SunEditor = dynamic(() => import("suneditor-react"), {ssr: false});

const PageContent = ({site, page, name, canEdit, initialContent}) => {
    const [show, setShow] = useState(false);
    const [content, setContent] = useState(initialContent);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    if (canEdit) {
        return (
            <div className={classNames("custom-content")}>
                <div className={classNames("d-inline-flex", "custom-content")}>
                    <Button variant="primary-outline"
                            size="sm"
                            onClick={handleShow}

                    >
                        <Pencil/>
                    </Button>
                    <div dangerouslySetInnerHTML={{__html: content}}/>
                </div>
                <Editor show={show}
                        handleClose={handleClose}
                        title="Description Text"
                        initialContent={content}
                        setEditableText={setContent}
                        site={site}
                        page={page}
                        name={name}
                />
            </div>
        );
    } else {
        return (
            <div className={classNames("custom-content")}>
                <div className={classNames("d-inline-flex", "custom-content")}>
                    <div dangerouslySetInnerHTML={{__html: content}}/>
                </div>
            </div>
        );
    }
};

function Editor({show, handleClose, title, site, page, name, initialContent, setEditableText}) {
    const [content, setContent] = useState(initialContent);
    const json = {
        site: site,
        page: page,
        name: name
    };
    const saveContent = async () => {
        json.content = content;
        let resp = await fetch("/api/site-content", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(json)
        });
        console.log(resp.status);
        setEditableText(content);
        console.log(content);
        handleClose();
    };

    const editorOptions = {
        height: "250px",
        minHeight: "100px",
        maxHeight: "400px",
        plugins: [
            "align",
            "font",
            "fontColor",
            "fontSize",
            "formatBlock",
            "hiliteColor",
            "horizontalRule",
            "lineHeight",
            "list",
            "paragraphStyle",
            "link",
            "template",
            "textStyle",
            "table",
            "image"
        ],
        buttonList: [["undo", "redo"],
            ["font", "fontSize", "formatBlock"],
            ["paragraphStyle"],
            ["bold", "underline", "italic", "strike", "subscript", "superscript"],
            ["fontColor", "hiliteColor", "textStyle"],
            ["removeFormat"],
            "/", // Line break
            ["outdent", "indent"],
            ["align", "horizontalRule", "list", "lineHeight"],
            ["table","link","image"],
            ["showBlocks", "codeView"],
        ],
        resizingBar: true,
        resizeEnable: true,
    };

    return (
        <Modal show={show}
               onHide={handleClose}
               size="lg"
               aria-labelledby="contained-modal-title-vcenter"
               centered
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <SunEditor setOptions={editorOptions} autoFocus={true} defaultValue={content} onChange={setContent}/>
            </Modal.Body>

            <Modal.Footer>
                <Button size="sm" variant="secondary" onClick={handleClose}>Close</Button>
                <Button size="sm" variant="primary" onClick={saveContent}>Save changes</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PageContent;
