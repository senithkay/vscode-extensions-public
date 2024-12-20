/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { ConfigVariable } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { PanelContainer, FormField, FormValues } from '@wso2-enterprise/ballerina-side-panel';
import { convertNodePropertiesToFormFields, getFormProperties } from '../../../../utils/bi';
import FormGenerator from '../../Forms/FormGenerator';


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

    const variable: ConfigVariable = {
        "id": "",
        "metadata": {
            "label": "Config",
            "description": "Create a configurable variable"
        },
        "codedata": {
            "node": "CONFIG_VARIABLE",
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
        "returning": false,
        "properties": {
            "type": {
                "metadata": {
                    "label": "Type",
                    "description": "Type of the variable"
                },
                "valueType": "TYPE",
                "value": "",
                "optional": false,
                "advanced": false,
                "editable": true
            },
            "variable": {
                "metadata": {
                    "label": "Variable",
                    "description": "Name of the variable"
                },
                "valueType": "IDENTIFIER",
                "value": "",
                "optional": false,
                "advanced": false,
                "editable": true,
            },
            "defaultable": {
                "metadata": {
                    "label": "Default value",
                    "description": "Default value for the config, if empty your need to provide a value at runtime"
                },
                "valueType": "EXPRESSION",
                "value": "",
                "optional": true,
                "advanced": true,
                "editable": true
            }
        },
        branches: []
    };

    const [fields, setFields] = useState<FormField[]>([]);

    useEffect(() => {
        const formProperties = getFormProperties(variable);
        console.log(">>> Edit config form properties", formProperties);
        setFields(convertNodePropertiesToFormFields(formProperties));
    }, []);

    const handleSave = (data: FormValues) => {

        setFields([]);

        variable.properties.defaultable.value =
            data.defaultable === "" || data.defaultable === null ?
                "?"
                : data.defaultable;
        variable.properties.defaultable.optional = true;

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
            })
            .finally(() => {
                onClose();
            });
    };

    return (
        <>
            <PanelContainer
                title={title}
                show={props.isOpen}
                onClose={onClose}
            >
                <FormGenerator
                    fileName={variable.codedata.lineRange.fileName}
                    node={variable}
                    targetLineRange={{
                        startLine: variable.codedata.lineRange.startLine,
                        endLine: variable.codedata.lineRange.endLine
                    }}
                    onSubmit={handleSave}
                />

            </PanelContainer>
        </>
    );
}

export default AddForm;
