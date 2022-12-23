import {Button, Modal} from "react-bootstrap";
import React, {useState} from "react";
import {Pencil} from "react-bootstrap-icons";
import classNames from "classnames";
import dynamic from "next/dynamic";

const SunEditor = dynamic(() => import("suneditor-react"), {ssr: false});

const EditableText = ({initialContent, location}) => {
    const [show, setShow] = useState(false);
    const [content, setContent] = useState(initialContent);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <div className={classNames("custom-content")}>
            <div className={classNames("d-inline-flex")}>
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
                    location={location}
            />
        </div>
    );
};

function Editor({show, handleClose, title, location, initialContent, setEditableText}) {
    const [content, setContent] = useState(initialContent);
    const saveContent = () => {
        fetch("/api/main-content", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                location: location
            })
        }).then(r => console.log(r.status));
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
            "table"
        ],
        buttonList: [['undo', 'redo'],
            ['font', 'fontSize', 'formatBlock'],
            ['paragraphStyle'],
            ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
            ['fontColor', 'hiliteColor', 'textStyle'],
            ['removeFormat'],
            '/', // Line break
            ['outdent', 'indent'],
            ['align', 'horizontalRule', 'list', 'lineHeight'],
            ['table','link',],
            ['showBlocks', 'codeView'],
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

export default EditableText;
