/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { Colors, EVENT_TYPES } from "../../resources";
import { Endpoint, HttpMethod, NodeKinds } from "../../types";
import { FunctionIcon } from "../../resources/assets/icons/FunctionIcon";
import { JoinIcon } from "../../resources/assets/icons/JoinIcon";
import { LinkOutIcon } from "../../resources/assets/icons/LinkOutIcon";
import { SwitchIcon } from "../../resources/assets/icons/SwitchIcon";
import { TriggerIcon } from "../../resources/assets/icons/TriggerIcon";

export interface TrayItemWidgetProps {
    model: TrayItemModel;
    name: string;
    color?: string;
}

export type TrayItemModel = {
    type: NodeKinds;
    endpoint?: Endpoint;
    action?: HttpMethod;
};

namespace S {
    export const Tray = styled.div<{ color: string }>`
        color: ${Colors.ON_SURFACE};
        background-color: ${Colors.SURFACE_BRIGHT};
        font-family: sans-serif;
        font-size: 14px;
        padding: 8px 12px;
        border: solid 2px ${Colors.OUTLINE_VARIANT};
        border-radius: 5px;
        margin-bottom: 2px;
        cursor: pointer;
        width: 160px;
        display: flex;
        flex-direction: row;
        align-items: center;
    `;

    export const IconContainer = styled.div`
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        & svg {
            height: 16px;
            width: 16px;
            fill: ${Colors.ON_SURFACE};
            stroke: ${Colors.ON_SURFACE};
        }
    `;
}

export function TrayItemWidget(props: TrayItemWidgetProps) {
    const { model, color, name } = props;

    const componentIcon = (type: NodeKinds) => {
        switch (type) {
            case "SwitchNode":
                return <SwitchIcon />;
            case "CodeBlockNode":
                return <FunctionIcon />;
            case "TransformNode":
                return <JoinIcon />;
            case "HttpRequestNode":
                return <LinkOutIcon />;
            case "NewPayloadNode":
                return <TriggerIcon />;
            default:
                <></>;
        }
    };

    return (
        <S.Tray
            color={color}
            draggable={true}
            onDragStart={(event) => {
                event.dataTransfer.setData(EVENT_TYPES.ADD_NODE, JSON.stringify(model));
            }}
            className="tray-item"
        >
            <S.IconContainer>{componentIcon(model.type)}</S.IconContainer>
            {name}
        </S.Tray>
    );
}
