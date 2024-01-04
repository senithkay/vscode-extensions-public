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
import { HttpMethod, NodeKinds } from "../../types";

export interface TrayItemWidgetProps {
    model: TrayItemModel;
    color?: string;
    name: string;
}

export type TrayItemModel = {
    type: NodeKinds,
    action?: HttpMethod, // TODO: handle this dynamic sub types properly
}

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
        width: max-content;
    `;
}

export function TrayItemWidget(props: TrayItemWidgetProps) {
    const { model, color, name } = props;
    return (
        <S.Tray
            color={color}
            draggable={true}
            onDragStart={(event) => {
                event.dataTransfer.setData(EVENT_TYPES.ADD_NODE, JSON.stringify(model));
            }}
            className="tray-item"
        >
            {name}
        </S.Tray>
    );
}
