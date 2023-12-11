import React, { useReducer } from "react";
import styled from "@emotion/styled";
import { Colors } from "../../resources";
import { DefaultNodeModel } from "../default";
import { TextField } from "@wso2-enterprise/ui-toolkit";

export interface OptionWidgetProps {
    selectedNode: DefaultNodeModel;
    children?: React.ReactNode;
}

namespace S {
    export const Tray = styled.div`
        min-width: 200px;
        background: ${Colors.SURFACE};
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        flex-grow: 0;
        flex-shrink: 0;
        gap: 6px;
    `;

    export const Title = styled.div`
        color: ${Colors.ON_SURFACE};
        margin-bottom: 12px;
    `;
}

export function OptionWidget(props: OptionWidgetProps) {
    const { selectedNode, children } = props;

    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    const node = selectedNode.getOptions().node;
    console.log("OptionWidget", selectedNode);
    return (
        <S.Tray>
            <S.Title>Components Options</S.Title>
            <TextField
                label="Name"
                value={node.name}
                onChange={(value: string) => {
                    node.name = value;
                    // forceUpdate();
                }}
            />

            {children}
        </S.Tray>
    );
}
