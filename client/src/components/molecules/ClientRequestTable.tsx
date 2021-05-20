import { gql, useMutation } from "@apollo/client";
import React, { FunctionComponent, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import moment from "moment";
import Table from "react-bootstrap/Table";

import Request from "../../data/types/request";
import RequestForm from "../organisms/RequestForm";

interface Props {
  requests: Request[];
  onChangeRequests: (requests: Request[]) => void;
}

const ClientRequestTable: FunctionComponent<Props> = (props: Props) => {
  const [requestSelectedForEditing, setRequestSelectedForEditing] =
    useState("");
  const [requests, setRequests] = useState<Request[]>([]);

  const headingList = [
    "Fulfilled",
    "Request Group",
    "Request Type",
    "Quantity",
    "Date Requested",
    "",
  ];
  const updateRequest = gql`
    mutation updateRequest($request: RequestInput) {
      updateRequest(request: $request) {
        id
        success
        message
      }
    }
  `;
  const deleteRequest = gql`
    mutation deleteRequest($id: ID) {
      softDeleteRequest(id: $id) {
        id
        success
        message
      }
    }
  `;
  const [mutateDeleteRequest] = useMutation(deleteRequest);
  const [mutateRequest] = useMutation(updateRequest);

  const sortRequests = (unsortedRequests: Request[]): Request[] => {
    const requests = unsortedRequests.filter((request) => !request.deleted);
    const nonFulfilledRequests = requests.filter(
      (request) => !request.fulfilled
    );
    const fulfilledRequests = requests.filter((request) => request.fulfilled);

    // sort nonFulfilled and fulfilled requests separately
    nonFulfilledRequests.sort((a, b) => {
      return a!.dateCreated!.valueOf() - b!.dateCreated!.valueOf();
    });

    fulfilledRequests.sort((a, b) => {
      return a!.dateCreated!.valueOf() - b!.dateCreated!.valueOf();
    });

    // keep fulfilled requests underneath unfulfilled ones
    const sortedRequests: Request[] = nonFulfilledRequests!.concat(
      fulfilledRequests!
    );
    return sortedRequests;
  };

  useEffect(() => {
    const sortedRequests = sortRequests(props.requests);
    setRequests(sortedRequests);
  }, [props.requests]);

  const onDeleteRequest = (index: number) => {
    const id = requests[index]._id;
    mutateDeleteRequest({ variables: { id: id } })
      .then(() => window.location.reload())
      .catch((e) => console.error(e));
  };

  const onFulfilledRequest = (index: number) => {
    const requestsCopy = requests.slice();
    const req = requestsCopy[index];
    const { _id: id, fulfilled } = req;
    mutateRequest({
      variables: { request: { id, fulfilled: !fulfilled } },
    })
      .then(() => {
        // update and sort the requests
        requestsCopy[index].fulfilled = !fulfilled;
        const sortedRequests = sortRequests(requestsCopy);
        props.onChangeRequests(sortedRequests);
      })
      .catch((e) => console.error(e));
  };

  return (
    <div className="request-list">
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
      {requests.length > 0 && (
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
            {requests
              .filter((request) => !request.deleted)
              .map((request, index) => (
                <tr
                  key={request._id}
                  className={`${
                    requests[index].fulfilled ? "hidden" : "shown"
                  }`}
                >
                  <td>
                    <Form.Check
                      type="checkbox"
                      onClick={() => onFulfilledRequest(index)}
                      defaultChecked={request.fulfilled}
                    />
                  </td>
                  <td>
                    <div className="row-text">
                      {request.requestType!.requestGroup!.name}
                    </div>
                  </td>
                  <td>
                    <div className="row-text">{request.requestType!.name}</div>
                  </td>
                  <td>
                    <div className="row-text">{request.quantity}</div>
                  </td>
                  <td>
                    <div className="row-text">
                      {moment(request.dateCreated, "x").format("MMMM DD, YYYY")}
                    </div>
                  </td>
                  <td>
                    <div className="btn-cont">
                      <td>
                        <a
                          className="request-table edit"
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
                        <a
                          className="request-table delete"
                          onClick={() => onDeleteRequest(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </a>
                      </td>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ClientRequestTable;
