import {Button, Col, Form, Row, Table} from "react-bootstrap";
import classNames from "classnames";
import React, {useEffect, useState} from "react";
import {Plus, Trash} from "react-bootstrap-icons";
import {useForm} from "react-hook-form";

const currency = Intl.NumberFormat("en-US", {style: 'currency', currency: 'USD', minimumFractionDigits: 2});

export const PaymentLineItems = ({
                                     register,
                                     errors,
                                     site,
                                     paymentItems,
                                     paymentTotal,
                                     setParentPaymentItems,
                                     setParentTotal
                                 }) => {

    const [lineItems, setLineItems] = useState(paymentItems);
    const [total, setTotal] = useState(paymentTotal);

    useEffect(() => {
        if (lineItems[lineItems.length-1].remove) {
             setLineItems([...lineItems.filter(item => !item.remove)]);
        }
    }, [lineItems]);

    const addItem = () => {
        const newItems = [...lineItems, {id: lineItems.length, description: "", amount: "", surcharge: "", unitPrice: "", adding:true}];
        setLineItems(newItems);
        setParentPaymentItems(newItems);
    };

    const updateLineItem = async (id, description, amount, surcharge, subtotal) => {
        const item = await lineItems[id];
        item.amount = amount;
        item.description = description;
        item.surcharge = surcharge;
        item.unitPrice = subtotal;
        setLineItems([...lineItems]);
        setParentPaymentItems([...lineItems]);
        const sum = currency.format(await lineItems.reduce((partialSum, item) => partialSum + (1 * item.unitPrice), 0));
        setTotal(sum);
        setParentTotal(sum);
    };

    const removeLineItem = (id) => {
        let newItems;
        let sum;

        if (lineItems.length === 1) {
            newItems = [{id: 0, description: "", amount: "", surcharge: "", unitPrice: ""}];
        } else {
            newItems = [...lineItems.filter(item => item.id !== id), {description: "", amount: "", surcharge: "", unitPrice: "", remove: true}];
        }
        newItems.map((item, i) => item.id = i);
        setLineItems(newItems);
        setParentPaymentItems(newItems);
        sum = currency.format(newItems.reduce((partialSum, item) => partialSum + (1 * item.unitPrice), 0));
        setTotal(sum);
        setParentTotal(sum);
    };

    const getSurcharge = (amt) => {
        if (site === "snow") {
            return Math.round(amt * 2.25) / 100;
        }
        return 0;
    };

    return (
        <>
            <Table style={{width: "100%"}}>
                <tbody style={{width: "90%"}}>
                {
                    lineItems.map((item, i) => (
                            <PaymentLineItem
                                register={register}
                                errors={errors}
                                site={site}
                                id={i}
                                updateLineItem={updateLineItem}
                                removeLineItem={removeLineItem}
                                getSurcharge={getSurcharge}
                                amt={item.amount}
                                desc={item.description}
                                chg={item.surcharge}
                                tot={item.unitPrice}
                            />
                        )
                    )}
                {lineItems.length >= 1 && lineItems[lineItems.length - 1]?.unitPrice > 0 && lineItems[lineItems.length - 1]?.description &&
                    <tr>
                        <td><Button variant="light" onClick={addItem}><Plus/></Button></td>
                        <td/>
                    </tr>
                }
                <tr>
                    <td>
                        <Row className={classNames("align-items-end")}>
                            <Col/>
                            <Form.Label as={Col} xs={1}>Total</Form.Label>
                            <Form.Group as={Col} xs={3} controlId={"orderTotal"}>
                                <Form.Control
                                    readOnly
                                    {...register("orderTotal")} type="text"
                                    value={total}/>
                            </Form.Group>
                        </Row>
                    </td>
                    <td/>
                </tr>
                </tbody>
            </Table>
        </>
    )
};
export const PaymentLineItem = ({
                                    site,
                                    id,
                                    updateLineItem,
                                    removeLineItem,
                                    getSurcharge,
                                    desc,
                                    amt,
                                    tot,
                                    chg
                                }) => {

    const {
        register,
        formState: {errors}
    } = useForm({mode: "all"});

    const [itemId, setItemId] = useState(id);
    const [amount, setAmount] = useState(amt);
    const [description, setDescription] = useState(desc);
    const [surcharge, setSurcharge] = useState(chg);
    const [total, setTotal] = useState(tot);
    const [displayDescInput, setDisplayDescInput] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const updateItem = async (id, description, amount, surcharge, subtotal) => {
        setIsUpdating(true);
        await updateLineItem(id, description, amount, surcharge, subtotal);
        setIsUpdating(false);
    };

    useEffect(() => {
        if(isUpdating) {
            setIsUpdating(false);
            return;
        }
        setItemId(id);
        setAmount(amt ? currency.format(amt) : "");
        setSurcharge(chg ? currency.format(chg) : "");
        setTotal(tot ? currency.format(tot) : "");
        setDescription(desc);
    }, [id, desc, amt, chg]);

    const handleChangeAmount = (event, formatAmount = false) => {
        let amt = event.target.value.replaceAll(/[^.,\d]/g, "").replaceAll(",", "").replaceAll("$", "");
        let chg = getSurcharge(amt);
        let tot = (1 * amt) + (chg);

        setSurcharge(currency.format(chg));
        setTotal(currency.format(tot));
        if (formatAmount) {
            setAmount(currency.format(amt));
        } else {
            setAmount(amt);
        }
        updateItem(itemId, description, amt, chg, tot);
    };

    const handleChangeDescription = (event) => {
        let amt = amount.replaceAll(",", "").replace("$", "");
        let chg = getSurcharge(amt);
        let tot = (1 * amt) + (chg);

        setDescription(event.target.value);
        if (event.target.value === "Other")
            setDisplayDescInput(true);

        updateItem(itemId, event.target.value, amt, chg, tot);
    };

    const remove = () => {
        removeLineItem(itemId);
    };

    return (
        <>
            <tr className="align-middle">
                <td>
                    <Row>
                        <Col><Button variant="light" onClick={remove}><Trash/></Button></Col>
                        <Form.Label as={Col} xs={2} className="required">Description</Form.Label>
                        <Form.Group as={Col} xs={8} controlId={`description_${itemId}`}>
                            {displayDescInput ?
                                <Form.Control
                                    className={errors && errors[`description_${itemId}`] && classNames("border-danger")} {...register(`description_${itemId}`, {
                                    required: {
                                        value: true,
                                        message: "Required"
                                    }, maxLength: 250,
                                })} type="text"
                                    placeholder="Reason for payment"
                                    onChange={handleChangeDescription}
                                    value={description}
                                    defaultValue={""}
                                />
                                :
                                <Form.Select
                                    className={errors && errors[`description_${itemId}`] && classNames("border-danger")} {...register(`description_${itemId}`, {
                                    required: {
                                        value: true,
                                        message: "Description is required."
                                    }
                                })}
                                    onChange={handleChangeDescription}
                                    type="text"
                                    placeholder="Description"
                                    value={description}>
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
                            {errors && errors[`description_${itemId}`] &&
                                <Form.Text
                                    className={classNames("text-danger")}>{errors && errors[`description_${itemId}`].message}</Form.Text>
                            }
                        </Form.Group>
                    </Row>
                    <br/>
                    <Row>
                        <Col/>
                        <Form.Label className="required" as={Col} xs={1}>Amnt</Form.Label>
                        <Form.Group as={Col} xs={3} controlId={`amount_${itemId}`}>
                            <Form.Control
                                className={errors && errors[`amount_${itemId}`] && classNames("border-danger")}
                                {...register(`amount_${itemId}`, {
                                pattern: {
                                    value: /^\$?\d{0,2},?\d{0,3}(\.?\d{0,2})?$/,
                                    message: "Must be a valid amount between 1.00 and 99999.99"
                                },
                                required: {
                                    value: true,
                                    message: "Amount is required."
                                },
                                onChange: (event) => {
                                    handleChangeAmount(event);
                                },
                                onBlur: (event) => {
                                    handleChangeAmount(event, true);
                                }
                            })} type="text"
                                value={amount}
                                placeholder="Amount"/>
                            {errors && errors[`amount_${itemId}`] && <Form.Text
                                className={classNames("text-danger")}>{errors && errors[`amount_${itemId}`].message}</Form.Text>}
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
                </td>
            </tr>
        </>
    )
}
