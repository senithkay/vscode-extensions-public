/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useState } from 'react';

import { ActionButtons, AutoComplete, TextField } from '@wso2-enterprise/ui-toolkit';
import { EditorContainer, EditorContent } from '../../styles';
import { CommonRPCAPI, NodePosition, STModification, responseCodes } from '@wso2-enterprise/ballerina-core';
import { getSourceFromResponseCode, getTitleFromResponseCode } from '../../utils/utils';
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { ResponseConfig } from '@wso2-enterprise/service-designer';
import { TypeBrowser } from '../TypeBrowser/TypeBrowser';

export interface ParamProps {
    response: ResponseConfig;
    isBallerniaExt?: boolean;
    isEdit: boolean;
    onChange: (param: ResponseConfig) => void;
    onSave?: (param: ResponseConfig, defineRecordName: string) => void;
    onCancel?: (id?: number) => void;
    typeCompletions?: string[];
    serviceEndPosition?: NodePosition;
    commonRpcClient?: CommonRPCAPI;
    applyModifications?: (modifications: STModification[]) => Promise<void>;
}

export function ResponseEditor(props: ParamProps) {
    const { response, isBallerniaExt, isEdit, onSave, onChange, onCancel, typeCompletions, serviceEndPosition, commonRpcClient, applyModifications } = props;

    console.log("response", typeCompletions);

    const [isNameRecord, setIsNameRecord] = useState(false);
    const [definedRecordName, setDefinedRecordName] = useState("");

    const handleReqFieldChange = () => {
        setIsNameRecord(!isNameRecord);
        if (!isNameRecord) {
            const recordName = `${getSourceFromResponseCode(response.code).replace("http:", "")}${response.type ? `${response.type}` : ""}`;
            setDefinedRecordName(recordName);
        } else {
            setDefinedRecordName("");
        }
    };

    const handleCodeChange = (value: string) => {
        const code = responseCodes.find(code => code.title === value).code;
        onChange({ ...response, code: Number(code), source: "" });
    };

    const handleTypeChange = (value: string) => {
        if (isNameRecord) {
            const recordName = `${getSourceFromResponseCode(response.code).replace("http:", "")}${response.type ? `${response.type}` : ""}`;
            setDefinedRecordName(recordName);
        }
        onChange({ ...response, type: value, source: "" });
    };

    const handleOnCancel = () => {
        onCancel(response.id);
    };

    const handleOnSave = () => {
        const newParam: ResponseConfig = {
            id: response.id,
            type: response.type,
            code: response.code,
            source: response.source
        };
        onSave(newParam, definedRecordName);
    };

    return (
        <EditorContainer>
            <EditorContent>
                <AutoComplete
                    sx={{ zIndex: 1, position: "relative" }}
                    borderBox={isBallerniaExt}
                    label="Code"
                    selectedItem={getTitleFromResponseCode(response.code)}
                    items={responseCodes.map(code => code.title)}
                    onChange={handleCodeChange}
                />
                <TypeBrowser
                    commonRpcClient={commonRpcClient}
                    serviceEndPosition={serviceEndPosition}
                    sx={{ zIndex: 1, position: "relative" }}
                    isOptional={true}
                    borderBox={isBallerniaExt}
                    label="Type"
                    selectedItem={response.type}
                    onChange={handleTypeChange}
                    applyModifications={applyModifications}
                />
            </EditorContent>
            <VSCodeCheckbox checked={isNameRecord} onChange={handleReqFieldChange} id="is-name-rec-checkbox">
                Define a name record for the return type
            </VSCodeCheckbox>
            {isNameRecord && (
                <TextField
                    size={33}
                    placeholder='Enter type'
                    value={definedRecordName}
                    onChange={handleTypeChange}
                />
            )}
            <ActionButtons
                primaryButton={{ text: isEdit ? "Save" : "Add", onClick: handleOnSave }}
                secondaryButton={{ text: "Cancel", onClick: handleOnCancel }}
                sx={{ justifyContent: "flex-end" }}
            />
        </EditorContainer >
    );
}
