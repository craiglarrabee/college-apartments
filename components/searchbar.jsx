import {Button, Col, Container, Form, Row} from "react-bootstrap";
import React from "react";

export const SearchBar = ({click, change, ...restOfProps}) => {
    const handleKeypress = e => {
        if (e.keyCode === 13) {
            click();
        }
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col sm={10}>
                    <Form className="d-flex">
                        <Form.Control
                            type="search"
                            placeholder="Search for Tenant"
                            className="me-2"
                            aria-label="Search"
                            onChange={change}
                        />
                        <Button type="submit" onClick={click}>
                            Search
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default SearchBar;