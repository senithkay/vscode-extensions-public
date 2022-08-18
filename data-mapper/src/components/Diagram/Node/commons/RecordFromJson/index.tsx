/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useEffect, useReducer } from 'react';

import { FormControl, FormHelperText, TextareaAutosize } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import {
    FormHeaderSection,
    PrimaryButton,
    SecondaryButton
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";

interface JsonToRecordState {
    isLoading?: boolean;
    jsonValue?: string;
    isValidRecord?: boolean;
}

interface RecordFromJsonProps {
    onCancel?: () => void;
    onSave?: (recordName: string, recordString: string) => void;
    context: IDataMapperContext;
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
            color: '#1D2028',
            fontSize: 13,
            textTransform: 'capitalize',
            display: 'inline-block',
            lineHeight: '35px',
            fontWeight: 300,
        },
        textArea: {
            backgroundColor: '#F8F9FA',
            padding: "0.75rem",
            borderRadius: "5px",
            boxShadow: "inset 0 2px 2px 0 rgba(0,0,0,0.07), 0 0 1px 0 rgba(50,50,77,0.07)",
            boxSizing: 'border-box',
            minHeight: 104,
            width: '100%',
            border: '1px solid #DEE0E7',
            fontFamily: 'inherit',
            color: '#1D2028',
            // marginTop: '0.5rem',
            lineHeight: '22px',
            '&::placeholder': {
                color: '#8D91A3',
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
            color: '#ea4c4d !important',
            fontSize: '13px',
            backgroundColor: '#fff'
        }
    })
);

const reducer = (state: JsonToRecordState, action: {type: string, payload: any }) => {
    switch (action.type) {
        case 'jsonConversionStart':
            return {...state, isLoading: action.payload};
        case 'setJsonValidity':
            return {...state, isValidRecord: action.payload};
        case 'setJsonValue':
            return {...state, jsonValue: action.payload};
        case 'jsonConversionSuccess':
            return {jsonValue: "", isLoading: false, isValidRecord: true};
        case 'jsonConversionFailure':
            return {jsonValue: "", isLoading: false, isValidRecord: false};
        default:
            break;
    }
}

export function RecordFromJson(recordFromJsonProps: RecordFromJsonProps) {
    const { onSave, onCancel, context } = recordFromJsonProps;
    const classes = useStyles();

    const [formState, dispatchFromState] = useReducer(reducer, {
        jsonValue: "",
        isLoading: false,
        isValidRecord: true
    });

    const convertToJSon = () => {
        dispatchFromState({type: 'jsonConversionStart', payload: true});
    };

    const onJsonChange = (event: any) => {
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
            (async () => {
                const recordName = "TempName";
                const langClient = await context.langClientPromise;
                const recordResponse = await langClient.convert(
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
            <FormHeaderSection
                onCancel={recordFromJsonProps.onCancel}
                formTitle="Import Sample JSON"
                formType={""}
                defaultMessage=""
            />
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
                        <SecondaryButton
                            text={`Cancel`}
                            fullWidth={false}
                            dataTestId="cancel-btn"
                            onClick={onCancel}
                        />
                    </div>
                    <div className={classes.spaceBetween}>
                        <PrimaryButton
                            dataTestId="save-btn"
                            text={`Save`}
                            disabled={!isSaveButtonEnabled}
                            fullWidth={false}
                            onClick={convertToJSon}
                        />
                    </div>
                </div>
            </div>
        </FormControl>
    );
}
