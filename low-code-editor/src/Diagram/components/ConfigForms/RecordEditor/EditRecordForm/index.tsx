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
import React, { useContext, useEffect, useState } from 'react';
import { useIntl } from "react-intl";

import { Box, FormControl, Typography } from "@material-ui/core";

import { Context } from "../../../../../Contexts/RecordEditor";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import CheckBoxGroup from "../../../Portals/ConfigForm/Elements/CheckBox";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";

export function EditRecordForm() {

    const { state, callBacks } = useContext(Context);

    const classes = useStyles();

    const [nameError, setNameError] = useState("");

    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    const intl = useIntl();

    const title = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.editRecord.title",
        defaultMessage: "Edit Record"
    });
    const nameText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.editRecord.nameText",
        defaultMessage: "Record name"
    });
    const namePlaceholder = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.editRecord.namePlaceholder",
        defaultMessage: "Enter record name"
    });
    const sampleButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.editRecord.sampleBtnText",
        defaultMessage: "Update from Sample"
    });

    const handleNameChange = (inputText: string) => {
        // TODO: Check with parent record fields
        if ((inputText !== "") && !nameRegex.test(inputText)) {
            callBacks.updateEditorValidity(true);
            setNameError("Enter a valid name");
        } else if (inputText === "") {
            callBacks.updateEditorValidity(true);
            setNameError("Name is required");
        } else {
            callBacks.updateEditorValidity(false);
            setNameError("");
        }
        state.currentRecord.name = inputText;
        callBacks.onUpdateModel(state.recordModel);
    };

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

    useEffect(() => {
        if (((state.currentRecord.name === "") || (state.currentRecord.name === undefined)) && !state.isEditorInvalid) {
            callBacks.updateEditorValidity(true);
        }
    }, [state.currentRecord.name]);

    return (
        <FormControl data-testid="record-form" className={classes.wizardFormControl}>
            <div className={classes.formTitleWrapper}>
                <Typography variant="h4">
                    <Box paddingTop={2} paddingBottom={2}>{title}</Box>
                </Typography>
            </div>
            <FormTextInput
                dataTestId="record-name"
                customProps={{
                    isErrored: nameError !== "",
                }}
                defaultValue={state.currentRecord.name}
                onChange={handleNameChange}
                label={nameText}
                placeholder={namePlaceholder}
                errorMessage={nameError}
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
