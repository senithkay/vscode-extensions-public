/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import styled from '@emotion/styled';
import { ConfigVariable, EVENT_TYPE, FlowNode, MACHINE_VIEW } from '@wso2/ballerina-core';
import { useRpcContext } from "@wso2/ballerina-rpc-client";
import { PanelContainer, FormValues } from '@wso2/ballerina-side-panel';
import FormGenerator from '../../Forms/FormGenerator';
import { useState } from 'react';

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
    onClose?: () => void;
    variable: ConfigVariable;
    title: string;
    filename: string;
    packageName: string;
    moduleName: string;
    onSubmit?: () => void;
}

export function EditForm(props: ConfigFormProps) {
    const { isOpen, onClose, onSubmit, variable, title, filename } = props;
    const [isSaving, setIsSaving] = useState(false);

    const { rpcClient } = useRpcContext();

    const handleSave = async (data: FlowNode) => {
        setIsSaving(true);
        // update the variable with the previous variable name value if modified
        if (data?.properties?.variable?.modified) {
            data = {
                ...data,
                properties: {
                    ...data.properties,
                    variable: {
                        ...data.properties.variable,
                        oldValue: String(variable.properties.variable.value)
                    }
                }
            };
        }
        
        await rpcClient.getBIDiagramRpcClient().updateConfigVariablesV2({
            configFilePath: props.filename,
            configVariable: data,
            packageName: props.packageName,
            moduleName: props.moduleName,
        }).finally(() => {
            onSubmit();
        });
        setIsSaving(false);
        onClose();
    };

    const goToViewConfig = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.ViewConfigVariables,
            },
        });
    };

    return (
        <>
            <PanelContainer
                title={title}
                show={isOpen}
                onClose={onClose ? onClose : goToViewConfig}
            >
                <FormGenerator
                    fileName={filename}
                    node={variable}
                    targetLineRange={{
                        startLine: variable.codedata?.lineRange?.startLine,
                        endLine: variable.codedata?.lineRange?.endLine
                    }}
                    onSubmit={handleSave}
                    showProgressIndicator={isSaving}
                />
            </PanelContainer>
        </>
    );
}

export default EditForm;
