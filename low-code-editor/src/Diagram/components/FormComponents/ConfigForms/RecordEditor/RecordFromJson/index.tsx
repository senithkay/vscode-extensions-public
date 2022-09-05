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
import {
    CheckBoxGroup,
    FormHeaderSection,
    FormTextInput
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition, STKindChecker, STNode, TypeDefinition } from '@wso2-enterprise/syntax-tree';

import { Context } from "../../../../../../Contexts/Diagram";
import { TextPreloaderVertical } from "../../../../../../PreLoader/TextPreloaderVertical";
import { getInitialSource, mutateTypeDefinition } from "../../../../../utils";
import { useStyles } from "../../../DynamicConnectorForm/style";
import { FormActionButtons } from "../../../FormFieldComponents/FormActionButtons";
import { FormTextArea } from "../../../FormFieldComponents/TextField/FormTextArea";
import { checkDiagnostics, getUpdatedSource } from "../../../Utils";
import { RecordEditor } from "../index";
import { convertToRecord, getModulePartST, getRecordST, getRootRecord } from "../utils";

interface RecordState {
    isLoading?: boolean;
    jsonValue?: string;
    recordName?: string;
    recordNameDiag?: string;
    importedRecord?: TypeDefinition;
    modifiedPosition?: NodePosition;
    isSeparateDef?: boolean;
    jsonDiagnostics?: string;
}

interface RecordFromJsonProps {
    targetPosition?: NodePosition;
    onSave: (recordString: string, modifiedPosition: NodePosition) => void;
    onCancel: () => void;
}

const reducer = (state: RecordState, action: {type: string, payload: any }) => {
    switch (action.type) {
        case 'jsonConversionStart':
            return {...state, isLoading: action.payload};
        case 'setJsonDiagnostics':
            return {...state, jsonDiagnostics: action.payload, isLoading: false};
        case 'setJsonValue':
            return {...state, jsonValue: action.payload, jsonDiagnostics: ""};
        case 'recordNameChange':
            return {...state, recordName: action.payload.recordName, recordNameDiag: action.payload.recordNameDiag};
        case 'setRecordNameDiag':
            return {...state, recordNameDiag: action.payload.recordNameDiag};
        case 'checkSeparateDef':
            return {...state, isSeparateDef: action.payload};
        case 'jsonConversionSuccess':
            return {...state, importedRecord: action.payload.importedRecord, modifiedPosition: action.payload.modifiedPosition, jsonValue: "", isLoading: false, jsonDiagnostics: ""};
        default:
            break;
    }
}

