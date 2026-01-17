import Layout from "../../components/layout";
import dynamic from "next/dynamic";
const Navigation = dynamic(() => import("../../components/navigation"), { ssr: false });
import Title from "../../components/title";
import Footer from "../../components/footer";
import React, {useEffect, useState} from "react";
import classNames from "classnames";
import {Alert, Button, Modal, Form, Tab, Table, Tabs, ProgressBar} from "react-bootstrap";
import {GetNavLinks} from "../../lib/db/content/navLinks";
import {withIronSessionSsr} from "iron-session/next";
import {ironOptions} from "../../lib/session/options";
import {GetTenant, GetUserRoomates} from "../../lib/db/users/tenant";
import {GetUserMaintenanceRequests} from "../../lib/db/users/maintenance";
import {TenantForm} from "../../components/tenantForm";
import ApplicationForm from "../../components/applicationForm";
import {GetTenantApplications} from "../../lib/db/users/application";
import {GetLeaseRoomsMap, GetUserAvailableLeaseRooms} from "../../lib/db/users/roomType";
import {GetTenantUserLeases} from "../../lib/db/users/userLease";
import LeaseForm from "../../components/leaseForm";
import {GetDynamicContent} from "../../lib/db/content/dynamicContent";
import {GetTenantBulkEmails} from "../../lib/db/users/bulkEmail";
import {GetUserDeletedPayments, GetUserPayments} from "../../lib/db/users/userPayment";
import {UserApartment} from "../../components/assignments";
import * as Constants from "../../lib/constants";
import GenericExplanationModal from "../../components/genericExplanationModal";
import NewApplicationForm from "../../components/newApplicationForm";
import UsernameForm from "../../components/usernameForm";
import PasswordForm from "../../components/passwordForm";
import {isBot} from "../../lib/bots";
import ManagePaymentItems from "../../components/managePaymentItems";
import {GetAllTenantPaymentItems} from "../../lib/db/users/tenantPaymentItems";

const SITE = process.env.SITE;
const bg = process.env.BG;
const variant = process.env.VARIANT;
const brandUrl = process.env.BRAND_URL;


