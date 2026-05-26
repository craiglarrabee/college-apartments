import React, {useState} from "react";
import {Alert, Button, Col, Form, Modal, Row, Table} from "react-bootstrap";
import {Plus, Trash, Pencil} from "react-bootstrap-icons";

const currency = Intl.NumberFormat("en-US", {style: 'currency', currency: 'USD', minimumFractionDigits: 2});

const ManagePaymentItems = ({userId, site, initialItems = []}) => {
    const [show, setShow] = useState(false);
    const [items, setItems] = useState(initialItems);
    const [editingItem, setEditingItem] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleClose = () => {
        setShow(false);
        setEditingItem(null);
    };

    const handleShow = (item = null) => {
        setEditingItem(item);
        setShow(true);
    };

    const handleSave = async (formData) => {
        try {
            const method = editingItem ? "PUT" : "POST";
            const body = editingItem
                ? {...formData, id: editingItem.id}
                : formData;

            const response = await fetch(`/api/users/${userId}/payment-items?site=${site}`, {
                method,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error("Failed to save payment item");
            }

            // Refresh items
            const itemsResponse = await fetch(`/api/users/${userId}/payment-items?site=${site}`);
            const updatedItems = await itemsResponse.json();
            setItems(updatedItems);

            setSuccess(editingItem ? "Payment item updated successfully" : "Payment item added successfully");
            handleClose();
        } catch (e) {
            setError(e.message);
            console.error(`${new Date().toISOString()} -`, e);
        }
    };

    const handleDelete = async (itemId) => {
        try {
            const response = await fetch(`/api/users/${userId}/payment-items?site=${site}`, {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: itemId})
            });

            if (!response.ok) {
                throw new Error("Failed to delete payment item");
            }

            // Refresh items
            const itemsResponse = await fetch(`/api/users/${userId}/payment-items?site=${site}`);
            const updatedItems = await itemsResponse.json();
            setItems(updatedItems);

            setSuccess("Payment item deleted successfully");
            setShowDeleteModal(false);
            setItemToDelete(null);
        } catch (e) {
            setError(e.message);
            console.error(`${new Date().toISOString()} -`, e);
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleShowDeleteModal = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setItemToDelete(null);
    };

    const unpaidItems = items.filter(item => !item.is_paid && !item.date_deleted);
    const paidItems = items.filter(item => item.is_paid);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="primary" onClick={() => handleShow()}>
                    <Plus/> Add Payment Item
                </Button>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <h5>Unpaid Items</h5>
            {unpaidItems.length === 0 ? (
                <p className="text-muted">No unpaid payment items</p>
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {unpaidItems.map(item => (
                            <tr key={item.id}>
                                <td>{item.description}</td>
                                <td>{currency.format(item.amount)}</td>
                                <td>{item.due_date || 'N/A'}</td>
                                <td>{item.date_created}</td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleShow(item)}
                                    >
                                        <Pencil/>
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleShowDeleteModal(item)}
                                    >
                                        <Trash/>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {paidItems.length > 0 && (
                <>
                    <h5 className="mt-4">Paid Items</h5>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Transaction ID</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paidItems.map(item => (
                                <tr key={item.id}>
                                    <td>{item.description}</td>
                                    <td>{currency.format(item.amount)}</td>
                                    <td>{item.paid_trans_id}</td>
                                    <td>{item.date_created}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}

            <PaymentItemModal
                show={show}
                handleClose={handleClose}
                handleSave={handleSave}
                item={editingItem}
            />

            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Payment Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this payment item?</p>
                    {itemToDelete && (
                        <div className="bg-light p-3 rounded">
                            <strong>Description:</strong> {itemToDelete.description}<br/>
                            <strong>Amount:</strong> {currency.format(itemToDelete.amount)}
                        </div>
                    )}
                    <p className="text-danger mt-3">This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(itemToDelete?.id)}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const PaymentItemModal = ({show, handleClose, handleSave, item}) => {
    const [description, setDescription] = useState(item?.description || "");
    const [amount, setAmount] = useState(item?.amount || "");
    const [dueDate, setDueDate] = useState(item?.due_date ? formatDateForInput(item.due_date) : "");
    const [showOtherInput, setShowOtherInput] = useState(false);

    // Check if the item description is one of the predefined options
    const predefinedOptions = [
        "Deposit", "Deposit Re-Up", "Fall Rent", "Spring Rent", "Summer Rent",
        "Parking Sticker", "Early Days", "Monthly Rent",
        "Payment Plan Fee", "Utility Overage", "Late Fee"
    ];

    React.useEffect(() => {
        if (item) {
            setDescription(item.description);
            setAmount(item.amount);
            setDueDate(item.due_date ? formatDateForInput(item.due_date) : "");
            // Check if description is a custom value (not in predefined list)
            setShowOtherInput(!predefinedOptions.includes(item.description));
        } else {
            setDescription("");
            setAmount("");
            setDueDate("");
            setShowOtherInput(false);
        }
    }, [item, show]);

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        if (value === "Other") {
            setShowOtherInput(true);
            setDescription("");
        } else {
            setShowOtherInput(false);
            setDescription(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSave({
            description,
            amount: parseFloat(amount),
            dueDate: dueDate || null
        });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{item ? "Edit" : "Add"} Payment Item</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>Description</Form.Label>
                        <Col sm={9}>
                            {showOtherInput ? (
                                <Form.Control
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Reason for payment"
                                    maxLength={250}
                                    required
                                />
                            ) : (
                                <Form.Select
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    required
                                >
                                    <option value="" disabled>Select Payment Reason</option>
                                    <option value="Deposit">Deposit</option>
                                    {site === "snow" && <option value="Deposit Re-Up">Deposit Re-Up</option>}
                                    <option value="Fall Rent">Fall Rent</option>
                                    <option value="Spring Rent">Spring Rent</option>
                                    <option value="Summer Rent">Summer Rent</option>
                                    <option value="Parking Sticker">Parking Sticker</option>
                                    <option value="Early Days">Early Days</option>
                                    <option value="Monthly Rent">Monthly Rent (IF ON AUTHORIZED PAYMENT PLAN W/ PARENT GUARANTY)</option>
                                    <option value="Payment Plan Fee">Payment Plan Fee</option>
                                    <option value="Utility Overage">Utility Overage</option>
                                    <option value="Late Fee">Late Fee</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            )}
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>Amount</Form.Label>
                        <Col sm={9}>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>Due Date</Form.Label>
                        <Col sm={9}>
                            <Form.Control
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                            <Form.Text className="text-muted">
                                Optional - Leave blank for no due date
                            </Form.Text>
                        </Col>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        {item ? "Update" : "Add"} Payment Item
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

// Helper function to format date from MM/DD/YYYY to YYYY-MM-DD for input
function formatDateForInput(dateStr) {
    if (!dateStr) return "";
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export default ManagePaymentItems;

