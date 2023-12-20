import React from "react";
import styled from "@emotion/styled";
import { Colors, DEFAULT_TYPE } from "../../resources";
import { DefaultNodeModel } from "../default";
import { TextField, Button, TextArea, Icon } from "@wso2-enterprise/ui-toolkit";
import { Node, SwitchCaseBlock } from "../../types";
import { getPortId, toSnakeCase } from "../../utils";

export interface OptionWidgetProps {
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
    `;

    export const TitleContainer = styled.div`
        display: flex;
        justify-content: space-between;
    `;

    export const Title = styled.div`
        color: ${Colors.ON_SURFACE};
        margin-bottom: 12px;
    `;

    export const InputField = styled(TextField)`
        width: 100%;
    `;
}

export function OptionWidget(props: OptionWidgetProps) {
    const { selectedNode, children, setSelectedNode, updateFlowModel } = props;
    // clone the node
    let node = JSON.parse(JSON.stringify(selectedNode.getOptions().node)) as Node;

    const handleAddCase = () => {
        const caseCount = node.properties.cases.length + 1;
        const portId = getPortId(node.name, false, caseCount + 1);
        const defaultPortId =
            node.properties?.defaultCase?.nodes.length > 0 ? node.properties.defaultCase.nodes[0] : null;
        if (defaultPortId) {
            // switch the default case to the new case
            node.properties.defaultCase.nodes = [portId];
            node.properties.cases.push({
                expression: "true",
                nodes: [defaultPortId],
            });
        } else {
            node.properties.cases.push({
                expression: "true",
                nodes: [portId],
            });
        }
        selectedNode.addOutPort(portId, {
            id: portId,
            type: DEFAULT_TYPE,
        });
        selectedNode.setNode(node);
        updateFlowModel(node);
    };

    const handleOnSave = () => {
        selectedNode.setNode(node);
        updateFlowModel(node);
        setSelectedNode(null);
    };

    return (
        <S.Tray>
            <S.TitleContainer>
                <S.Title>Configuration</S.Title>
                <Icon
                    name="close"
                    onClick={() => {
                        setSelectedNode(null);
                    }}
                />
            </S.TitleContainer>
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
            {selectedNode.getKind() === "HttpRequestNode" && (
                <S.InputField
                    label="URL"
                    value={""}
                    required={true}
                    onChange={(value: string) => {
                        // TODO: set the url
                    }}
                    size={32}
                />
            )}
            {(selectedNode.getKind() === "CodeBlockNode" || selectedNode.getKind() === "TransformNode") && (
                <TextArea
                    label="Code Block"
                    value={node?.codeBlock || ""}
                    rows={20}
                    resize="vertical"
                    onChange={(value: string) => {
                        if (node) {
                            node.codeBlock = value;
                        }
                    }}
                />
            )}
            {selectedNode.getKind() === "switch" && (
                <>
                    {node.properties?.cases?.map((caseBlock: SwitchCaseBlock, index: number) => {
                        return (
                            <div key={index}>
                                <TextArea
                                    label={`Case ${index + 1}`}
                                    value={caseBlock.expression.toString() || ""}
                                    rows={2}
                                    resize="vertical"
                                    onChange={(value: string) => {
                                        if (node) {
                                            node.properties.cases[index].expression = value;
                                        }
                                    }}
                                />
                            </div>
                        );
                    })}
                    <Button appearance="secondary" onClick={handleAddCase}>
                        Add Case
                    </Button>
                </>
            )}
            <Button onClick={handleOnSave}>Save</Button>
            {children}
        </S.Tray>
    );
}
