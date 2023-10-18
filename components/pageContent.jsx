import {Alert, Button, Form, Modal} from "react-bootstrap";
import React, {useMemo, useState} from "react";
import {Pencil} from "react-bootstrap-icons";
import classNames from "classnames";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), {ssr: false});

export const PageContent = ({site, page, name, canEdit, initialContent}) => {
    const [showEditor, setShowEditor] = useState(false);
    const [content, setContent] = useState(initialContent);

    const handleClose = () => setShowEditor(false);
    const handleShow = () => setShowEditor(true);

    if (canEdit) {
        return (
            <div className={classNames("custom-content")} style={{border: "3px dashed rgba(0, 0, 0, 0.5)"}}>
                <div className={classNames("d-inline-flex", "custom-content")}>
                    <Button role="edit" variant="primary-outline" size="sm" onClick={handleShow}>
                        <Pencil/>
                    </Button>
                    <div dangerouslySetInnerHTML={{__html: content}}/>
                </div>
                <Editor show={showEditor}
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

export const Editor = ({show, handleClose, title, site, page, name, initialContent, setEditableText}) => {
    const [content, setContent] = useState(initialContent);
    const [error, setError] = useState();
    const json = {
        site: site,
        page: page,
        name: name
    };
    const saveContent = async () => {
        json.content = content;
        let resp = await fetch(`/api/${site}/content/${page}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(json)
        });
        switch (resp.status) {
            case 200:
            case 204:
                setError(null);
                setEditableText(content);
                handleClose();
                break;
            case 400:
            case 500:
                setError(`Sorry, something went wrong saving your changes. ${resp.json()}`);
        }
    };

    const editorOptions = useMemo(() => (
        {
            readOnly: false,
            height: "250px",
            minHeight: "100px",
            maxHeight: "600px",
            toolbarAdaptive: false,
            buttons: ["undo", "redo",
                "font", "fontSize", "brush", "paragraph",
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
            <Modal.Header closeButton >
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body role="editor" >
                <JoditEditor
                    config={editorOptions}
                    tabIndex={1}
                    value={content}
                    onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                    onChange={newContent => {}}
                />
            </Modal.Body>

            <Modal.Footer>
                {error && <Alert variant="danger" >{error}</Alert>}
                <Button size="sm" variant="secondary" onClick={handleClose}>Close</Button>
                <Button role="save" size="sm" variant="primary" onClick={saveContent}>Save changes</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PageContent;
