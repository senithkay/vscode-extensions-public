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
import React, { useContext, useState } from 'react';

import { Box, FormControl, Typography } from "@material-ui/core";

import { Context } from "../../../../../Contexts/RecordEditor";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import CheckBoxGroup from "../../../Portals/ConfigForm/Elements/CheckBox";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { wizardStyles } from "../../style";
import { recordStyles } from "../style";
import { SimpleField } from "../types";

export interface FieldEditorProps {
    onSaveFiled?: (field: SimpleField) => void;
    onCancel?: () => void;
}

export function EditRecordForm(props: FieldEditorProps) {
    const { onSaveFiled, onCancel } = props;

    const { state, callBacks } = useContext(Context);

    const overlayClasses = wizardStyles();
    const classes = useStyles();
    const recordClasses = recordStyles();

    const handleNameChange = (inputText: string) => {
        state.currentRecord.name = inputText;
        callBacks.onUpdateModel(state.recordModel);
    };

    const validateNameValue = (value: string) => {
        // TODO: Add name validations
        // const isNameAlreadyExists = addedFields.find(field => (field.name === value));
        // setIsValidName(!isNameAlreadyExists);
        // return !isNameAlreadyExists;
        return true;
    };

    const handleOptionalRecordChange = (text: string[]) => {
        if (text) {
            state.currentRecord.isOptional = text.length > 0;
            callBacks.onUpdateModel(state.recordModel);
        }
    };

    const handleOptionalArrayChange = (text: string[]) => {
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
            <div className={classes.formTitleWrapper}>
                <Typography variant="h4">
                    <Box paddingTop={2} paddingBottom={2}>{"Edit Record"}</Box>
                </Typography>
            </div>
            <FormTextInput
                dataTestId="field-name"
                customProps={{
                    validate: validateNameValue,
                }}
                defaultValue={state.currentRecord.name}
                onChange={handleNameChange}
                label={"Field name"}
                errorMessage={!/*isValidName*/ false ? "Variable name already exists" : null}
                placeholder={"Enter field name"}
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
                onChange={handleOptionalArrayChange}
            />
            <CheckBoxGroup
                testId="is-closed"
                values={["Is Closed ?"]}
                defaultValues={state.currentRecord.isClosed ? ["Is Closed ?"] : []}
                onChange={handleIsClosedChange}
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
