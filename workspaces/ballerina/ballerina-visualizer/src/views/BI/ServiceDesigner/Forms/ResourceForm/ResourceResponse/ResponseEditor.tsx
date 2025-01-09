/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useEffect, useState } from 'react';

import { ActionButtons, AutoComplete, TextField, Codicon, CheckBox } from '@wso2-enterprise/ui-toolkit';
import { EditorContainer, EditorContent, ParamContainer, ParamDescription } from '../styles';
import { CommonRPCAPI, STModification, StatusCodeResponse, responseCodes } from '@wso2-enterprise/ballerina-core';
import { getTitleFromResponseCode } from '../utils';
import { TypeBrowser } from '../TypeBrowser/TypeBrowser';
import { NodePosition } from '@wso2-enterprise/syntax-tree';

export interface ParamProps {
    index: number;
    response: StatusCodeResponse;
    isEdit: boolean;
    onChange: (param: StatusCodeResponse) => void;
    onSave: (param: StatusCodeResponse, index: number) => void;
    onCancel?: (id?: number) => void;
}

export function ResponseEditor(props: ParamProps) {
    const { index, response, isEdit, onSave, onChange, onCancel } = props;

    const handleCodeChange = (value: string) => {
        const code = responseCodes.find(code => code.title === value).code;
        response.statusCode.value = String(code);
        onChange(response);
    };

    const handleTypeChange = (value: string, isArray: boolean) => {
        response.body.value = isArray ? `${value}[]` : value;
        onChange(response);
    };

    const handleNamedTypeChange = (checked: boolean) => {
        response.createStatusCodeResponse.value = checked ? "true" : "false";
        response.createStatusCodeResponse.enabled = checked;
        onChange(response);
    };

    const handleNameValueChange = (value: string) => {
        response.name.value = value;
        response.name.enabled = response.createStatusCodeResponse.enabled;
        onChange(response);
    };

    const handleOnCancel = () => {
        onCancel(index);
    };

    const handleOnSave = () => {
        onSave(response, index);
    };

    return (
        <EditorContainer>
            <EditorContent>
                <AutoComplete
                    sx={{ zIndex: 1, position: "relative", marginTop: "3px" }}
                    label="Code"
                    value={getTitleFromResponseCode(Number(response.statusCode.value))}
                    items={responseCodes.map(code => code.title)}
                    onValueChange={handleCodeChange}
                />
                <TypeBrowser
                    sx={{ zIndex: 1, position: "relative" }}
                    isOptional={true}
                    label="Type"
                    handleArray={true}
                    selectedItem={response.body.value}
                    onChange={handleTypeChange}
                />
            </EditorContent>
            {response.createStatusCodeResponse &&
                <>
                    <CheckBox
                        label={response.createStatusCodeResponse.metadata.description}
                        value={response.createStatusCodeResponse.metadata.description}
                        checked={response.createStatusCodeResponse.value === "true"}
                        onChange={handleNamedTypeChange}
                    />
                    {response.createStatusCodeResponse.value === "true" &&
                        <TextField
                            sx={{ marginTop: 10, marginBottom: 15, flexGrow: 1 }}
                            errorMsg={""}
                            label={response.name.metadata.description}
                            size={50}
                            onTextChange={(input) => {
                                const trimmedInput = input.trim();
                                handleNameValueChange(trimmedInput);
                            }}
                            placeholder=""
                            value={response.name.value}
                        />
                    }
                </>
            }
            <ActionButtons
                primaryButton={{ text: isEdit ? "Save" : "Add", onClick: handleOnSave }}
                secondaryButton={{ text: "Cancel", onClick: handleOnCancel }}
                sx={{ justifyContent: "flex-end" }}
            />
        </EditorContainer >
    );
}
