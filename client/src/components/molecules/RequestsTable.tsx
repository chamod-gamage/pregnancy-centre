import { gql, useLazyQuery, useMutation } from "@apollo/client";
import React, { FunctionComponent, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import moment from "moment";
import Table from "react-bootstrap/Table";

import Request from "../../data/types/request";
import RequestForm from "../organisms/RequestForm";
import WarningDialog from "../atoms/WarningDialog";

interface Props {
    requests: Request[];
    onChangeNumRequests?: (num: number) => void;
}

const RequestsTable: FunctionComponent<Props> = (props: Props) => {
    const [requests, setRequests] = useState(props.requests.filter((request) => request.deletedAt == null));
    const [requestSelectedForEditing, setRequestSelectedForEditing] = useState("");
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const headingList = ["Fulfilled", "Client Name", "Quantity", "Date Requested", ""];
    const fulfillRequest = gql`
        mutation FulfillRequest($_id: ID) {
            fulfillRequest(_id: $_id) {
                _id
            }
        }
    `;
    const unfulfillRequest = gql`
        mutation UnfulfillRequest($_id: ID) {
            unfulfillRequest(_id: $_id) {
                _id
            }
        }
    `;
    const deleteRequest = gql`
        mutation DeleteRequest($_id: ID) {
            deleteRequest(_id: $_id) {
                _id
            }
        }
    `;
    const queryDonationForm = gql`
        query DonationForm($_id: ID) {
            donationForm(_id: $_id) {
                _id
                quantity
            }
        }
    `;
    const updateDonationForm = gql`
        mutation UpdateDonationForm($donationForm: UpdateDonationFormInput) {
            updateDonationForm(donationForm: $donationForm) {
                _id
            }
        }
    `;

    useEffect(() => {
        const nonFulfilledRequests = requests.filter((request) => {
            if (request !== undefined) {
                if (request.fulfilledAt == null) {
                    return request;
                }
            }
        });
        const fulfilledRequests = requests.filter((request) => {
            if (request !== undefined) {
                if (request.fulfilledAt != null) {
                    return request;
                }
            }
        });

        nonFulfilledRequests.sort((a, b) => {
            return a!.createdAt!.valueOf() - b!.createdAt!.valueOf();
        });

        fulfilledRequests.sort((a, b) => {
            return a!.createdAt!.valueOf() - b!.createdAt!.valueOf();
        });

        const sortedRequests: Request[] = nonFulfilledRequests!.concat(fulfilledRequests!) as Request[];
        setRequests(sortedRequests);
    }, [props.requests]);

    const [mutateDeleteRequest] = useMutation(deleteRequest);
    const [mutateFulfillRequest] = useMutation(fulfillRequest, {
        onCompleted: () => {
            window.location.reload();
        }
    });
    const [mutateUnfulfillRequest] = useMutation(unfulfillRequest, {
        onCompleted: () => {
            window.location.reload();
        }
    });
    const [mutateUpdateDonationForm] = useMutation(updateDonationForm);
    const [getDonationForm, { data: donationFormResponse }] = useLazyQuery(queryDonationForm);
    if (donationFormResponse) {
        const id = donationFormResponse.donationForm._id;
        const quantity = donationFormResponse.donationForm.quantity - 1;
        mutateUpdateDonationForm({ variables: { donationForm: { _id: id, quantity: quantity } } });
    }
    const handleDeleteRequest = (index: number) => {
        const req = requests[index];
        if (req.fulfilledAt != null) {
            // If Request is fulfilled then don't show warning
            console.log(req.matchedDonations);
            if (req.matchedDonations != null) {
                req.matchedDonations.forEach((item) => {
                    const id = item.donationForm;
                    getDonationForm({ variables: { _id: id } });
                });
            }
            onDeleteRequest(index);
        } else {
            let canDelete = true;
            const matchedDonations = req.matchedDonations;
            if (matchedDonations != null) {
                matchedDonations.forEach((item) => {
                    if (item.quantity > 0) {
                        console.log("cant do that");
                        canDelete = false;
                    }
                });
            }
            if (canDelete) {
                onDeleteRequest(index);
            } else {
                setShowWarningDialog(true);
            }
        }
    };
    const onDeleteRequest = (index: number) => {
        const requestsCopy = requests.slice();
        const req = { ...requestsCopy[index] };
        requestsCopy.splice(index, 1);
        const id = req._id;
        props.onChangeNumRequests!(requestsCopy.length);
        setRequests(requestsCopy);
        mutateDeleteRequest({ variables: { _id: id } });
    };
    const onFulfilledRequest = (request: Request) => {
        if (request._id == null) {
            return;
        }
        if (request.fulfilledAt) {
            mutateUnfulfillRequest({ variables: { _id: request._id } });
        } else {
            mutateFulfillRequest({ variables: { _id: request._id } });
        }
    };

    return (
        <div className="request-list">
            {showWarningDialog && (
                <WarningDialog
                    dialogTitle="This request has attached donation forms."
                    dialogText="It cannot be deleted until the amount contributed by all donation forms to this request is zero."
                    onClose={() => setShowWarningDialog(false)}
                />
            )}
            {requestSelectedForEditing && (
                <RequestForm
                    onSubmitComplete={() => {
                        window.location.reload();
                    }}
                    handleClose={() => setRequestSelectedForEditing("")}
                    operation="edit"
                    requestId={requestSelectedForEditing}
                />
            )}
            {requests.length === 0 ? (
                <p className="request-table-empty-message">There are currently no requests in this type</p>
            ) : (
                <Table responsive className="request-table">
                    <thead>
                        <tr>
                            {headingList.map((heading, index) => (
                                <th key={index} className="request-table th">
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((request, index) =>
                            request.deletedAt == null ? (
                                <tr key={request._id}>
                                    <td>
                                        <div>
                                            <Form.Check
                                                type="checkbox"
                                                onClick={() => onFulfilledRequest(request)}
                                                defaultChecked={request.fulfilledAt != null}
                                            />
                                        </div>
                                    </td>
                                    {request.clientName !== null ? (
                                        <td style={request.fulfilledAt ? { opacity: 0.2 } : undefined}>
                                            <div className="row-text-style">{request.clientName}</div>
                                        </td>
                                    ) : (
                                        <td>N/A</td>
                                    )}
                                    <td style={request.fulfilledAt ? { opacity: 0.2 } : undefined}>
                                        {request.quantity}
                                    </td>
                                    <td style={request.fulfilledAt ? { opacity: 0.2 } : undefined}>
                                        {moment(request.createdAt, "x").format("MMMM DD, YYYY")}
                                    </td>
                                    <td>
                                        <div className="btn-cont">
                                            <td>
                                                <a
                                                    className="edit"
                                                    onClick={() => {
                                                        if (request._id) {
                                                            setRequestSelectedForEditing(request._id);
                                                        }
                                                    }}
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </a>
                                            </td>
                                            <td>
                                                <a className="delete" onClick={() => handleDeleteRequest(index)}>
                                                    <i className="bi bi-trash"></i>
                                                </a>
                                            </td>
                                        </div>
                                    </td>
                                </tr>
                            ) : undefined
                        )}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default RequestsTable;
