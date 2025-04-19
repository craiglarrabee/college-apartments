import React, { useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

const ConfirmField = ({ name, label, value, register, errors, setValue }) => {
    useEffect(() => {
        setValue(`confirm_${name}`, '');
    }, [name, setValue]);

    return (
        <Row>
            <Form.Group as={Col} className="mb-3" controlId={`confirm_${name}`}>
                <Form.Label className="required">Confirm {label}</Form.Label>
                <Form.Control
                    className={errors && errors[`confirm_${name}`] && classNames("border-danger")}
                    {...register(`confirm_${name}`, {
                        required: true,
                        validate: (confirmValue) => confirmValue === value || `Must match ${label}`
                    })}
                    type="text"
                    placeholder={`Confirm ${label}`}
                />
                {errors && errors[`confirm_${name}`] && (
                    <Form.Text className={classNames("text-danger")}>
                        {errors[`confirm_${name}`].message}
                    </Form.Text>
                )}
            </Form.Group>
        </Row>
    );
};

export default ConfirmField;