import { bindActionCreators, Dispatch } from "redux"
import { gql, useQuery } from "@apollo/client";
import React, { FunctionComponent, useState } from "react";
import { connect } from "react-redux";

import { loadRequestGroups, setDisplayRequestGroups } from '../../data/actions'
import DonorSearchBar from "../molecules/DonorSearchBar";
import RequestGroup from '../../data/types/requestGroup'
import RequestGroupDonorView from './RequestGroupDonorView'
import RequestGroupList from './RequestGroupList'
import RequestType from "../../data/types/requestType";
import { RootState } from '../../data/reducers'

interface StateProps {
  requestGroups: Array<RequestGroup>,
  displayRequestGroups: Array<RequestGroup>
}

interface DispatchProps {
  loadRequestGroups: typeof loadRequestGroups,
  setDisplayRequestGroups: typeof setDisplayRequestGroups
}


type Props = StateProps & DispatchProps;

const DonorRequestGroupBrowser: FunctionComponent<Props> = (props: React.PropsWithChildren<Props>) => {
  const [selectedRequestGroup, setSelectedRequestGroup] = useState<string | undefined>(props.displayRequestGroups.length <= 0 ? undefined : props.displayRequestGroups[0]._id)
  const [sortedRequestGroups, setSortedRequestGroups] = useState<Array<RequestGroup> | undefined>(undefined)

  const query = gql`
  {
    requestGroups {
      _id
      name
      dateUpdated
      deleted
      description
      requirements
      image
      numOpen
      requestTypes {
        _id
        name
      }
    }
  }`

  const sortRequestGroupsAlphabetically = (requestGroups: Array<RequestGroup>) => requestGroups.sort((rg1: RequestGroup, rg2: RequestGroup) => {
    if (rg1.name && rg2.name && rg1.name < rg2.name) { return -1; }
    if (rg1.name && rg2.name && rg1.name > rg2.name) { return 1; }
    return 0;
  });

  useQuery(query, {
    onCompleted: (data: { requestGroups: Array<RequestGroup> }) => {
      // Clone state.data because sort occurs in-place.
      const displayRequestGroups = sortRequestGroupsAlphabetically(data.requestGroups.map(requestGroup => ({ ...requestGroup })));
      setSortedRequestGroups(displayRequestGroups);
      props.loadRequestGroups(data.requestGroups);
      props.setDisplayRequestGroups(displayRequestGroups);
      setSelectedRequestGroup(displayRequestGroups.length <= 0 ? undefined : displayRequestGroups[0]._id)
    },
  });

  const filterRequestTypesOnSearch = (requestTypes: RequestType[] | undefined, searchString: string) => {
    if (requestTypes){
      return requestTypes.filter(requestType => requestType.name?.startsWith(searchString)).length > 0
    }
    return false;
  }

  const  filterRequestGroupsOnSearch =  (searchString: string) => {
    if (searchString.length > 0){
      const updatedRequestGroups =  props.requestGroups.filter(requestGroup => {
        return (
          requestGroup?.name?.startsWith(searchString) 
          || filterRequestTypesOnSearch(requestGroup?.requestTypes, searchString)
        )
      });
      const updatedSortedRequestGroups = sortRequestGroupsAlphabetically(updatedRequestGroups);
      props.setDisplayRequestGroups(updatedSortedRequestGroups);
      if (updatedRequestGroups.length > 0){
        setSelectedRequestGroup(updatedSortedRequestGroups[0]._id);
      }
    } else {
      props.setDisplayRequestGroups(sortedRequestGroups!);
    }
  }

  return <div className="donor-request-group-browser">
    <div>
      <h1 className="donor-request-group-browser-header">Current Needs</h1>
      <DonorSearchBar filterRequestGroups={filterRequestGroupsOnSearch}/>
    </div>
    <div className="donor-request-group-browser-content">
      <div className="donor-request-group-browser-list">
        <RequestGroupList
          selectedRequestGroup={selectedRequestGroup}
          onRequestGroupChange={(requestGroupdId: string) => { setSelectedRequestGroup(requestGroupdId) }}
        />
      </div>
      <div className="donor-request-group-browser-indiv-view">
        <RequestGroupDonorView requestGroupId={selectedRequestGroup} />
      </div>
    </div>
  </div>
};

const mapStateToProps = (store: RootState): StateProps => {
  return {
    requestGroups: store.requestGroups.data,
    displayRequestGroups: store.requestGroups.displayData,
  };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return bindActionCreators(
    {
      loadRequestGroups,
      setDisplayRequestGroups
    },
    dispatch
  );
};

export default connect<StateProps, DispatchProps, Record<string, unknown>, RootState>(mapStateToProps, mapDispatchToProps)(DonorRequestGroupBrowser);