const Tenant = ({
                    isTenant, site, isABot, navPage, links, user, tenant, currentLeasesMap,
                    applications, userId, leases, leaseContentMap, deletedPayments,
                    emails, applicationContent, payments, paymentItems, roommates, maintenanceRequests, tab, currentLeases, page,
                    rules, previous_rental, esa_packet, disclaimer, guaranty
                    , ...restOfProps
                }) => {
    const roommateSemesters = roommates.map(it => it.semester).reduce(function (acc, curr) {
        if (!acc.includes(curr))
            acc.push(curr);
        return acc;
    }, []);

    const [validPayments, setvalidPayments] = useState(payments);
    const [validDeletedPayments, setvalidDeletedPayments] = useState(deletedPayments);
    const [paymentError, setPaymentError] = useState();
    const [deleteData, setDeleteData] = useState({show: false, description: null});
    const [userInfoError, setUserInfoError] = useState();
    const [userInfoSuccess, setUserInfoSuccess] = useState();
    const [deleteUserError, setDeleteUserError] = useState();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Files tab state
    const [filesList, setFilesList] = useState([]);
    const [filesError, setFilesError] = useState();
    const [filesSuccess, setFilesSuccess] = useState();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({}); // key: filename -> percent
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [fileToRename, setFileToRename] = useState(null);
    const [newFileName, setNewFileName] = useState('');
    const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);

    const fetchFiles = async () => {
        try {
            const resp = await fetch(`/api/tenants/${userId}/files?site=${site}`);
            if (resp.ok) {
                const data = await resp.json();
                console.log('Fetched files:', data);
                setFilesList(data.files || []);
            } else {
                console.error('Failed to load files, status:', resp.status);
                setFilesError('Failed to load files.');
            }
        } catch (e) {
            console.error('Failed to load files, error:', e);
            setFilesError('Failed to load files.');
        }
    };

    // Format date as MM/DD/YYYY
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    useEffect(() => {
        // Load files on mount for admins only
        if (!isTenant) fetchFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpload = async (fileList) => {
        setFilesError(undefined);
        setFilesSuccess(undefined);
        if (!fileList || fileList.length === 0) return;
        // client-side checks for filename length and type
        const allowed = /^(image\/png|application\/pdf)$/;
        const maxMb = parseInt(process.env.FILE_UPLOAD_MAX_MB || '25', 10);
        const maxBytes = maxMb * 1024 * 1024;
        const rejected = [];
        const toUpload = [];
        for (const f of fileList) {
            if (f.name.length > 150) {
                rejected.push(`${f.name}: name must be <= 150 characters`);
                continue;
            }
            if (!allowed.test(f.type)) {
                rejected.push(`${f.name}: only PNGs and PDFs are allowed`);
                continue;
            }
            if (f.size > maxBytes) {
                rejected.push(`${f.name}: exceeds ${maxMb} MB`);
                continue;
            }
            toUpload.push(f);
        }
        if (rejected.length > 0) setFilesError(rejected.join("\n"));
        if (toUpload.length === 0) return;

        setUploading(true);
        const progress = {};
        setUploadProgress(progress);

        // Build a FormData with multiple files under the same field name 'file'
        const form = new FormData();
        toUpload.forEach(f => form.append('file', f));

        try {
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `/api/tenants/${userId}/files?site=${site}`);
                xhr.upload.onprogress = (evt) => {
                    if (evt.lengthComputable) {
                        const percent = Math.round((evt.loaded / evt.total) * 100);
                        setUploadProgress({ total: percent });
                    }
                };
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            // Check response for any errors in individual file results
                            try {
                                const response = JSON.parse(xhr.responseText);
                                if (response.results) {
                                    const errors = response.results.filter(r => r.status === 'error' || r.status === 'rejected');
                                    const successes = response.results.filter(r => r.status === 'created' || r.status === 'replaced');

                                    if (errors.length > 0) {
                                        console.warn('Some files failed:', errors);
                                        const errorMsg = errors.map(e => `${e.original_name}: ${e.reason || 'Unknown error'}`).join('\n');
                                        setFilesError(errorMsg);
                                    }

                                    if (successes.length > 0) {
                                        const successMsg = `Successfully uploaded ${successes.length} file(s): ${successes.map(s => s.original_name).join(', ')}`;
                                        setFilesSuccess(successMsg);
                                    }
                                } else {
                                    setFilesSuccess('Files uploaded successfully');
                                }
                            } catch (e) {
                                console.error('Failed to parse upload response:', e);
                                setFilesError(`Upload may have succeeded but response was unclear. Error: ${e.message}`);
                            }
                            resolve();
                        } else {
                            // Parse error response if possible
                            let errorMsg = 'Upload failed';
                            try {
                                const errorResponse = JSON.parse(xhr.responseText);
                                if (errorResponse.error) {
                                    errorMsg = `Upload failed: ${errorResponse.error}`;
                                }
                            } catch (e) {
                                if (xhr.responseText) {
                                    errorMsg = `Upload failed: ${xhr.responseText.substring(0, 200)}`;
                                } else {
                                    errorMsg = `Upload failed with status ${xhr.status}`;
                                }
                            }
                            reject(new Error(errorMsg));
                        }
                    }
                };
                xhr.send(form);
            });
            await fetchFiles();
        } catch (e) {
            setFilesError(e.message || 'Upload failed. Please try again.');
            console.error(`${new Date().toISOString()} - Upload error:`, e);
        } finally {
            setUploading(false);
            setUploadProgress({});
        }
    };

    const handleDownload = (id) => {
        window.open(`/api/tenants/${userId}/files/${id}/download?site=${site}`, '_blank');
    };

    const handleRename = async (file) => {
        setFileToRename(file);
        setNewFileName(file.original_name);
        setShowRenameModal(true);
    };

    const submitRename = async () => {
        if (!fileToRename) return;
        if (!newFileName || newFileName.trim() === '' || newFileName === fileToRename.original_name) {
            setShowRenameModal(false);
            return;
        }
        if (newFileName.length > 150) {
            setFilesError('Filename must be <= 150 characters');
            setShowRenameModal(false);
            return;
        }
        setFilesError(undefined);
        setFilesSuccess(undefined);
        setShowRenameModal(false);

        try {
            const resp = await fetch(`/api/tenants/${userId}/files/${fileToRename.id}?site=${site}`, {
                method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ newName: newFileName })
            });
            if (resp.ok) {
                setFilesSuccess(`Renamed "${fileToRename.original_name}" to "${newFileName}"`);
                await fetchFiles();
            } else if (resp.status === 409) {
                setFilesError('A file with that name already exists.');
            } else {
                const errorData = await resp.json().catch(() => ({}));
                setFilesError(`Rename failed: ${errorData.error || resp.statusText}`);
            }
        } catch (e) {
            setFilesError(`Rename failed: ${e.message}`);
            console.error(`${new Date().toISOString()} - Rename error:`, e);
        }
    };

    const handleReplace = async (file, newFile) => {
        if (!newFile) return;
        setFilesError(undefined);
        setFilesSuccess(undefined);
        const allowed = /^(image\/png|application\/pdf)$/;
        const maxMb = parseInt(process.env.FILE_UPLOAD_MAX_MB || '25', 10);
        const maxBytes = maxMb * 1024 * 1024;
        if (newFile.size > maxBytes) { setFilesError(`File too large. Max ${maxMb} MB`); return; }
        if (!allowed.test(newFile.type)) { setFilesError('Only PNG images and PDFs are allowed'); return; }
        const form = new FormData();
        form.append('file', newFile);
        try {
            const resp = await fetch(`/api/tenants/${userId}/files/${file.id}?site=${site}`, { method: 'PUT', body: form });
            if (resp.ok) {
                setFilesSuccess(`Successfully replaced "${file.original_name}"`);
                await fetchFiles();
            } else {
                const errorData = await resp.json().catch(() => ({}));
                setFilesError(`Replace failed: ${errorData.error || resp.statusText}`);
            }
        } catch (e) {
            setFilesError(`Replace failed: ${e.message}`);
            console.error(`${new Date().toISOString()} - Replace error:`, e);
        }
    };

    const handleDeleteFile = async (file) => {
        setFileToDelete(file);
        setShowDeleteFileModal(true);
    };

    const confirmDelete = async () => {
        if (!fileToDelete) return;
        setShowDeleteFileModal(false);
        setFilesError(undefined);
        setFilesSuccess(undefined);

        try {
            const resp = await fetch(`/api/tenants/${userId}/files/${fileToDelete.id}?site=${site}`, { method: 'DELETE' });
            if (resp.ok) {
                setFilesSuccess(`Successfully deleted "${fileToDelete.original_name}"`);
                await fetchFiles();
            } else {
                const errorData = await resp.json().catch(() => ({}));
                setFilesError(`Delete failed: ${errorData.error || resp.statusText}`);
            }
        } catch (e) {
            setFilesError(`Delete failed: ${e.message}`);
            console.error(`${new Date().toISOString()} - Delete error:`, e);
        } finally {
            setFileToDelete(null);
        }
    };

    tab = (tab === "Roommates") ? 3 : "info";

    useEffect(() => {
        async function process() {
            try {
                const options = {
                    method: "DELETE",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({id: deleteData.paymentId, reason: deleteData.description}),
                }

                const resp = await fetch(`/api/users/${user.id}/payment?site=${site}`, options)
                switch (resp.status) {
                    case 204:
                    case 200:
                        const payment = {
                            ...(validPayments.find(payment => payment.id === deleteData.paymentId)),
                            reason_deleted: deleteData.description,
                            date_deleted: new Date().toLocaleDateString()
                        };
                        setvalidPayments(validPayments.filter(payment => payment.id !== deleteData.paymentId));
                        setvalidDeletedPayments([...validDeletedPayments, payment]);
                        break;
                    case 400:
                    default:
                        setPaymentError("There was an error removing this payment. Please try again.");
                        break;
                }
            } catch (e) {
                setPaymentError("There was an error removing this payment. Please try again.");
                console.error(`${new Date().toISOString()} -` , e);
            }
        }

        if (deleteData.description && deleteData.paymentId) {
            process();
        }
    }, [deleteData.description]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleDeleteUser = async () => {
        try {
            const options = {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
            };

            const resp = await fetch(`/api/users/${userId}?site=${site}`, options);
            switch (resp.status) {
                case 204:
                case 200:
                    setUserInfoSuccess("User deleted successfully.");
                    setTimeout(() => {
                        window.location.href = `/tenants?site=${site}`;
                    }, 2000);
                    break;
                case 400:
                default:
                    setDeleteUserError("There was an error deleting the user. Please try again.");
                    break;
            }
        } catch (e) {
            setDeleteUserError("There was an error deleting the user. Please try again.");
            console.error(`${new Date().toISOString()} -` , e);
        }
    };

    return (
        <Layout site={site} user={user} wide={!isTenant}>
            <Navigation site={site} isBot={isABot} bg={bg} variant={variant} brandUrl={brandUrl} links={links}
                        page={navPage}/>
            <div style={{display: "flex", flexDirection: "column"}}>
                <Title site={site} bg={bg} variant={variant} brandUrl={brandUrl} initialUser={user}/>
                <main>
                    <div className={classNames("main-content")}>
                        <Tabs defaultActiveKey={tab}>
                            {/* Personal Info - Top Level */}
                            <Tab title="Personal Info" eventKey="info" key="info">
                                <TenantForm tenant={tenant} site={site} userId={userId} isTenant={isTenant}/>
                            </Tab>

                            {/* Roommates - Top Level (if available) */}
                            {roommateSemesters.length > 0 &&
                                <Tab title="Roommates" eventKey="roommates" key="roommates">
                                    <Tabs>
                                        {
                                            roommateSemesters.map(sem =>
                                                <Tab title={sem} eventKey={sem.replace(" ", "_")}
                                                     key={sem.replace(" ", "_")}>
                                                    {
                                                        <UserApartment
                                                            data={roommates.filter(tenant => sem === tenant.semester)}/>
                                                    }
                                                </Tab>)
                                        }
                                    </Tabs>
                                </Tab>
                            }

                            {/* Maintenance - Top Level (snow site only) */}
                            {maintenanceRequests && site === "snow" &&
                                <Tab title="Maintenance" eventKey="maintenance" key="maintenance">
                                    <Table>
                                        <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Apartment</th>
                                            <th>Room</th>
                                            <th>Request</th>
                                            <th>Status</th>
                                            <th>Closed Date</th>
                                            <th>Closed Comments</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {maintenanceRequests.map(row => (
                                            <tr key={row.id}>
                                                <td>{row.created_datetime}</td>
                                                <td>{row.apartment_number}</td>
                                                <td>{row.room}</td>
                                                <td style={{whiteSpace: 'pre-wrap'}}>{row.request}</td>
                                                <td>{row.closed_datetime ? 'Closed' : 'Open'}</td>
                                                <td>{row.closed_datetime || ''}</td>
                                                <td>{row.closed_comments || ''}</td>
                                            </tr>
                                        ))}
                                        {maintenanceRequests.length === 0 && (
                                            <tr>
                                                <td colSpan={7} style={{textAlign: 'center'}}>No maintenance requests.</td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </Table>
                                </Tab>
                            }

                            {/* Applications - Top Level */}
                            <Tab title="Applications" eventKey="applications" key="applications">
                                <Tabs defaultActiveKey={1}>
                                    {applications.map(application => {
                                        const currentLeases = currentLeasesMap.find(record => application.lease_id === record.leaseId).currentLeases;
                                        return (
                                            <Tab title={`${application.label}`}
                                                 eventKey={`${application.lease_id}_${application.room_type_id}`}
                                                 key={`${application.lease_id}_${application.room_type_id}`}>
                                                <ApplicationForm application={application}
                                                                 site={site}
                                                                 userId={userId}
                                                                 leaseId={application.lease_id}
                                                                 navPage={navPage}
                                                                 roomTypeId={application.room_type_id}
                                                                 currentLeases={currentLeases}
                                                                 isTenant={isTenant}
                                                                 {...applicationContent} />
                                            </Tab>);
                                    })}
                                    {currentLeases.length > 0 &&
                                        <Tab title="New Application"
                                             eventKey="new"
                                             key="new">
                                            <NewApplicationForm site={site}
                                                                tenant={tenant}
                                                                page={page}
                                                                userId={userId}
                                                                user={user}
                                                                canEdit={false}
                                                                disclaimer={disclaimer}
                                                                currentLeases={currentLeases}
                                                                esa_packet={esa_packet}
                                                                guaranty={guaranty}
                                                                rules={rules}
                                                                previous_rental={previous_rental}/>
                                        </Tab>
                                    }
                                </Tabs>
                            </Tab>

                            {/* Leases - Top Level */}
                            <Tab title="Leases" eventKey="leases" key="leases">
                                <Tabs defaultActiveKey={2}>
                                    {leases.map(lease => {
                                        const leaseContent = leaseContentMap.find(record => lease.lease_id === record.leaseId);
                                        const contentRows = leaseContent.content;
                                        const content = {};
                                        contentRows.forEach(row => content[row.name] = row.content);
                                        return (
                                            <Tab title={`${lease.label}`} eventKey={lease.lease_id}
                                                 key={lease.lease_id}>
                                                <LeaseForm lease={lease}
                                                           site={site}
                                                           userId={userId}
                                                           leaseId={lease.lease_id}
                                                           navPage={navPage}
                                                           rooms={leaseContent.rooms}
                                                           {...content}
                                                />
                                            </Tab>
                                        )
                                    })}
                                </Tabs>
                            </Tab>

                            {/* Payments (formerly Financial) */}
                            {(payments?.length > 0 || (!isTenant && site === "snow")) &&
                                <Tab title="Payments" eventKey="payments" key="payments">
                                    <Tabs defaultActiveKey={4}>
                                        {payments?.length > 0 &&
                                            <Tab title="History" eventKey={4} key={4}>
                                                {paymentError &&
                                                    <Alert dismissible onClose={() => setPaymentError(null)} variant={"danger"}
                                                           onClick={() => setPaymentError(null)}>{paymentError}</Alert>
                                                }
                                                {!isTenant &&
                                                    <GenericExplanationModal data={deleteData}
                                                                             accept={(description) => setDeleteData({
                                                                                 ...deleteData,
                                                                                 show: false,
                                                                                 description: description
                                                                             })} close={() => setDeleteData({
                                                        ...deleteData,
                                                        show: false
                                                    })}></GenericExplanationModal>
                                                }
                                                <Table>
                                                    <thead>
                                                    <tr>
                                                        <th>Trans ID</th>
                                                        <th>Date</th>
                                                        <th>Location</th>
                                                        <th>Amount</th>
                                                        <th>Type</th>
                                                        <th>Number</th>
                                                        <th>Description</th>
                                                        <th></th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {validPayments.map(row => (
                                                        <tr>
                                                            <td>{row.trans_id}</td>
                                                            <td>{row.date}</td>
                                                            <td>{Constants.locations[row.location]}</td>
                                                            <td>{row.amount}</td>
                                                            <td>{row.account_type}</td>
                                                            <td>{row.account_number}</td>
                                                            <td>{row.description}</td>
                                                            <td><Button onClick={() => setDeleteData({
                                                                show: true,
                                                                paymentId: row.id
                                                            })}>Delete</Button></td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </Table>
                                            </Tab>
                                        }
                                        {!isTenant && validDeletedPayments?.length > 0 &&
                                            <Tab title="Deleted Payments" eventKey={5} key={5}>
                                                <Table>
                                                    <thead>
                                                    <tr>
                                                        <th>Trans ID</th>
                                                        <th>Date Deleted</th>
                                                        <th>Amount</th>
                                                        <th>Type</th>
                                                        <th>Number</th>
                                                        <th>Reason</th>
                                                        <th></th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {validDeletedPayments.map(row => (
                                                        <tr>
                                                            <td>{row.trans_id}</td>
                                                            <td>{row.date_deleted}</td>
                                                            <td>{row.amount}</td>
                                                            <td>{row.account_type}</td>
                                                            <td>{row.account_number}</td>
                                                            <td>{row.reason_deleted}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </Table>
                                            </Tab>
                                        }
                                        {!isTenant && site === "snow" && false &&
                                            <Tab title="Manage Payment Items" eventKey={8} key={8}>
                                                <ManagePaymentItems userId={userId} site={site} initialItems={paymentItems || []} />
                                            </Tab>
                                        }
                                    </Tabs>
                                </Tab>
                            }

                            {/* Admin Tools Group */}
                            {!isTenant &&
                                <Tab title="Admin" eventKey="admin" key="admin">
                                    <Tabs defaultActiveKey={10}>
                                        <Tab title="User Information" eventKey={10} key={10}>
                                            {userInfoError &&
                                                <Alert variant={"danger"} dismissible
                                                       onClick={() => setUserInfoError(null)}>{userInfoError}</Alert>
                                            }
                                            {userInfoSuccess &&
                                                <Alert variant={"success"} dismissible
                                                       onClick={() => setUserInfoSuccess(null)}>{userInfoSuccess}</Alert>
                                            }
                                            {deleteUserError &&
                                                <Alert variant={"danger"} dismissible
                                                       onClick={() => setDeleteUserError(null)}>{deleteUserError}</Alert>
                                            }
                                            <div className="h4">{`Username: ${tenant.username}`}</div>
                                            <br/>
                                            <UsernameForm site={site} userId={userId} username={tenant.username}
                                                          setUserInfoError={setUserInfoError}
                                                          setUserInfoSuccess={setUserInfoSuccess}/>
                                            <PasswordForm site={site} userId={userId} admin={user.manageApartment}
                                                          username={tenant.username} setUserInfoError={setUserInfoError}
                                                          setUserInfoSuccess={setUserInfoSuccess}/>

                                            {!(tenant.admin) && !(tenant.manage) &&
                                                <>
                                                <Form>
                                                    <div style={{width: "100%"}}
                                                         className={classNames("mb-3", "justify-content-center", "d-inline-flex")}>
                                                        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete
                                                            User</Button>
                                                    </div>
                                                </Form>
                                                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                                                    <Modal.Header closeButton>
                                                        <Modal.Title>Warning: Delete User</Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <p>Deleting this user will remove the following:</p>
                                                        <ul>
                                                            <li>User account</li>
                                                            <li>Tenant information</li>
                                                            {leases.length > 0 && <li>{leases.length} Lease associations</li>}
                                                            {payments.length > 0 && <li>{payments.length} Payment records</li>}
                                                            {applications.length > 0 && <li>{applications.length} Applications</li>}
                                                            {emails.length > 0 && <li>{emails.length} Emails</li>}
                                                        </ul>
                                                        <p>This action is irreversible. Are you sure you want to proceed?</p>
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button variant="danger" onClick={() => {
                                                            setShowDeleteModal(false);
                                                            handleDeleteUser();
                                                        }}>
                                                            Delete User
                                                        </Button>
                                                    </Modal.Footer>
                                                </Modal>
                                                </>
                                            }
                                        </Tab>
                                        <Tab title="Bulk Emails" eventKey={6} key={6}>
                                            <Tabs>
                                                {emails.map(email =>
                                                    <Tab title={email.semester} eventKey={email.semester?.replace(" ", "_")}
                                                         key={email.semester?.replace(" ", "_")}>
                                                        <Table>
                                                            <thead>
                                                            <tr>
                                                                <th>Subject</th>
                                                                <th>Sent</th>
                                                                <th>Status</th>
                                                                <th>Failure Reason</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {email.emails.map(row => (<tr key={row.message_id}>
                                                                <td><a
                                                                    href={`/email/status/${row.message_id}?site=${site}`}>{row.subject}</a>
                                                                </td>
                                                                <td>{row.sent}</td>
                                                                <td>{row.status}</td>
                                                                <td>{row.reason}</td>
                                                            </tr>))}
                                                            </tbody>
                                                        </Table>
                                                    </Tab>)}
                                            </Tabs>
                                        </Tab>
                                        {site === 'snow' && false &&
                                            <Tab title="Files" eventKey={9} key={9}>
                                                {filesSuccess && (
                                                    <Alert variant="success" dismissible onClose={() => setFilesSuccess(undefined)}>{filesSuccess}</Alert>
                                                )}
                                                {filesError && (
                                                    <Alert variant="danger" dismissible onClose={() => setFilesError(undefined)}>{filesError}</Alert>
                                                )}

                                                {uploading && (
                                                    <div className="mb-3">
                                                        <ProgressBar now={uploadProgress.total || 0} label={`${uploadProgress.total || 0}%`} />
                                                    </div>
                                                )}

                                                {/* Hidden file input */}
                                                <input
                                                    type="file"
                                                    id="fileUploadInput"
                                                    accept="image/png,application/pdf"
                                                    multiple
                                                    onChange={(e)=> { handleUpload(e.target.files); e.target.value = ''; }}
                                                    style={{display: 'none'}}
                                                />

                                                <Table>
                                                    <thead>
                                                    <tr>
                                                        <th colSpan={6}>
                                                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                                                <Button
                                                                    variant="success"
                                                                    size="sm"
                                                                    onClick={() => document.getElementById('fileUploadInput').click()}
                                                                    disabled={uploading}
                                                                >
                                                                    <span style={{fontSize: '1.2em', marginRight: '5px'}}>+</span>
                                                                    Add new files
                                                                </Button>
                                                            </div>
                                                        </th>
                                                    </tr>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Type</th>
                                                        <th>Size</th>
                                                        <th>Uploaded At</th>
                                                        <th>Uploaded By</th>
                                                        <th></th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {filesList && filesList.map(f => (
                                                        <tr key={f.id}>
                                                            <td>{f.original_name}</td>
                                                            <td>{f.mime_type}</td>
                                                            <td>{(f.size_bytes/1024/1024).toFixed(2)} MB</td>
                                                            <td>{formatDate(f.created_at)}</td>
                                                            <td>{f.uploaded_by_name || 'Unknown'}</td>
                                                            <td style={{whiteSpace: 'nowrap'}}>
                                                                <Button size="sm" className="me-2" onClick={() => handleDownload(f.id)}>Download</Button>
                                                                <Button size="sm" variant="secondary" className="me-2" onClick={() => handleRename(f)}>Rename</Button>
                                                                <label className="btn btn-sm btn-outline-primary me-2 mb-0">
                                                                    Replace
                                                                    <input type="file" accept="image/png,application/pdf" style={{display:'none'}} onChange={(e)=> { const file = e.target.files?.[0]; e.target.value = ''; handleReplace(f, file); }} />
                                                                </label>
                                                                <Button size="sm" variant="danger" onClick={() => handleDeleteFile(f)}>Delete</Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!filesList || filesList.length === 0) && (
                                                        <tr><td colSpan={6} style={{textAlign:'center'}}>No files uploaded.</td></tr>
                                                    )}
                                                    </tbody>
                                                </Table>

                                                {/* Rename File Modal */}
                                                <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)}>
                                                    <Modal.Header closeButton>
                                                        <Modal.Title>Rename File</Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <Form.Group>
                                                            <Form.Label>New Filename (max 150 characters)</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={newFileName}
                                                                onChange={(e) => setNewFileName(e.target.value)}
                                                                maxLength={150}
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        submitRename();
                                                                    }
                                                                }}
                                                            />
                                                            <Form.Text className="text-muted">
                                                                {newFileName.length}/150 characters
                                                            </Form.Text>
                                                        </Form.Group>
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                        <Button variant="secondary" onClick={() => setShowRenameModal(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button variant="primary" onClick={submitRename}>
                                                            Rename
                                                        </Button>
                                                    </Modal.Footer>
                                                </Modal>

                                                {/* Delete File Modal */}
                                                <Modal show={showDeleteFileModal} onHide={() => setShowDeleteFileModal(false)}>
                                                    <Modal.Header closeButton>
                                                        <Modal.Title>Delete File</Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body>
                                                        <p>Are you sure you want to delete <strong>{fileToDelete?.original_name}</strong>?</p>
                                                        <p className="text-danger">This action cannot be undone.</p>
                                                    </Modal.Body>
                                                    <Modal.Footer>
                                                        <Button variant="secondary" onClick={() => setShowDeleteFileModal(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button variant="danger" onClick={confirmDelete}>
                                                            Delete
                                                        </Button>
                                                    </Modal.Footer>
                                                </Modal>
                                            </Tab>
                                        }
                                    </Tabs>
                                </Tab>
                            }
                        </Tabs>
                    </div>
                    <Footer bg={bg}/>
                </main>

            </div>
        </Layout>
    )
};

export const getServerSideProps = withIronSessionSsr(async function (context) {
    await context.req.session.save();
    const {userId} = context.query;
    const site = context.query.site || SITE;
    const user = context.req.session.user;
    const isTenant = !user?.manageApartment;
    const navPage = context.resolvedUrl.substring(0, context.resolvedUrl.indexOf("?")).replace(/\//, "")
        .replace(`/${userId}`, isTenant ? "/" : "");
    let applicationContent = {};
    const page = "application";

    if (!user?.isLoggedIn) {
        context.res.writeHead(302, {Location: `/index?site=${site}`});
        context.res.end();
        return {};
    }
    if (user.isLoggedIn && user.editSite) {
        context.res.writeHead(302, {Location: `/application?site=${site}`});
        context.res.end();
        return {};
    }
    const [nav,
        tenant,
        applications,
        leases,
        emails,
        applicationContentRows,
        payments,
        deletedPayments,
        roommates,
        currentRooms,
        maintenanceRequests,
        paymentItems] = await Promise.all(
        [
            GetNavLinks(user, site),
            GetTenant(site, userId),
            GetTenantApplications(site, userId),
            GetTenantUserLeases(site, userId),
            GetTenantBulkEmails(site, userId),
            GetDynamicContent(site, page),
            GetUserPayments(site, userId),
            GetUserDeletedPayments(site, userId),
            user && user.isLoggedIn ? GetUserRoomates(userId) : [],
            GetUserAvailableLeaseRooms(site, userId),
            GetUserMaintenanceRequests(site, userId),
            !isTenant && site === "snow" ? GetAllTenantPaymentItems(site, userId) : [],
        ]);
    applicationContentRows.forEach(row => applicationContent[row.name] = row.content);
    const currentLeasesMap = await Promise.all(applications.map(async application => {
        return {leaseId: application.lease_id, currentLeases: await GetLeaseRoomsMap(application.lease_id)}
    }));
    const leaseContentMap = await Promise.all(leases.map(async lease => {
        return {
            leaseId: lease.lease_id,
            content: await GetDynamicContent(site, `leases/${lease.lease_id}`),
            rooms: (await GetLeaseRoomsMap(lease.lease_id))[0].rooms
        }
    }));
    applications.forEach(application => {
        application.lease_room_type_id = `${application.lease_id}_${application.room_type_id}`;
        application.do_not_share_info = !application.share_info;
    });
    let currentLeases = [...new Set(currentRooms.map(room => room.lease_id))];
    currentLeases = currentLeases.map(lease => {
        let rooms = currentRooms.filter(room => room.lease_id === lease);
        return {leaseId: lease, leaseDescription: rooms[0].description, rooms: rooms};
    });

    return {
        props: {
            isTenant: isTenant,
            site: site,
            links: nav,
            isABot: isBot(context),
            user: {...user},
            tenant: {...tenant},
            applications: applications,
            navPage: navPage,
            page: page,
            userId: userId,
            currentLeasesMap: currentLeasesMap,
            currentLeases: currentLeases,
            leases: leases,
            leaseContentMap: leaseContentMap,
            emails: emails,
            applicationContent: applicationContent,
            payments: payments,
            paymentItems: paymentItems || [],
            deletedPayments: deletedPayments,
            roommates: roommates,
            maintenanceRequests: maintenanceRequests,
            tab: context.query.tab || null
        }
    };
}, ironOptions);

export default Tenant;
