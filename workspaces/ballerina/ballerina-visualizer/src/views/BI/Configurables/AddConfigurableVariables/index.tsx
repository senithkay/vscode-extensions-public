/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { ConfigVariable } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { PanelContainer, Form, FormField, FormValues } from '@wso2-enterprise/ballerina-side-panel';
import { CompletionItem } from '@wso2-enterprise/ui-toolkit';
import { debounce } from 'lodash';
import { convertToVisibleTypes } from '../../../../utils/bi';


namespace S {
    export const FormContainer = styled.div`
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: inherit;
    `;
}

export interface ConfigFormProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
}

export function AddForm(props: ConfigFormProps) {
    const { isOpen, onClose, title } = props;

    const { rpcClient } = useRpcContext();

    let variable: ConfigVariable = {
        "metadata": {
            "label": ""
        },
        "codedata": {
            "node": "",
            "lineRange": {
                "fileName": "config.bal",
                "startLine": {
                    "line": 0,
                    "offset": 0
                },
                "endLine": {
                    "line": 0,
                    "offset": 0
                }
            }
        },
        "properties": {
            "type": {
                "metadata": {
                    "label": "",
                    "description": ""
                },
                "valueType": "TYPE",
                "value": "",
                "optional": false,
                "editable": true
            },
            "variable": {
                "metadata": {
                    "label": "",
                    "description": ""
                },
                "valueType": "",
                "value": "",
                "optional": false,
                "editable": true
            },
            "defaultable": {
                "metadata": {
                    "label": "",
                    "description": ""
                },
                "valueType": "",
                "value": "",
                "optional": false,
                "editable": true
            }
        }
    };

    // Map variables data to form fields
    const currentFields: FormField[] = [
        {
            key: `variable`,
            label: 'Variable',
            type: 'string',
            optional: false,
            editable: true,
            documentation: '',
            value: '',
        },
        {
            key: `type`,
            label: 'Type',
            type: 'string',
            optional: false,
            editable: true,
            documentation: '',
            value: ''
        },
        {
            key: `defaultable`,
            label: 'Value',
            type: 'string',
            optional: true,
            editable: true,
            documentation: '',
            value: ''
        }
    ];

    const [fields, setFields] = useState<FormField[]>(currentFields);
    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);

    const handleSave = (data: FormValues) => {

        setFields([]);

        variable.properties.defaultable.value =
            data.defaultable === "" || data.defaultable === null ?
                "?"
                : data.type === "string" ? '"' + data.defaultable + '"' : data.defaultable;

        variable.properties.type.value = data.type;
        variable.properties.variable.value = data.variable;

        rpcClient
            .getBIDiagramRpcClient()
            .updateConfigVariables({
                configVariable: variable,
                configFilePath: variable.codedata.lineRange.fileName
            })
            .then((response: any) => {
                console.log(">>> Config variables------", response);
            });

        onClose();
    };

    const debouncedGetVisibleTypes = debounce(async (value: string, cursorPosition: number) => {
        let visibleTypes: CompletionItem[] = types;
        if (!types.length) {
            const response = await rpcClient.getBIDiagramRpcClient().getVisibleTypes({
                filePath: variable.codedata.lineRange.fileName,
                position: variable.codedata.lineRange.startLine,
            });

            visibleTypes = convertToVisibleTypes(response.types);
            setTypes(visibleTypes);
        }

        const effectiveText = value.slice(0, cursorPosition);
        const filteredTypes = visibleTypes.filter((type) => {
            const lowerCaseText = effectiveText.toLowerCase();
            const lowerCaseLabel = type.label.toLowerCase();

            return lowerCaseLabel.includes(lowerCaseText);
        });

        setFilteredTypes(filteredTypes);
    }, 250);

    
    const handleGetVisibleTypes = async (value: string, cursorPosition: number) => {
        await debouncedGetVisibleTypes(value, cursorPosition);
    };

    const handleCompletionSelect = async () => {
        handleExpressionEditorCancel();
    };

    const handleExpressionEditorCancel = () => {
        setFilteredTypes([]);
        setTypes([]);
    };

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
    };

    return (
        <>
            <PanelContainer
                title={title}
                show={props.isOpen}
                onClose={onClose}>

                <Form
                    formFields={fields}
                    onSubmit={handleSave}
                    fileName={variable.codedata.lineRange.fileName}
                    targetLineRange={{startLine: variable.codedata.lineRange.startLine, endLine: variable.codedata.lineRange.endLine}}
                    expressionEditor={{
                        completions: filteredTypes,
                        retrieveVisibleTypes: handleGetVisibleTypes,
                        onCompletionSelect: handleCompletionSelect,
                        onCancel: handleExpressionEditorCancel,
                        onBlur: handleExpressionEditorBlur,
                    }}
                />

            </PanelContainer>
        </>
    );
}
