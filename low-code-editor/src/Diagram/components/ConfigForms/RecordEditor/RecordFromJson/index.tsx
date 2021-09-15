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
import React, { useContext, useEffect, useReducer } from 'react';

import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";

import { Context } from "../../../../../Contexts/Diagram";
import { DraftInsertPosition } from "../../../../view-state/draft";
import { PrimaryButton } from "../../../Portals/ConfigForm/Elements/Button/PrimaryButton";
import { SecondaryButton } from "../../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { FormTextArea } from "../../../Portals/ConfigForm/Elements/TextField/FormTextArea";
import { FormTextInput } from "../../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { wizardStyles } from "../../style";
import { convertToRecord, getRecordPrefix } from "../utils";
import { TextPreloaderVertical } from "../../../../../PreLoader/TextPreloaderVertical";
import { STModification } from "../../../../../Definitions";
import { createPropertyStatement } from "../../../../utils/modification-util";

interface RecordState {
    isLoading?: boolean;
    jsonValue?: string;
    isValidRecord?: boolean;
    recordName?: string;
    isValidRecordName?: string;
}

export interface RecordFromJsonProps {
    targetPosition: DraftInsertPosition;
}

const reducer = (state: RecordState, action: {type: string, payload: any }) => {
    switch (action.type) {
        case 'jsonConversionStart':
            return {...state, isLoading: action.payload};
        case 'setJsonValidity':
            return {...state, isValidRecord: action.payload};
        case 'setJsonValue':
            return {...state, jsonValue: action.payload};
        case 'jsonConversionSuccess':
            return {jsonValue: "", isLoading: false, isValidRecord: true,
                recordName: "", isValidRecordName: true};
        case 'jsonConversionFailure':
            return {jsonValue: "", isLoading: false, isValidRecord: false,
                recordName: state.recordName, isValidRecordName: state.isValidRecordName};

        case 'setRecordName':
            return {...state, recordName: action.payload};
        case 'setRecordNameValidity':
            return {...state, isValidRecordName: action.payload};
        default:
            break;
    }
}

export function RecordFromJson(props: RecordFromJsonProps) {
    const { targetPosition } = props;
    const overlayClasses = wizardStyles();
    const classes = useStyles();

    const { state } = useContext(Context);
    const { isMutationInProgress } = state;

    const prefix = getRecordPrefix(state);

    const [formState, dispatchFromState] = useReducer(reducer, {
        jsonValue: "",
        isLoading: false,
        isValidRecord: true,
        recordName: "",
        isValidRecordName: true
    });

    const convertToJSon = () => {
        dispatchFromState({type: 'jsonConversionStart', payload: true});
    };

    const onNameChange = (name: string) => {
        dispatchFromState({type: 'setRecordName', payload: name});
        const recordNameWithModuleInfo = `${prefix}${name}`;
        if ((state?.stSymbolInfo?.recordTypeDescriptions)?.has(recordNameWithModuleInfo)) {
            dispatchFromState({type: 'setRecordNameValidity', payload: false});
        } else {
            dispatchFromState({type: 'setRecordNameValidity', payload: true});
        }
    };

    const onJsonChange = (jsonText: string) => {
        dispatchFromState({type: 'setJsonValue', payload: jsonText});
        try {
            JSON.parse(jsonText);
            dispatchFromState({type: 'setJsonValidity', payload: (JSON.stringify(jsonText) !== `"{}"`)});
        } catch (e) {
            dispatchFromState({type: 'setJsonValidity', payload: false});
        }
    };

    useEffect(() => {
        if (formState.isLoading) {
            (async () => {
                const recordString = await convertToRecord(formState.jsonValue, state);
                const modifications: STModification[] = [createPropertyStatement(
                    recordString.replace("NewRecord", formState.recordName),
                    {line: 0, column: 0}
                )];
                // modifyDiagram(modifications);
                dispatchFromState({type: 'jsonConversionSuccess', payload: recordString});
            })();
        }
    }, [formState.isLoading]);

    const isSaveButtonEnabled = !isMutationInProgress &&
        (formState.isValidRecordName && (formState.recordName !== "") &&
        formState.isValidRecord && (formState.jsonValue !== ""));

    const varNameError = "Variable name already exists";
    const jsonError = "Please enter a valid JSON";

    return (
        <FormControl data-testid="record-form" className={classes.wizardFormControl}>
            <div className={classes.formTitleWrapper}>
                <Typography variant="h4">
                    <Box paddingTop={2} paddingBottom={2}>Record From JSON</Box>
                </Typography>
            </div>
            <FormTextInput
                dataTestId="variable-name"
                customProps={{
                    isErrored: !formState.isValidRecordName,
                }}
                defaultValue={formState.recordName}
                onChange={onNameChange}
                label={"Name"}
                errorMessage={varNameError}
                placeholder={"Enter record name"}
            />
            <div className={classes.inputWrapper}>
                <div className={classes.labelWrapper}>
                    <FormHelperText className={classes.inputLabelForRequired}>Sample JSON</FormHelperText>
                </div>
            </div>
            <FormTextArea
                dataTestId="json-input"
                placeholder={`eg: {"organization": "wso2", "address": "Colombo"}`}
                onChange={onJsonChange}
                customProps={{
                    isInvalid: !formState.isValidRecord,
                    text: jsonError
                }}
                defaultValue={formState.jsonValue}
            />
            {formState.isLoading && (
                <TextPreloaderVertical position="absolute" />
            )}
            <div className={overlayClasses.buttonWrapper}>
                <SecondaryButton text="Cancel" fullWidth={false} onClick={null} />
                <PrimaryButton
                    dataTestId={"record-from-json-save-btn"}
                    text={"Save"}
                    disabled={!isSaveButtonEnabled}
                    fullWidth={false}
                    onClick={convertToJSon}
                />
            </div>
        </FormControl>
    );
}
