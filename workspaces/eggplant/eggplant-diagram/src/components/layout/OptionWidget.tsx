import React, { useReducer } from "react";
import styled from "@emotion/styled";
import { Colors, NODE_TYPE } from "../../resources";
import { DefaultNodeModel } from "../default";
import { TextField, Button, TextArea, Icon } from "@wso2-enterprise/ui-toolkit";
import { Flow, Node } from "../../types";

export interface OptionWidgetProps {
    selectedNode: DefaultNodeModel;
    children?: React.ReactNode;
    setSelectedNode?: (node: DefaultNodeModel) => void;
    forceUpdate?: () => void;
    updateFlowModel?: (node: Node) => void;
}

namespace S {
    export const Tray = styled.div`
        width: 196px;
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
        & vscode-text-field {
            width: 100%;
            & .root {
                width: 100%;
            }
        }
    `;
}

export function OptionWidget(props: OptionWidgetProps) {
    const { selectedNode, children, setSelectedNode, updateFlowModel } = props;
    // clone the node
    let node = JSON.parse(JSON.stringify(selectedNode.getOptions().node as Node));

    return (
        <S.Tray>
            <S.TitleContainer>
                <S.Title>Configure</S.Title>
                <Icon
                    name="close"
                    onClick={() => {
                        setSelectedNode(null);
                    }}
                />
            </S.TitleContainer>
            <S.InputField
                label="Name"
                value={selectedNode.getName()}
                required={true}
                onChange={(value: string) => {
                    node.name = value;
                }}
            />
            {selectedNode.getKind() === NODE_TYPE.CODE_BLOCK && (
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
            <Button
                onClick={() => {
                    selectedNode.setNode(node);
                    updateFlowModel(node);
                }}
            >
                Save
            </Button>
            {children}
        </S.Tray>
    );
}
