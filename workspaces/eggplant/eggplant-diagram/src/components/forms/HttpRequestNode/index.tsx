/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useState } from "react";
import styled from "@emotion/styled";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { TextField, Button, Icon, Dropdown } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../../resources";
import { DefaultNodeModel } from "../../default";
import { Flow, HttpMethod, HttpRequestNodeProperties, Node } from "../../../types";
import { toSnakeCase } from "../../../utils";

export interface OptionWidgetProps {
    engine: DiagramEngine;
    flowModel: Flow;
    selectedNode: DefaultNodeModel;
    children?: React.ReactNode;
    setSelectedNode?: (node: DefaultNodeModel) => void;
    updateFlowModel?: () => void;
}

namespace S {
    export const Tray = styled.div`
        width: 240px;
        background: ${Colors.SURFACE};
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        flex-grow: 0;
        flex-shrink: 0;
        gap: 6px;
        max-height: calc(100vh - 20px);
        overflow-y: auto;
    `;

    export const HeaderContainer = styled.div`
        display: flex;
        justify-content: space-between;
    `;

    export const Header = styled.h4`
        font-family: "GilmerMedium";
        font-family: var(--font-family);
        color: ${Colors.ON_SURFACE};
        margin-bottom: 12px;
        margin-block-start: unset;
        user-select: none;
    `;

    export const SectionTitle = styled.h4`
        font-family: "GilmerMedium";
        font-family: var(--font-family);
        font-weight: normal;
        color: ${Colors.ON_SURFACE};
        margin-bottom: 4px;
        margin-block-start: unset;
        user-select: none;
    `;

    export const Divider = styled.div`
        height: 1px;
        width: 100%;
        background: ${Colors.OUTLINE};
        margin: 6px 0px;
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 6px;
    `;

    export const InputField = styled(TextField)`
        width: 100%;
    `;

    export const ActionButtonContainer = styled.div`
        position: sticky;
        bottom: 0;
        padding-top: 16px;
        background: ${Colors.SURFACE};
        width: 100%;
        & vscode-button {
            width: 100%;
        }
    `;

    export const ActionButton = styled(Button)`
        width: 100%;
    `;

    export const Select = styled(Dropdown)`
        & label {
            font-family: var(--font-family);
            outline: none;
            user-select: none;
            font-size: var(--type-ramp-base-font-size);
            line-height: var(--type-ramp-base-line-height);
        }
    `;
}
// TODO: update this component with multiple form components
export function HttpRequestNodeForm(props: OptionWidgetProps) {
    const { engine, flowModel, selectedNode, children, setSelectedNode, updateFlowModel } = props;

    const [selectedEndpoint, setSelectedEndpoint] = useState(flowModel.endpoints[0]);
    const node = useRef(JSON.parse(JSON.stringify(selectedNode.getOptions().node)) as Node)
    const nodeProperties = useRef(node.current.properties as HttpRequestNodeProperties)

    const handleOnSave = () => {
        nodeProperties.current.endpoint = selectedEndpoint;
        node.current.properties = nodeProperties.current;
        console.log(">>> node", node.current);
        selectedNode.setNode(node.current);
        updateFlowModel();
        setSelectedNode(null);
    };

    return (
        <S.Tray>
            <S.HeaderContainer>
                <S.Header>Configuration HTTP</S.Header>
                <Icon
                    name="close"
                    onClick={() => {
                        setSelectedNode(null);
                    }}
                />
            </S.HeaderContainer>
            <S.InputField
                label="Component Name"
                value={selectedNode.getName()}
                required={true}
                onChange={(value: string) => {
                    node.current.name = toSnakeCase(value);
                }}
                size={32}
            />
            {selectedNode.getInPorts().length > 0 && (
                <>
                    <S.Divider />
                    <S.SectionTitle>Input</S.SectionTitle>
                    {selectedNode.getInPorts()?.map((port, index) => {
                        const nodePort = port.getOptions()?.port;
                        if (!nodePort) {
                            return null;
                        }
                        return (
                            <S.Row key={index}>
                                <S.InputField
                                    label="Type"
                                    value={nodePort.type}
                                    required={true}
                                    onChange={(value: string) => {
                                        nodePort.type = value;
                                    }}
                                    size={32}
                                />
                                <S.InputField
                                    label="Name"
                                    value={nodePort.name}
                                    required={true}
                                    onChange={(value: string) => {
                                        nodePort.name = value;
                                    }}
                                    size={32}
                                />
                            </S.Row>
                        );
                    })}
                </>
            )}
            <>
                <S.Divider />
                <S.SectionTitle>Connection</S.SectionTitle>
                {flowModel.endpoints.length > 0 && (
                    <S.Select
                        id="endpoint"
                        value={selectedEndpoint.name}
                        items={flowModel.endpoints.map((ep) => {
                            return { value: ep.name };
                        })}
                        onChange={(value: string) => {
                            setSelectedEndpoint(flowModel.endpoints.find((ep) => ep.name === value));
                        }}
                    />
                )}
                {/* <S.InputField
                        label="Base URL"
                        value={(node.properties as HttpRequestNodeProperties).endpoint.baseUrl || ""}
                        required={true}
                        onChange={(value: string) => {
                            (node.properties as HttpRequestNodeProperties).endpoint.baseUrl = value;
                        }}
                        size={32}
                    /> */}
                <S.SectionTitle>Method</S.SectionTitle>
                <S.Select
                    id="method"
                    value={nodeProperties.current?.action || "get"}
                    items={[{ value: "get" }, { value: "post" }, { value: "put" }, { value: "delete" }]}
                    onChange={(value: string) => {
                        nodeProperties.current.action = value as HttpMethod;
                    }}
                />
                <S.InputField
                    label="Path"
                    value={nodeProperties.current?.path || ""}
                    onChange={(value: string) => {
                        nodeProperties.current.path = value;
                    }}
                    size={32}
                />
            </>
            <>
                <S.Divider />
                {selectedNode.getOutPorts().length > 0 && <S.SectionTitle>Output</S.SectionTitle>}
                {selectedNode.getOutPorts()?.map((port, index) => {
                    const nodePort = port.getOptions()?.port;
                    if (!nodePort) {
                        return null;
                    }
                    if (selectedNode.getKind() === "SwitchNode" && nodePort.name !== "out_default") {
                        return null;
                    }
                    return (
                        <S.Row key={index}>
                            <S.InputField
                                label="Type"
                                value={nodeProperties.current.outputType}
                                required={true}
                                onChange={(value: string) => {
                                    nodeProperties.current.outputType = value;
                                }}
                                size={32}
                            />
                        </S.Row>
                    );
                })}
            </>

            <S.ActionButtonContainer>
                <S.ActionButton onClick={handleOnSave}>Save</S.ActionButton>
            </S.ActionButtonContainer>
            {children}
        </S.Tray>
    );
}
