/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import { ConfigVariable, EVENT_TYPE, FlowNode, MACHINE_VIEW } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { PanelContainer, FormValues } from '@wso2-enterprise/ballerina-side-panel';
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

    const { rpcClient } = useRpcContext();

    const handleSave = async (data: FlowNode) => {
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
            if (onClose) {
                onSubmit();
            }
        });
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
                />
            </PanelContainer>
        </>
    );
}

export default EditForm;
