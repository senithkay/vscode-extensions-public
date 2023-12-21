import React, { useState } from "react";
import styled from "@emotion/styled";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { TextField, Button, TextArea, Icon, Dropdown } from "@wso2-enterprise/ui-toolkit";
import { Colors, DEFAULT_TYPE } from "../../resources";
import { DefaultNodeModel } from "../default";
import { HttpMethod, HttpRequestNodeProperties, Node, SwitchCaseBlock, SwitchNodeProperties } from "../../types";
import { getPortId, toSnakeCase } from "../../utils";

export interface OptionWidgetProps {
    engine: DiagramEngine;
    selectedNode: DefaultNodeModel;
    children?: React.ReactNode;
    setSelectedNode?: (node: DefaultNodeModel) => void;
    updateFlowModel?: (node: Node) => void;
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

    export const Header = styled.h5`
        font-family: "GilmerMedium";
        font-family: var(--font-family);
        color: ${Colors.ON_SURFACE};
        margin-bottom: 12px;
        margin-block-start: unset;
        user-select: none;
    `;

    export const SectionTitle = styled.h5`
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
    const { engine, selectedNode, children, setSelectedNode, updateFlowModel } = props;
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
            expression: "true",
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

    // add input port for the node
    const handleAddInputPort = () => {
        const portId = getNextInputPortId();
        selectedNode.addInPort(portId, {
            id: portId,
            type: DEFAULT_TYPE,
            name: portId,
        });
        selectedNode.setNode(node);
        // update the diagram
        engine.repaintCanvas();
        forceUpdate({} as any);
    };

    // get next input port id
    const getNextInputPortId = () => {
        let portCount = selectedNode.getInPorts().length;
        let portId = getPortId(node.name, true, portCount + 1);
        while (selectedNode.getInPorts().find((port) => port.getID() === portId)) {
            portId = getPortId(node.name, true, portCount + 1);
        }
        return portId;
    };

    const handleOnSave = () => {
        selectedNode.setNode(node);
        updateFlowModel(node);
        setSelectedNode(null);
    };

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
            {selectedNode.getKind() !== "StartNode" && selectedNode.getKind() !== "EndNode" && (
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
                    {selectedNode.getInPorts()?.map((port) => {
                        const nodePort = port.getOptions()?.port;
                        if (!nodePort) {
                            return null;
                        }
                        return (
                            <S.Row>
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
                    {(selectedNode.getKind() === "CodeBlockNode" || selectedNode.getKind() === "TransformNode") && (
                        <Button appearance="secondary" onClick={handleAddInputPort}>
                            Add Input
                        </Button>
                    )}
                </>
            )}
            {selectedNode.getKind() === "HttpRequestNode" && (
                <>
                    <S.Divider />
                    <S.SectionTitle>Connection</S.SectionTitle>
                    <S.InputField
                        label="Base URL"
                        value={(node.properties as HttpRequestNodeProperties).basePath || ""}
                        required={true}
                        onChange={(value: string) => {
                            (node.properties as HttpRequestNodeProperties).basePath = value;
                        }}
                        size={32}
                    />
                    <S.SectionTitle>Method</S.SectionTitle>
                    <S.Select
                        id="method"
                        value={(node.properties as HttpRequestNodeProperties).action || "GET"}
                        items={[{ value: "GET" }, { value: "POST" }, { value: "PUT" }]}
                        onChange={(value: string) => {
                            (node.properties as HttpRequestNodeProperties).action = value as HttpMethod;
                        }}
                    />
                    <S.InputField
                        label="Path"
                        value={(node.properties as HttpRequestNodeProperties).path || ""}
                        onChange={(value: string) => {
                            (node.properties as HttpRequestNodeProperties).path = value;
                        }}
                        size={32}
                    />
                </>
            )}
            {(selectedNode.getKind() === "CodeBlockNode" || selectedNode.getKind() === "TransformNode") && (
                <>
                    <S.Divider />
                    <TextArea
                        label="Code Block"
                        value={node?.codeBlock || ""}
                        rows={16}
                        resize="vertical"
                        onChange={(value: string) => {
                            if (node) {
                                node.codeBlock = value;
                            }
                        }}
                    />
                </>
            )}
            {selectedNode.getKind() === "switch" && (
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
                                                (node.properties as SwitchNodeProperties).cases[index].expression =
                                                    value;
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
            {selectedNode.getKind() !== "EndNode" && (
                <>
                    <S.Divider />
                    {selectedNode.getOutPorts().length > 0 && <S.SectionTitle>Output</S.SectionTitle>}
                    {selectedNode.getOutPorts()?.map((port) => {
                        const nodePort = port.getOptions()?.port;
                        if (!nodePort) {
                            return null;
                        }
                        if (selectedNode.getKind() === "switch" && nodePort.name !== "out_default") {
                            return null;
                        }
                        return (
                            <S.Row>
                                <S.InputField
                                    label="Type"
                                    value={nodePort.type}
                                    required={true}
                                    onChange={(value: string) => {
                                        nodePort.type = value;
                                    }}
                                    size={32}
                                />
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
