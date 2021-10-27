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

import { NodePosition } from '@ballerina/syntax-tree';
import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";

import { Context } from "../../../../../../Contexts/Diagram";
import { STModification } from "../../../../../../Definitions";
import { TextPreloaderVertical } from "../../../../../../PreLoader/TextPreloaderVertical";
import { createPropertyStatement } from "../../../../../utils/modification-util";
import { useStyles } from "../../../../Portals/ConfigForm/forms/style";
import { keywords } from "../../../../Portals/utils/constants";
import { PrimaryButton } from "../../../FormFieldComponents/Button/PrimaryButton";
import { SecondaryButton } from "../../../FormFieldComponents/Button/SecondaryButton";
import { FormTextArea } from "../../../FormFieldComponents/TextField/FormTextArea";
import { FormTextInput } from "../../../FormFieldComponents/TextField/FormTextInput";
import { wizardStyles } from "../../style";
import { convertToRecord, getRecordPrefix } from "../utils";

interface RecordState {
    isLoading?: boolean;
    jsonValue?: string;
    isValidRecord?: boolean;
    recordName?: string;
    nameError?: string;
}

export interface RecordFromJsonProps {
    targetPosition: NodePosition;
    onCancel: () => void;
    onSave: () => void;
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
            return {jsonValue: "", isLoading: false, isValidRecord: true, recordName: "", nameError: ""};
        case 'jsonConversionFailure':
            return {jsonValue: "", isLoading: false, isValidRecord: false,
                    recordName: state.recordName, nameError: state.nameError};

        case 'setRecordName':
            return {...state, recordName: action.payload};
        case 'setRecordNameValidity':
            return {...state, nameError: action.payload};
        default:
            break;
    }
}

export function RecordFromJson(formProps: RecordFromJsonProps) {
    const { targetPosition, onCancel, onSave } = formProps;
    const overlayClasses = wizardStyles();
    const classes = useStyles();

    const { props, api } = useContext(Context);
    const { isMutationProgress, stSymbolInfo, langServerURL } = props;
    const { code, ls } = api;

    const prefix = getRecordPrefix(stSymbolInfo);
    const nameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_]*$");

    const [formState, dispatchFromState] = useReducer(reducer, {
        jsonValue: "",
        isLoading: false,
        isValidRecord: true,
        recordName: "",
        nameError: ""
    });

    const convertToJSon = () => {
        dispatchFromState({type: 'jsonConversionStart', payload: true});
    };

    const onNameChange = (name: string) => {
        dispatchFromState({type: 'setRecordName', payload: name});
        const recordNameWithModuleInfo = `${prefix}${name}`;
        if ((stSymbolInfo.recordTypeDescriptions)?.has(recordNameWithModuleInfo)) {
            dispatchFromState({type: 'setRecordNameValidity', payload: "Variable name already exists"});
        } else if (keywords.includes(name)) {
            dispatchFromState({type: 'setRecordNameValidity', payload: "Keywords are not allowed"});
        } else if ((name !== "") && !nameRegex.test(name)) {
            dispatchFromState({type: 'setRecordNameValidity', payload: "Enter a valid name"});
        } else {
            dispatchFromState({type: 'setRecordNameValidity', payload: ""});
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
                const recordString = await convertToRecord(formState.jsonValue, langServerURL, ls);
                const modifications: STModification[] = [createPropertyStatement(
                    recordString.replace("NewRecord", formState.recordName), targetPosition
                )];
                code.modifyDiagram(modifications);
                dispatchFromState({type: 'jsonConversionSuccess', payload: recordString});
                onSave();
            })();
        }
    }, [formState.isLoading]);

    const isSaveButtonEnabled = !isMutationProgress &&
        ((formState.nameError === "") && (formState.recordName !== "") &&
            formState.isValidRecord && (formState.jsonValue !== ""));

    const jsonError = "Please enter a valid JSON";

    return (
        <FormControl data-testid="record-form" className={classes.wizardFormControl}>
            <div className={classes.formTitleWrapper}>
                <Typography variant="h4">
                    <Box paddingTop={2} paddingBottom={2}>Create record</Box>
                </Typography>
            </div>
            <FormTextInput
                dataTestId="variable-name"
                customProps={{
                    isErrored: (formState.nameError !== ""),
                }}
                defaultValue={formState.recordName}
                onChange={onNameChange}
                label={"Name"}
                errorMessage={formState.nameError}
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
                <SecondaryButton text="Cancel" fullWidth={false} onClick={onCancel} />
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
