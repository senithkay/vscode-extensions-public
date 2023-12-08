/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as React from "react";
import { DefaultLabelModel } from "./DefaultLabelModel";
import styled from "@emotion/styled";
import { Colors } from "../../../resources";

export interface DefaultLabelWidgetProps {
    model: DefaultLabelModel;
}

namespace S {
    export const Label = styled.div`
        background: ${Colors.SURFACE_DIM};
        border-radius: 5px;
        color: ${Colors.ON_SURFACE};
        font-size: 12px;
        padding: 4px 8px;
        font-family: sans-serif;
        user-select: none;
    `;
}

export class DefaultLabelWidget extends React.Component<DefaultLabelWidgetProps> {
    render() {
        return <S.Label>{this.props.model.getOptions().label}</S.Label>;
    }
}
