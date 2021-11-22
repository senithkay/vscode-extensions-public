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
import React, { useEffect, useState } from 'react';
import { useIntl } from "react-intl";

import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";
import { PrimaryButton } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

import { useRecordEditorContext } from "../../../../../../Contexts/RecordEditor";
import CheckBoxGroup from '../../../FormFieldComponents/CheckBox';
import { FormTextInput } from '../../../FormFieldComponents/TextField/FormTextInput';
import { wizardStyles as useStyles } from "../../style";

export function EditTypeDefForm() {
    const { state, callBacks } = useRecordEditorContext();

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
    const visibilityText = intl.formatMessage({
        id: "lowcode.develop.configForms.recordEditor.editRecord.visibilityText",
        defaultMessage: "Visibility"
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
    };

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
                errorMessage={nameError}
                placeholder={namePlaceholder}
            />
            <CheckBoxGroup
                testId="is-closed"
                values={["Is Closed ?"]}
                defaultValues={state.currentRecord.isClosed ? ["Is Closed ?"] : []}
                onChange={handleIsClosedChange}
            />

            <FormHelperText className={classes.inputLabelForRequired}>
                {visibilityText}
            </FormHelperText>
            <CheckBoxGroup
                testId="is-public"
                values={["public"]}
                defaultValues={state.currentRecord.isPublic ? ["public"] : []}
                onChange={handleIsPublicChange}
            />

            <PrimaryButton
                dataTestId={"generate-from-sample-btn"}
                text={sampleButtonText}
                fullWidth={false}
                onClick={handleGenerateFromSample}
            />
        </FormControl>
    );
}
