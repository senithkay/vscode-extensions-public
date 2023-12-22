/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import styled from "@emotion/styled";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { TextField, Button, TextArea, Icon, Dropdown } from "@wso2-enterprise/ui-toolkit";
import { Colors, DEFAULT_TYPE } from "../../resources";
import { DefaultNodeModel } from "../default";
import {
    CodeNodeProperties,
    Flow,
    Node,
    SwitchCaseBlock,
    SwitchNodeProperties,
} from "../../types";
import { getPortId, toSnakeCase } from "../../utils";
import { HttpRequestNodeForm } from "../forms/HttpRequestNode";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

export interface OptionWidgetProps {
    engine: DiagramEngine;
    flowModel: Flow;
    selectedNode: DefaultNodeModel;
    children?: React.ReactNode;
    setSelectedNode?: (node: DefaultNodeModel) => void;
    openDataMapper: (postion: NodePosition) => void;
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
export function OptionWidget(props: OptionWidgetProps) {
    const { engine, flowModel, selectedNode, children, setSelectedNode, openDataMapper, updateFlowModel } = props;
    const [, forceUpdate] = useState();

    // clone the node
    let node = JSON.parse(JSON.stringify(selectedNode.getOptions().node)) as Node;

    const handleAddCase = () => {
        const nodeProperties = node.properties as SwitchNodeProperties;
        let caseCount = nodeProperties.cases.length;
        let portId = getPortId(node.name, false, caseCount + 1);
        while (selectedNode.getOutPorts().find((port) => port.getID() === portId)) {
            caseCount++;
            portId = getPortId(node.name, false, caseCount + 1);
        }
        // add new case and port
        nodeProperties.cases.push({
            expression: {
                expression: "true",
            },
            nodes: [portId],
        });
        selectedNode.addOutPort(portId, {
            id: portId,
            type: DEFAULT_TYPE,
        });
        selectedNode.setNode(node);
        // update the diagram
        engine.repaintCanvas();
        forceUpdate({} as any);
    };

    const handleOpenDataMapper = () => {
        // handleOnSave();
        // TODO: Use the actual position of the node when the BE is ready
        openDataMapper({startLine: 10, startColumn: 0, endLine: 13, endColumn: 2});
    };

    const handleOnSave = () => {
        selectedNode.setNode(node);
        updateFlowModel();
        setSelectedNode(null);
    };

    if (selectedNode.getKind() === "HttpRequestNode") {
        return <HttpRequestNodeForm {...props} />;
    }

    return (
        <S.Tray>
            <S.HeaderContainer>
                <S.Header>Configuration</S.Header>
                <Icon
                    name="close"
                    onClick={() => {
                        setSelectedNode(null);
                    }}
                />
            </S.HeaderContainer>
            {selectedNode.getKind() !== "StartNode" && selectedNode.getKind() !== "HttpResponseNode" && (
                <S.InputField
                    label="Component Name"
                    value={selectedNode.getName()}
                    required={true}
                    onChange={(value: string) => {
                        node.name = toSnakeCase(value);
                    }}
                    size={32}
                />
            )}
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

            {selectedNode.getKind() === "CodeBlockNode" && (
                <>
                    <S.Divider />
                    <TextArea
                        label="Code Block"
                        value={(node?.properties as CodeNodeProperties)?.codeBlock?.expression || ""}
                        rows={16}
                        resize="vertical"
                        onChange={(value: string) => {
                            if (node) {
                                (node.properties as CodeNodeProperties).codeBlock.expression = value;
                            }
                        }}
                    />
                </>
            )}
            {selectedNode.getKind() === "TransformNode" && (
                <>
                    <S.Divider />
                    <Button appearance="secondary" onClick={handleOpenDataMapper}>
                        Use Data Mapper
                    </Button>
                </>
            )}
            {selectedNode.getKind() === "SwitchNode" && (
                <>
                    <S.Divider />
                    <S.SectionTitle>Conditions</S.SectionTitle>
                    {(node.properties as SwitchNodeProperties)?.cases?.map(
                        (caseBlock: SwitchCaseBlock, index: number) => {
                            return (
                                <div key={index}>
                                    <TextArea
                                        label={`Case ${index + 1}`}
                                        value={caseBlock.expression.toString() || ""}
                                        rows={2}
                                        resize="vertical"
                                        onChange={(value: string) => {
                                            if (node) {
                                                (node.properties as SwitchNodeProperties).cases[
                                                    index
                                                ].expression.expression = value;
                                            }
                                        }}
                                    />
                                </div>
                            );
                        }
                    )}
                    <Button appearance="secondary" onClick={handleAddCase}>
                        Add Case
                    </Button>
                </>
            )}
            {selectedNode.getKind() !== "HttpResponseNode" && (
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
                                    value={nodePort.type}
                                    required={true}
                                    onChange={(value: string) => {
                                        nodePort.type = value;
                                    }}
                                    size={32}
                                />
                                {selectedNode.getKind() === "CodeBlockNode" && (
                                    <S.InputField
                                        label="Name"
                                        value={(node.properties as CodeNodeProperties).returnVar || "payload"}
                                        required={true}
                                        onChange={(value: string) => {
                                            (node.properties as CodeNodeProperties).returnVar = value;
                                        }}
                                        size={32}
                                    />
                                )}
                            </S.Row>
                        );
                    })}
                </>
            )}
            <S.ActionButtonContainer>
                <S.ActionButton onClick={handleOnSave}>Save</S.ActionButton>
            </S.ActionButtonContainer>
            {children}
        </S.Tray>
    );
}
