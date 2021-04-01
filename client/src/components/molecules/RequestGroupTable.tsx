import React, { FunctionComponent } from "react";
import moment from 'moment';

import { Table } from "react-bootstrap";

import Tag from '../atoms/Tag'

import RequestGroup from '../../data/types/requestGroup'

export interface Props {
  requestGroups: Array<RequestGroup> | undefined
}

const RequestGroupTable: FunctionComponent<Props> = (props: Props) => {
    return <div className="request-group-table">
        <Table>
            <thead>
                <tr>
                    <th>Title (A-Z)</th>
                    <th>Open Requests</th>
                    <th>Item Types</th>
                    <th>Next Recipient</th>
                    <th>Last Added</th>
                    <th></th>
                </tr>
            </thead>
            {props.requestGroups !== undefined &&
                <tbody>
                    <tr className="spacing-row">
                        <td/><td/><td/><td/><td/><td/>
                    </tr>
                    {[...props.requestGroups].sort((g1, g2) => {
                        if (!g1 && !g2) {
                            return 0
                        }
                        if (!g1 || !g1.name) {
                            return 1
                        }
                        if (!g2 || !g2.name) {
                            return -1
                        }
                        return g1.name < g2.name ? -1 : 1})
                    .map((requestGroup : RequestGroup) => 
                        <> 
                            <tr key={ requestGroup._id } className="data-row">
                                <td className="name-col">{ requestGroup.name }</td>
                                <td className="numOpen-col">{ requestGroup.numOpen }</td>
                                <td className="types-col">
                                    <div className="requestType-tag-list">
                                        { requestGroup.requestTypes && requestGroup.requestTypes.map((requestType) => {
                                            if (requestType.name) {
                                                return(
                                                    <span className="requestType-tag-list-item">
                                                        <Tag text={requestType.name}/>
                                                    </span>
                                                )
                                            } else {
                                                return(<></>)
                                            }
                                        })}
                                    </div>
                                </td>
                                <td className="nextRecipient-col">{ requestGroup.nextRecipient ? requestGroup.nextRecipient.fullName : "N/A" }</td>
                                <td className="date-col">{ requestGroup.hasAnyRequests ? moment(requestGroup.dateUpdated, "x").format('MMMM DD, YYYY') : "N/A" }</td>
                                <td className="image-col">
                                    <div className="img-wrapper">
                                        <img src={ requestGroup.image }/>
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-row">
                                <td>
                                    <div className="border-line"/>
                                </td>
                                <td>
                                    <div className="border-line"/>
                                </td>
                                <td>
                                    <div className="border-line"/>
                                </td>
                                <td>
                                    <div className="border-line"/>
                                </td>
                                <td>
                                    <div className="border-line"/>
                                </td>
                                <td>
                                    <div className="border-line"/>
                                </td>
                            </tr>
                        </>
                    )}
                </tbody>
            }
        </Table>
        {props.requestGroups && props.requestGroups.length == 0 && 
            <span>There are no request groups. <a>Create one now</a></span>
        }
    </div>
};

export default RequestGroupTable;
