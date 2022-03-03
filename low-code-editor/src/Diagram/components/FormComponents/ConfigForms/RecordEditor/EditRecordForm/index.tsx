/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext } from 'react';
import { useIntl } from "react-intl";

import { Box, FormControl, Typography } from "@material-ui/core";
import { FormHeaderSection, PrimaryButton } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';

import { Context } from "../../../../../../Contexts/RecordEditor";
import CheckBoxGroup from '../../../FormFieldComponents/CheckBox';
import { wizardStyles as useStyles } from "../../style";

export function EditRecordForm() {

    const { state, callBacks } = useContext(Context);

    const classes = useStyles();

    const intl = useIntl();

    const title = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.editRecord.title",
        defaultMessage: "Edit Record"
    });
    const sampleButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.editRecord.sampleBtnText",
        defaultMessage: "Update from Sample"
    });

    const handleOptionalRecordChange = (text: string[]) => {
        if (text) {
            state.currentRecord.isOptional = text.length > 0;
            callBacks.onUpdateModel(state.recordModel);
        }
    };

    const handleArrayChange = (text: string[]) => {
        if (text) {
            state.currentRecord.isArray = text.length > 0;
            callBacks.onUpdateModel(state.recordModel);
        }
    };

    const handleIsClosedChange = (text: string[]) => {
        if (text) {
            state.currentRecord.isClosed = text.length > 0;
            callBacks.onUpdateModel(state.recordModel);
        }
    };

    const handleGenerateFromSample = () => {
        // TODO: implement this method
    }

    return (
        <FormControl data-testid="record-form" className={classes.wizardFormControl}>
            <FormHeaderSection
                onCancel={state.onCancel}
                formTitle={"lowcode.develop.configForms.recordEditor.editRecord.title"}
                defaultMessage={"Edit Record"}
            />
            <CheckBoxGroup
                testId="is-optional-field"
                values={["Is optional ?"]}
                defaultValues={state.currentRecord.isOptional ? ["Is optional ?"] : []}
                onChange={handleOptionalRecordChange}
            />
            <CheckBoxGroup
                testId="is-array"
                values={["Is Array ?"]}
                defaultValues={state.currentRecord.isArray ? ["Is Array ?"] : []}
                onChange={handleArrayChange}
            />
            <CheckBoxGroup
                testId="is-closed"
                values={["Is Closed ?"]}
                defaultValues={state.currentRecord.isClosed ? ["Is Closed ?"] : []}
                onChange={handleIsClosedChange}
            />

            <PrimaryButton
                dataTestId={"update-from-sample-btn"}
                text={sampleButtonText}
                fullWidth={false}
                onClick={handleGenerateFromSample}
            />
        </FormControl>

    );
}
