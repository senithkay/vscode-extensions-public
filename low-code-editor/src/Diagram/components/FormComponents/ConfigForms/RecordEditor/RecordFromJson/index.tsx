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

import { FormControl, FormHelperText } from "@material-ui/core";
import { FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { RecordTypeDesc, STKindChecker, STNode, TypeDefinition } from '@wso2-enterprise/syntax-tree';

import { Context } from "../../../../../../Contexts/Diagram";
import { useRecordEditorContext } from "../../../../../../Contexts/RecordEditor";
import { TextPreloaderVertical } from "../../../../../../PreLoader/TextPreloaderVertical";
import { ConfigOverlayFormStatus } from "../../../../../store/definitions";
import { useStyles } from "../../../DynamicConnectorForm/style";
import { FormActionButtons } from "../../../FormFieldComponents/FormActionButtons";
import { FormTextArea } from "../../../FormFieldComponents/TextField/FormTextArea";
import { wizardStyles } from "../../style";
import { convertToRecord, getRecordModel, getRecordST } from "../utils";

interface RecordState {
    isLoading?: boolean;
    jsonValue?: string;
    isValidRecord?: boolean;
}

interface RecordFromJsonProps {
    configOverlayFormStatus?: ConfigOverlayFormStatus;
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
            return {jsonValue: "", isLoading: false, isValidRecord: true};
        case 'jsonConversionFailure':
            return {jsonValue: "", isLoading: false, isValidRecord: false};
        default:
            break;
    }
}

export function RecordFromJson(recordFromJsonProps: RecordFromJsonProps) {
    const overlayClasses = wizardStyles();
    const classes = useStyles();

    const { configOverlayFormStatus, onSave, onCancel } = recordFromJsonProps;

    const { props, api } = useContext(Context);
    const { state, callBacks } = useRecordEditorContext();

    const { isMutationProgress, langServerURL } = props;
    const { ls } = api;

    const [formState, dispatchFromState] = useReducer(reducer, {
        jsonValue: "",
        isLoading: false,
        isValidRecord: true
    });

    const convertToJSon = () => {
        dispatchFromState({type: 'jsonConversionStart', payload: true});
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
                const recordResponse = await convertToRecord(formState.jsonValue, state.currentRecord.name,
                    false, langServerURL, ls);
                const recordST: STNode = await getRecordST({ codeSnippet: recordResponse.trim()
                        .replace(/\n/g, "") }, langServerURL, ls);
                if (STKindChecker.isTypeDefinition(recordST)) {
                    const typeDef: TypeDefinition = recordST as TypeDefinition;
                    const recordModel = getRecordModel(typeDef.typeDescriptor as RecordTypeDesc,
                        typeDef.typeName.value, true, "record");
                    state.currentRecord.fields = state.currentRecord.fields.concat(recordModel.fields);
                    callBacks.onUpdateCurrentRecord(state.currentRecord);
                    callBacks.onUpdateModel(state.recordModel);
                    dispatchFromState({type: 'jsonConversionSuccess', payload: recordModel});
                    onSave();
                }
            })();
        }
    }, [formState.isLoading]);

    const isSaveButtonEnabled = !isMutationProgress && formState.isValidRecord && (formState.jsonValue !== "");

    const jsonError = "Please enter a valid JSON";

    return (
        <FormControl data-testid="module-variable-config-form" className={classes.wizardFormControl}>
            <FormHeaderSection
                onCancel={recordFromJsonProps.onCancel}
                formTitle="Import Sample JSON"
                formType={""}
                defaultMessage=""
            />
            <div id="json-input-container" test-id="json-input-container" className={classes.formWrapper}>
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
                <FormActionButtons
                    cancelBtnText="Cancel"
                    saveBtnText="Save"
                    isMutationInProgress={false}
                    validForm={isSaveButtonEnabled}
                    onSave={convertToJSon}
                    onCancel={recordFromJsonProps.onCancel}
                />
            </div>
        </FormControl>
    );
}
