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
import React from 'react';

import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";

import { useRecordEditorContext } from "../../../../../Contexts/RecordEditor";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import CheckBoxGroup from "../../../Portals/ConfigForm/Elements/CheckBox";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";

export function EditTypeDefForm() {
    const { state, callBacks } = useRecordEditorContext();

    const classes = useStyles();

    const handleNameChange = (inputText: string) => {
        state.currentRecord.name = inputText;
        callBacks.onUpdateModel(state.recordModel);
    };

    const validateNameValue = (value: string) => {
        // TODO: Add name validations
        return true;
    };

    const handleIsClosedChange = (text: string[]) => {
        if (text) {
            state.currentRecord.isClosed = text.length > 0;
            callBacks.onUpdateModel(state.recordModel);
        }
    };

    const handleIsPublicChange = (text: string[]) => {
        if (text) {
            state.currentRecord.isPublic = text.length > 0;
            callBacks.onUpdateModel(state.recordModel);
        }
    };

    const handleGenerateFromSample = () => {
        // TODO: implement this method
    }

    return (
        <FormControl data-testid="record-form" className={classes.wizardFormControl}>
            <div className={classes.formTitleWrapper}>
                <Typography variant="h4">
                    <Box paddingTop={2} paddingBottom={2}>{"Edit Record"}</Box>
                </Typography>
            </div>
            <FormTextInput
                dataTestId="record-name"
                customProps={{
                    validate: validateNameValue,
                }}
                defaultValue={state.currentRecord.name}
                onChange={handleNameChange}
                label={"Record name"}
                errorMessage={!/*isValidName*/ false ? "Variable name already exists" : null}
                placeholder={"Enter field name"}
            />
            <CheckBoxGroup
                testId="is-closed"
                values={["Is Closed ?"]}
                defaultValues={state.currentRecord.isClosed ? ["Is Closed ?"] : []}
                onChange={handleIsClosedChange}
            />

            <FormHelperText className={classes.inputLabelForRequired}>
                Visibility
            </FormHelperText>
            <CheckBoxGroup
                testId="is-public"
                values={["public"]}
                defaultValues={state.currentRecord.isPublic ? ["public"] : []}
                onChange={handleIsPublicChange}
            />

            <PrimaryButton
                dataTestId={"generate-from-sample-btn"}
                text={"Use Sample"}
                fullWidth={false}
                onClick={handleGenerateFromSample}
            />
        </FormControl>
    );
}
