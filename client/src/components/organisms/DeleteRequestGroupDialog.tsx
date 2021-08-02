import React, { FunctionComponent } from "react";

import FormModal from "./FormModal";

interface Props {
    requestGroupName?: string;
    handleClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    numRequests: number;
}

const DeleteRequestTypeDialog: FunctionComponent<Props> = (props: Props) => {
    return (
        <FormModal
            className="delete-request-type-form"
            submitButtonText="Confirm"
            title="Delete Type"
            handleClose={props.handleClose}
            show={true}
            onSubmit={props.onSubmit}
            onCancel={props.onCancel}
        >
            <div className="delete-request-type-form-content">
                <p>
                    Are you sure you want to delete the group <b>&#34;{props.requestGroupName ?? "this"}&#34;</b>? This will delete the{" "}
                    <b>{props.numRequests}</b> requests in this group and cannot be undone.
                </p>
            </div>
        </FormModal>
    );
};

export default DeleteRequestTypeDialog;
