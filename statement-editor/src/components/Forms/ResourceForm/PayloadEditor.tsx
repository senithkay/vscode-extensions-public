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
    ParamEditor, ParamItem,
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { Payload } from "./types";

export interface PayloadEditorProps {
    payload: Payload;
    readonly?: boolean;
    syntaxDiag?: string;
    nameSemDiag?: string;
    typeSemDiag?: string;
    onChange: (payloadString: string, payLoad: Payload, avoidValueCommit?: boolean) => void;
    onChangeInProgress?: (isInProgress: boolean) => void;
}

export function PayloadEditor(props: PayloadEditorProps) {
    const { payload, syntaxDiag = null, nameSemDiag, typeSemDiag, readonly, onChange, onChangeInProgress } = props;

    const connectorClasses = connectorStyles();

    const [payloadState, setPayloadState] = useState<Payload>(payload);
    const [addingParam, setAddingParam] = useState<boolean>(false);
    const [paramEditInProgress, setParamEditInProgress] = useState<boolean>(false);
    const onParamChange = (param: { id: number, name: string, dataType: string, defaultValue?: string }) => {
        const {name, dataType, defaultValue} = param;
        onChange(`@http:Payload ${dataType} ${name}${defaultValue ? ` = ${defaultValue}` : ""}` ,
            {type: dataType, name, defaultValue}, true);
    };

    const addParam = () => {
        setAddingParam(true);
        setPayloadState({name: "payload", type: "json"});
        onParamChange({id: 0, name: "payload", dataType: "json"});
        onChangeInProgress(true);
    };
    const onDelete = () => {
        onChange("", undefined);
    };
    const onEdit = () => {
        setAddingParam(true);
        setParamEditInProgress(true);
        onChangeInProgress(true);
    };
    const onUpdate = (param : {id: number, name: string, dataType?: string, defaultValue?: string,
                               headerName?: string}) => {
        const { dataType, name, defaultValue } = param;
        setAddingParam(false);
        setParamEditInProgress(false);
        onChange(`@http:Payload ${dataType} ${name}${defaultValue ? ` = ${defaultValue}` : ""}` ,
            {type: dataType, name, defaultValue});
        onChangeInProgress(false);
    };
    const onSave = (param : {id: number, name: string, dataType?: string, defaultValue?: string,
                             headerName?: string}) => {
        const { dataType, name, defaultValue } = param;
        setAddingParam(false);
        onChange(`@http:Payload ${dataType} ${name}${defaultValue ? ` = ${defaultValue}` : ""}` ,
            {type: dataType, name, defaultValue});
        onChangeInProgress(false);
    };
    const onCancelAddParam = () => {
        setAddingParam(false);
        onChangeInProgress(false);
        if (payload) {
            setPayloadState({name: payload.name, type: payload.type, defaultValue: payload.defaultValue});
            onChange(`@http:Payload ${payload?.type} ${payload?.name}${payload?.defaultValue ?
                ` = ${payload?.defaultValue}` : ""}` , payload);
        } else {
            setPayloadState(undefined);
            onChange("" , payload);
        }
    };

    useEffect(() => {
        setPayloadState(payload);
    }, [payload, payload?.name, payload?.type]);

    return (
        <div>
            {!payloadState && (
                <div>
                    <Button
                        data-test-id="payload-add-button"
                        onClick={addParam}
                        className={connectorClasses.addParameterBtn}
                        startIcon={<AddIcon/>}
                        color="primary"
                        disabled={(syntaxDiag !== "") || readonly}
                    >
                        Add Payload
                    </Button>
                </div>
            )}
            {addingParam && payloadState && (
                <ParamEditor
                    param={{id: 0, name: payloadState?.name, dataType: payloadState?.type}}
                    syntaxDiag={syntaxDiag}
                    onChange={onParamChange}
                    onUpdate={paramEditInProgress ? onUpdate : null}
                    onAdd={!paramEditInProgress ? onSave : null}
                    onCancel={onCancelAddParam}
                    nameDiagnostics={nameSemDiag}
                    typeDiagnostics={typeSemDiag}
                    disabled={readonly}
                />
            )}
            {!addingParam && payloadState && (
                <ParamItem
                    param={{
                        id: 0, name: payloadState?.name, type: payloadState?.type, option: "Payload"
                    }}
                    readonly={readonly}
                    onDelete={onDelete}
                    onEditClick={onEdit}
                />
            )}
        </div>
    );
}
