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

import React, { useEffect, useState } from 'react';

import { Button } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import {
    dynamicConnectorStyles as connectorStyles,
    ParamEditor,
    ParamItem
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { useStyles } from "./styles";

export interface PayloadEditorProps {
    requestName: string;
    headersName: string;
    callerName: string;
    requestSemDiag?: string;
    callerSemDiag?: string;
    headersSemDiag?: string;
    syntaxDiag?: string;
    readonly?: boolean;
    onChange: (requestName: string, headerName: string, callerName: string, avoidValueCommit?: boolean) => void;
    onChangeInProgress?: (isInProgress: boolean) => void;
}

export function AdvancedParamEditor(props: PayloadEditorProps) {
    const { requestName, callerName, headersName, headersSemDiag, requestSemDiag, callerSemDiag, readonly,
            syntaxDiag, onChange, onChangeInProgress } = props;

    const classes = useStyles();
    const connectorClasses = connectorStyles();

    const [isMore, setIsMore] = useState<boolean>((requestName !== undefined) || (headersName !== undefined)
        || (callerName !== undefined));
    const [requestParamName, setRequestPramName] = useState<string>(requestName);
    const [callerParamName, setCallerParamName] = useState<string>(callerName);
    const [headersParamName, setHeadersParamName] = useState<string>(headersName);

    const [addingRequestParam, setAddingRequestParam] = useState<boolean>(false);
    const [requestParamEditInProgress, setRequestParamEditInProgress] = useState<boolean>(false);
    const [addingCallerParam, setAddingCallerParam] = useState<boolean>(false);
    const [callerParamEditInProgress, setCallerParamEditInProgress] = useState<boolean>(false);
    const [addingHeaderParam, setAddingHeaderParam] = useState<boolean>(false);
    const [headerParamEditInProgress, setHeaderParamEditInProgress] = useState<boolean>(false);

    const addRequestParam = () => {
        setAddingRequestParam(true);
        setRequestPramName("request");
        onChange("request", headersParamName, callerParamName, true);
        onChangeInProgress(true);
    };
    const onRequestDelete = () => {
        onChange("", headersParamName, callerParamName);
    };
    const onRequestEdit = () => {
        setAddingRequestParam(true);
        setRequestParamEditInProgress(true);
        onChangeInProgress(true);
    };
    const onRequestUpdate = (param : {id: number, name: string}) => {
        const { name } = param;
        setAddingRequestParam(false);
        setRequestParamEditInProgress(false);
        onChange(name, headersParamName, callerParamName);
        onChangeInProgress(false);
    };
    const onRequestCancelAddParam = () => {
        setAddingRequestParam(false);
        onChangeInProgress(false);
        setRequestPramName(requestName);
        onChange(requestName, headersParamName, callerParamName);
    };
    const onRequestSave = (param : {id: number, name: string}) => {
        const { name } = param;
        setAddingRequestParam(false);
        onChange(name, headersParamName, callerParamName);
        onChangeInProgress(false);
    };
    const onRequestParamChange = (param : {id: number, name: string}) => {
        onChange(param.name, headersParamName, callerParamName, true);
    };

    const addCallerParam = () => {
        setAddingCallerParam(true);
        setCallerParamName("caller");
        onChange(requestName, headersParamName, "caller", true);
        onChangeInProgress(true);
    };
    const onCallerDelete = () => {
        onChange(requestParamName, headersParamName, "");
    };
    const onCallerEdit = () => {
        setAddingCallerParam(true);
        setCallerParamEditInProgress(true);
        onChangeInProgress(true);
    };
    const onCallerUpdate = (param : {id: number, name: string}) => {
        const { name } = param;
        setAddingCallerParam(false);
        setCallerParamEditInProgress(false);
        onChange(requestParamName, headersParamName, name);
        onChangeInProgress(false);
    };
    const onCallerCancelAddParam = () => {
        setAddingCallerParam(false);
        onChangeInProgress(false);
        setCallerParamName(callerName);
        onChange(requestParamName, headersParamName, callerName);
    };
    const onCallerSave = (param : {id: number, name: string}) => {
        const { name } = param;
        setAddingCallerParam(false);
        onChange(requestParamName, headersParamName, name);
        onChangeInProgress(false);
    };
    const onCallerParamChange = (param : {id: number, name: string}) => {
        onChange(requestParamName, headersParamName, param.name, true);
    };

    const addHeaderParam = () => {
        setAddingHeaderParam(true);
        setHeadersParamName("header");
        onChange(requestName, "header", callerParamName, true);
        onChangeInProgress(true);
    };
    const onHeaderDelete = () => {
        onChange(requestParamName, "", callerParamName);
    };
    const onHeaderEdit = () => {
        setAddingHeaderParam(true);
        setHeaderParamEditInProgress(true);
        onChangeInProgress(true);
    };
    const onHeaderUpdate = (param : {id: number, name: string}) => {
        const { name } = param;
        setAddingHeaderParam(false);
        setHeaderParamEditInProgress(false);
        onChange(requestParamName, name, callerParamName);
        onChangeInProgress(false);
    };
    const onHeaderCancelAddParam = () => {
        setAddingHeaderParam(false);
        onChangeInProgress(false);
        setHeadersParamName(headersName);
        onChange(requestParamName, headersName, callerParamName);
    };
    const onHeaderSave = (param : {id: number, name: string}) => {
        const { name } = param;
        setAddingHeaderParam(false);
        onChange(requestParamName, name, callerParamName);
        onChangeInProgress(false);
    };
    const onHeaderParamChange = (param : {id: number, name: string}) => {
        onChange(requestParamName, param.name, headersParamName, true);
    };

    const handleMoreSelect = () => {
        setIsMore(!isMore);
    };

    useEffect(() => {
        setRequestPramName(requestName);
        setHeadersParamName(headersName);
        setCallerParamName(callerName);
        if (requestName !== undefined || (headersName !== undefined) || (callerName !== undefined)) {
            // Setting more option if we have values in advanced params
            setIsMore(true);
        }
    }, [callerName, headersName, requestName]);

    return (
        <div>
            <div className={classes.advancedParamWrapper}>
                <div className={classes.advancedParamHeader}>Advanced Params </div>
                <Button className={classes.advancedParamBtn} onClick={handleMoreSelect}>
                    {isMore ? "Hide" : "Show"}
                </Button>
            </div>
            {isMore && (
                <>
                    {!requestParamName && (
                        <div>
                            <Button
                                data-test-id="request-add-button"
                                onClick={addRequestParam}
                                className={connectorClasses.addParameterBtn}
                                startIcon={<AddIcon/>}
                                color="primary"
                                disabled={(syntaxDiag !== "") || readonly}
                            >
                                Add Request
                            </Button>
                        </div>
                    )}
                    {addingRequestParam && requestParamName && (
                        <ParamEditor
                            param={{id: 0, name: requestParamName}}
                            syntaxDiag={syntaxDiag}
                            onChange={onRequestParamChange}
                            onUpdate={requestParamEditInProgress ? onRequestUpdate : null}
                            onAdd={!requestParamEditInProgress ? onRequestSave : null}
                            onCancel={onRequestCancelAddParam}
                            nameDiagnostics={requestSemDiag}
                            disabled={readonly}
                            hideDefaultValue={true}
                            dataTypeReqOptions={[]}
                        />
                    )}
                    {!addingRequestParam && requestParamName && (
                        <ParamItem
                            param={{
                                id: 0, name: requestParamName, option: "Request"
                            }}
                            readonly={readonly}
                            onDelete={onRequestDelete}
                            onEditClick={onRequestEdit}
                        />
                    )}
                    {!callerParamName && (
                        <div>
                            <Button
                                data-test-id="caller-add-button"
                                onClick={addCallerParam}
                                className={connectorClasses.addParameterBtn}
                                startIcon={<AddIcon/>}
                                color="primary"
                                disabled={(syntaxDiag !== "") || readonly}
                            >
                                Add Caller
                            </Button>
                        </div>
                    )}
                    {addingCallerParam && callerParamName && (
                        <ParamEditor
                            param={{id: 0, name: callerParamName}}
                            syntaxDiag={syntaxDiag}
                            onChange={onCallerParamChange}
                            onUpdate={callerParamEditInProgress ? onCallerUpdate : null}
                            onAdd={!callerParamEditInProgress ? onCallerSave : null}
                            onCancel={onCallerCancelAddParam}
                            nameDiagnostics={callerSemDiag}
                            disabled={readonly}
                            hideDefaultValue={true}
                            dataTypeReqOptions={[]}
                        />
                    )}
                    {!addingCallerParam && callerParamName && (
                        <ParamItem
                            param={{
                                id: 0, name: callerParamName, option: "Caller"
                            }}
                            readonly={readonly}
                            onDelete={onCallerDelete}
                            onEditClick={onCallerEdit}
                        />
                    )}
                    {!headersParamName && (
                        <div>
                            <Button
                                data-test-id="headers-add-button"
                                onClick={addHeaderParam}
                                className={connectorClasses.addParameterBtn}
                                startIcon={<AddIcon/>}
                                color="primary"
                                disabled={(syntaxDiag !== "") || readonly}
                            >
                                Get all Headers
                            </Button>
                        </div>
                    )}
                    {addingHeaderParam && headersParamName && (
                        <ParamEditor
                            param={{id: 0, name: headersParamName}}
                            syntaxDiag={syntaxDiag}
                            onChange={onHeaderParamChange}
                            onUpdate={headerParamEditInProgress ? onHeaderUpdate : null}
                            onAdd={!headerParamEditInProgress ? onHeaderSave : null}
                            onCancel={onHeaderCancelAddParam}
                            nameDiagnostics={headersSemDiag}
                            disabled={readonly}
                            hideDefaultValue={true}
                            dataTypeReqOptions={[]}
                        />
                    )}
                    {!addingHeaderParam && headersParamName && (
                        <ParamItem
                            param={{
                                id: 0, name: headersParamName, option: "Header"
                            }}
                            readonly={readonly}
                            onDelete={onHeaderDelete}
                            onEditClick={onHeaderEdit}
                        />
                    )}
                </>
            )}
        </div>
    );
}