export function RecordFromJson(recordFromJsonProps: RecordFromJsonProps) {
    const classes = useStyles();

    const { targetPosition, onSave, onCancel } = recordFromJsonProps;

    const { props, api } = useContext(Context);

    const { isMutationProgress, langServerURL, currentFile } = props;
    const { ls } = api;

    const [formState, dispatchFromState] = useReducer(reducer, {
        recordName: "",
        jsonValue: "",
        isLoading: false,
        jsonDiagnostics: "",
        isSeparateDef: false,
        recordNameDiag: "",
        importedRecord: undefined,
    });

    const convertToJSon = () => {
        dispatchFromState({type: 'jsonConversionStart', payload: true});
    };

    const onJsonChange = (jsonText: string) => {
        dispatchFromState({type: 'setJsonValue', payload: jsonText});
    };

    const onNameChange = async (name: string) => {
        const content = getInitialSource(mutateTypeDefinition(name, "record {};", targetPosition,
            true));
        const updateContent = getUpdatedSource(content, currentFile.content, targetPosition);
        const diagnostics = await checkDiagnostics(currentFile?.path, updateContent, ls, targetPosition);
        let filteredDiagnostics;
        if ((diagnostics[0]?.severity === 1)
            && (diagnostics[0]?.range?.start?.line - 1) === targetPosition.startLine) {
            filteredDiagnostics = diagnostics;
        }
        dispatchFromState({type: 'recordNameChange', payload: {
            recordName: name,
            recordNameDiag: filteredDiagnostics ? filteredDiagnostics[0].message : ""
        }});
    };

    const onSeparateDefinitionSelection = (mode: string[]) => {
        dispatchFromState({type: 'checkSeparateDef', payload: mode.length > 0});
    };

    useEffect(() => {
        if (formState.isLoading) {
            (async () => {
                const recordResponse = await convertToRecord(formState.jsonValue, formState.recordName,
                    false, langServerURL, formState.isSeparateDef, ls);
                let recordST: STNode;
                let newPosition: NodePosition;
                if (recordResponse?.diagnostics?.length === 0) {
                    if (formState.isSeparateDef) {
                        // Uses module part since we receive multiple records
                        const modulePart = await getModulePartST({
                            codeSnippet: recordResponse.codeBlock.trim()
                        }, langServerURL, ls);
                        if (STKindChecker.isModulePart(modulePart)) {
                            recordST = getRootRecord(modulePart, formState.recordName);
                            newPosition = {
                                startLine: targetPosition.startLine + recordST.position.startLine,
                                startColumn: targetPosition.startColumn,
                                endLine: targetPosition.startLine + recordST.position.endLine,
                                endColumn: recordST.position.endColumn,
                            }
                        }
                    } else {
                        recordST = await getRecordST({ codeSnippet: recordResponse.codeBlock.trim()},
                            langServerURL, ls);
                        newPosition = {
                            startLine: targetPosition.startLine,
                            startColumn: targetPosition.startColumn,
                            endLine: targetPosition.startLine + recordST.position.endLine,
                            endColumn: recordST.position.endColumn,
                        }
                    }
                    dispatchFromState({type: 'jsonConversionSuccess', payload: {
                        importedRecord: recordST, modifiedPosition: newPosition
                    }});
                    onSave(recordResponse.codeBlock, newPosition);
                } else {
                    dispatchFromState({type: 'setJsonDiagnostics', payload: recordResponse?.diagnostics[0].message});
                }
            })();
        }
    }, [formState.isLoading]);

    const isSaveButtonEnabled = !isMutationProgress && formState.jsonDiagnostics === ""
        && (formState.jsonValue !== "") && !formState.recordNameDiag && formState.recordName;

    return (
        <>
            {formState.importedRecord ? (
                <RecordEditor
                    name={formState.importedRecord.typeName.value}
                    targetPosition={formState.modifiedPosition}
                    onSave={null}
                    model={formState.importedRecord}
                    isTypeDefinition={true}
                    formType={""}
                    onCancel={onCancel}
                />
            ) : (
                <FormControl data-testid="module-variable-config-form" className={classes.wizardFormControlExtended}>
                    <FormHeaderSection
                        onCancel={onCancel}
                        formTitle="Import Sample JSON"
                        formType={""}
                        defaultMessage=""
                    />
                    <div id="json-input-container" test-id="json-input-container" className={classes.formWrapper}>
                        <FormTextInput
                            label="Record Name"
                            dataTestId="import-record-name"
                            placeholder="Enter Record Name"
                            defaultValue={formState.recordName}
                            customProps={{ readonly: false, isErrored: formState?.recordNameDiag}}
                            onChange={onNameChange}
                            errorMessage={formState?.recordNameDiag}
                        />
                        <div className={classes.inputWrapper}>
                            <div className={classes.labelWrapper}>
                                <FormHelperText className={classes.inputLabelForRequired}>Sample JSON</FormHelperText>
                            </div>
                        </div>
                        <FormTextArea
                            rowsMax={6.3}
                            dataTestId="json-input"
                            placeholder={`eg: {"organization": "wso2", "address": "Colombo"}`}
                            onChange={onJsonChange}
                            customProps={{
                                isInvalid: formState.jsonDiagnostics !== "",
                                text: formState.jsonDiagnostics
                            }}
                            defaultValue={formState.jsonValue}
                        />
                        {formState.isLoading && (
                            <TextPreloaderVertical position="absolute" />
                        )}
                        <CheckBoxGroup
                            values={["Make Separate Record Definitions"]}
                            defaultValues={formState.isSeparateDef ? ['Make Separate Record Definitions'] : []}
                            onChange={onSeparateDefinitionSelection}
                        />
                        <FormActionButtons
                            cancelBtnText="Back"
                            saveBtnText="Save"
                            isMutationInProgress={false}
                            validForm={isSaveButtonEnabled}
                            onSave={convertToJSon}
                            onCancel={onCancel}
                        />
                    </div>
                </FormControl>
            )}
        </>
    );
}
