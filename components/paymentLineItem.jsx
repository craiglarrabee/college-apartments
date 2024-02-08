import {Button, Col, Form, Row} from "react-bootstrap";
import classNames from "classnames";
import React, {useState} from "react";
import {Trash} from "react-bootstrap-icons";

const currency = Intl.NumberFormat("en-US", {style: 'currency', currency: 'USD', minimumFractionDigits: 2});

export const PaymentLineItem = ({
                                    register,
                                    errors,
                                    site,
                                    getSurcharge,
                                    itemId,
                                    updateItem,
                                    removeItem
                                }) => {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("")
    const [surcharge, setSurcharge] = useState("");
    const [total, setTotal] = useState("");
    const [displayDescInput, setDisplayDescInput] = useState(false);

    const formatAmount = (event) => {
        let amt = event.target.value.replaceAll(",", "").replace("$", "");
        let chg = getSurcharge(amt);
        let tot = (1 * amt) + (chg);

        setSurcharge(currency.format(chg));

        setTotal(currency.format(tot));
        updateItem(itemId, description, tot);
    };

    const handleChangeDescription = (event) => {
        setDescription(event.target.value);
        if (event.target.value === "Other")
            setDisplayDescInput(true);
    };

    const remove = () => {
        setDescription("");
        setAmount("");
        setTotal("");
        setSurcharge("");
        removeItem(itemId);
    }

    return (
        <>
            <Row>
                <Col><Button variant="ligth" onClick={remove}><Trash/></Button></Col>
                <Form.Label as={Col} xs={2} className="required">Description</Form.Label>
                <Form.Group as={Col} xs={8} controlId={`description_${itemId}`}>
                    {displayDescInput ?
                        <Form.Control
                            className={errors && errors.description && classNames("border-danger")} {...register(`description_${itemId}`, {
                            required: {
                                value: true,
                                message: "Required"
                            }, maxLength: 250
                        })} type="text"
                            placeholder="Reason for payment"/>
                        :
                        <Form.Select
                            className={errors && errors.description && classNames("border-danger")} {...register(`description_${itemId}`, {
                            required: {
                                value: true,
                                message: "Description is required."
                            }
                        })}
                            onChange={handleChangeDescription}
                            type="text" placeholder="Description" value={description}>
                            <option value="" disabled>Select Payment Reason</option>
                            <option value="Deposit">Deposit</option>
                            <option value="Fall Rent">Fall Rent</option>
                            <option value="Spring Rent">Spring Rent</option>
                            <option value="Summer Rent">Summer Rent</option>
                            <option value="Parking Sticker">Parking Sticker</option>
                            <option value="Early Days">Early Days</option>
                            <option value="Monthly Rent">Monthly Rent (IF ON AUTHORIZED PAYMENT PLAN W/ PARENT
                                GUARANTY)
                            </option>
                            <option value="Payment Plan Fee">Payment Plan Fee</option>
                            <option value="Utility Overage">Utility Overage</option>
                            <option value="Late Fee">Late Fee</option>
                            <option value="Other">Other</option>
                        </Form.Select>
                    }
                    {errors && errors.description && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.description.message}</Form.Text>}
                </Form.Group>
            </Row>
            <br/>
            <Row>
                <Col/>
                <Form.Label className="required" as={Col} xs={1}>Amnt</Form.Label>
                <Form.Group as={Col} xs={3} controlId={`amount_${itemId}`}>
                    <Form.Control
                        className={errors && errors.amount && classNames("border-danger")} {...register(`amount_${itemId}`, {
                        pattern: {
                            value: /^\$?\d{0,2},?\d{0,3}(\.?\d{0,2})?$/,
                            message: "Must be a valid amount between $1.00 and $99999.99"
                        },
                        required: {
                            value: true,
                            message: "Must be a valid amount between $1.00 and $99999.99"
                        },
                        onChange: (event) => {
                            setAmount(event.target.value);
                            formatAmount(event);
                        },
                        onBlur: (event) => {
                            formatAmount(event);
                            setAmount(currency.format(event.target.value));
                        }
                    })} type="text"
                        value={amount}
                        placeholder="Amount"/>
                    {errors && errors.amount && <Form.Text
                        className={classNames("text-danger")}>{errors && errors.amount.message}</Form.Text>}
                </Form.Group>
                {site === "snow" ?
                    <>
                        <Form.Label as={Col} xs={1}
                                    style={{marginRight: "5px"}}>Surchg</Form.Label>
                        <Form.Group as={Col} xs={2} controlId={`surcharge_${itemId}`}>
                            <Form.Control
                                readOnly
                                {...register(`surcharge_${itemId}`)} type="text"
                                value={surcharge}/>
                        </Form.Group>
                    </> :
                    <>
                    </>
                }
                <Form.Label as={Col} xs={1}>Subtotal</Form.Label>
                <Form.Group as={Col} xs={3} controlId={`total_${itemId}`}>
                    <Form.Control
                        readOnly
                        {...register(`total_${itemId}`)} type="text"
                        value={total}/>
                </Form.Group>
            </Row>
        </>
    )
}
