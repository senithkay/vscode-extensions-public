/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useReducer } from 'react';

import { FormControl, FormHelperText, TextareaAutosize } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { IBallerinaLangClient } from '@wso2-enterprise/ballerina-languageclient';
import { Button, IconLabel } from '@wso2-enterprise/ui-toolkit';
import { LangServerRpcClient } from '@wso2-enterprise/ballerina-rpc-client';
// import {
//     FormHeaderSection,
//     PrimaryButton,
//     SecondaryButton
// } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";


interface JsonToRecordState {
    isLoading?: boolean;
    jsonValue?: string;
    isValidRecord?: boolean;
}

interface RecordFromJsonProps {
    onCancel?: () => void;
    onSave?: (recordName: string, recordString: string) => void;
    langServerRpcClient: LangServerRpcClient;
}

const useStyles = makeStyles(() =>
    createStyles({
        inputWrapper: {
            marginTop: '1rem'
        },
        wizardFormControl: {
            width: 300,
            "& .MuiFormControl-marginNormal": {
                margin: '0 !important',
            },
        },
        formWrapper: {
            width: '100%',
            flexDirection: "row",
            padding: '15px 20px',
        },
        labelWrapper: {
            display: 'flex',
        },
        inputLabelForRequired: {
            padding: 0,
            color: 'var(--vscode-input-foreground)',
            fontSize: 13,
            textTransform: 'capitalize',
            display: 'inline-block',
            lineHeight: '35px',
            fontWeight: 300,
        },
        textArea: {
            backgroundColor: 'var(--vscode-editorWidget-background)',
            padding: "0.75rem",
            borderRadius: "5px",
            boxShadow: "inset 0 2px 2px 0 rgba(0,0,0,0.07), 0 0 1px 0 rgba(50,50,77,0.07)",
            boxSizing: 'border-box',
            minHeight: 104,
            width: '100%',
            border: '1px solid var(--vscode-editor-inactiveSelectionBackground)',
            fontFamily: 'inherit',
            color: 'var(--vscode-input-foreground)',
            // marginTop: '0.5rem',
            lineHeight: '22px',
            '&::placeholder': {
                color: 'var(--vscode-input-placeholderForeground)',
                fontSize: 13,
                fontWeight: 100,
                marginTop: '0.5rem',
            }
        },
        buttonWrapper: {
            display: 'flex',
            justifyContent: 'flex-end',
            width: '50%'
        },
        spaceBetween: {
            padding: '4px'
        },
        textareaErrorText: {
            display: 'inline-block',
            color: 'var(--vscode-editorError-foreground) !important',
            fontSize: '13px',
            backgroundColor: 'var(--vscode-input-background)'
        }
    })
);

const reducer = (state: JsonToRecordState, action: {type: string, payload: boolean | string }): JsonToRecordState => {
    switch (action.type) {
        case 'jsonConversionStart':
            return {...state, isLoading: action.payload as boolean};
        case 'setJsonValidity':
            return {...state, isValidRecord: action.payload as boolean};
        case 'setJsonValue':
            return {...state, jsonValue: action.payload as string};
        case 'jsonConversionSuccess':
            return {jsonValue: "", isLoading: false, isValidRecord: true};
        case 'jsonConversionFailure':
            return {jsonValue: "", isLoading: false, isValidRecord: false};
        default:
            break;
    }
}

export function RecordFromJson(recordFromJsonProps: RecordFromJsonProps) {
    const { onSave, onCancel, langServerRpcClient } = recordFromJsonProps;
    const classes = useStyles();

    const [formState, dispatchFromState] = useReducer(reducer, {
        jsonValue: "",
        isLoading: false,
        isValidRecord: true
    });

    const convertToJSon = () => {
        dispatchFromState({type: 'jsonConversionStart', payload: true});
    };

    const onJsonChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatchFromState({type: 'setJsonValue', payload: event.target.value});
        try {
            JSON.parse(event.target.value);
            dispatchFromState({type: 'setJsonValidity', payload: (JSON.stringify(event.target.value) !== `"{}"`)});
        } catch (e) {
            dispatchFromState({type: 'setJsonValidity', payload: false});
        }
    };

    useEffect(() => {
        if (formState.isLoading) {
            void (async () => {
                const recordName = "TempName";
                const recordResponse = await langServerRpcClient.convert(
                    {
                        jsonString: formState.jsonValue,
                        recordName,
                        isClosed: false,
                        isRecordTypeDesc: true
                    }
                );
                dispatchFromState({type: 'jsonConversionSuccess', payload: null});
                onSave(recordName, recordResponse.codeBlock);
            })();
        }
    }, [formState.isLoading]);

    const isSaveButtonEnabled = formState.isValidRecord && (formState.jsonValue !== "");

    const jsonError = "Please enter a valid JSON";

    return (
        <FormControl data-testid="module-variable-config-form" className={classes.wizardFormControl}>
            {/* <FormHeaderSection
                onCancel={recordFromJsonProps.onCancel}
                formTitle="Import Sample JSON"
                formType={""}
                defaultMessage=""
            /> */}
            <div id="json-input-container" data-testId="json-input-container" className={classes.formWrapper}>
                <div className={classes.inputWrapper}>
                    <div className={classes.labelWrapper}>
                        <FormHelperText className={classes.inputLabelForRequired}>Sample JSON</FormHelperText>
                    </div>
                </div>
                <TextareaAutosize
                    className={classes.textArea}
                    placeholder={`eg: {"organization": "wso2", "address": "Colombo"}`}
                    onChange={onJsonChange}
                    value={formState.jsonValue}
                />
                {!formState.isValidRecord && (
                    <Typography
                        variant="body2"
                        className={classes.textareaErrorText}
                    >
                        {jsonError}
                    </Typography>
                )}
                <div className={classes.buttonWrapper}>
                    <div className={classes.spaceBetween}>
                        <Button
                            appearance="secondary"
                            onClick={onCancel}
                            tooltip={"Cancel"}
                        >
                            <IconLabel>Cancel</IconLabel>
                        </Button>
                        {/* <SecondaryButton
                            text={`Cancel`}
                            fullWidth={false}
                            dataTestId="cancel-btn"
                            onClick={onCancel}
                        /> */}
                    </div>
                    <div className={classes.spaceBetween}>
                        <Button
                            appearance="primary"
                            onClick={convertToJSon}
                            tooltip={"Cancel"}
                            disabled={!isSaveButtonEnabled}
                        >
                            <IconLabel>Save</IconLabel>
                        </Button>
                        {/* <PrimaryButton
                            dataTestId="save-btn"
                            text={`Save`}
                            disabled={!isSaveButtonEnabled}
                            fullWidth={false}
                            onClick={convertToJSon}
                        /> */}
                    </div>
                </div>
            </div>
        </FormControl>
    );
}
