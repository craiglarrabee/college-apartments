import {Button, Modal} from "react-bootstrap";
import React, {useMemo, useRef, useState} from "react";
import {Pencil} from "react-bootstrap-icons";
import classNames from "classnames";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), {ssr: false});

const PageContent = ({site, page, name, canEdit, initialContent}) => {
    const [show, setShow] = useState(false);
    const [content, setContent] = useState(initialContent);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    if (canEdit) {
        return (
            <div className={classNames("custom-content")} style={{border: "3px dashed rgba(0, 0, 0, 0.5)"}}>
                <div className={classNames("d-inline-flex", "custom-content")}>
                    <Button variant="primary-outline" size="sm" onClick={handleShow}>
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
        console.log(content);
        let resp = await fetch(`/api/${site}/content/${page}`, {
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

    const editorOptions = useMemo(() => (
        {
            readOnly: false,
            height: "250px",
            minHeight: "100px",
            maxHeight: "400px",
            toolbarAdaptive: false,
            buttons: ["undo", "redo",
                "font", "fontSize", "paragraph",
                "bold", "underline", "italic", "strikethrough", "subscript", "superscript",
                "outdent", "indent",
                "align", "ul", "ol", "lineHeight",
                "table","link","image",
                "source"],
            resizingBar: true,
            resizeEnable: true,
            placeholder: "Start typing..."
        }),
        []
    );

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
                <JoditEditor
                    config={editorOptions}
                    tabIndex={1}
                    value={content}
                    onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                    onChange={newContent => {}}
                />
            </Modal.Body>

            <Modal.Footer>
                <Button size="sm" variant="secondary" onClick={handleClose}>Close</Button>
                <Button size="sm" variant="primary" onClick={saveContent}>Save changes</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PageContent;
