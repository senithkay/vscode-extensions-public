/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as React from "react";
import { PointModel } from "@projectstorm/react-diagrams-core";
import styled from "@emotion/styled";

export interface DefaultLinkPointWidgetProps {
    point: PointModel;
    color?: string;
    colorSelected: string;
}

export interface DefaultLinkPointWidgetState {
    selected: boolean;
}

namespace S {
    export const PointTop = styled.circle`
        pointer-events: all;
    `;
}

export class DefaultLinkPointWidget extends React.Component<DefaultLinkPointWidgetProps, DefaultLinkPointWidgetState> {
    constructor(props: DefaultLinkPointWidgetProps | Readonly<DefaultLinkPointWidgetProps>) {
        super(props);
        this.state = {
            selected: false,
        };
    }

    render() {
        const { point } = this.props;
        return (
            <g>
                <circle
                    cx={point.getPosition().x}
                    cy={point.getPosition().y}
                    r={5}
                    fill={this.state.selected || this.props.point.isSelected() ? this.props.colorSelected : this.props.color}
                />
                <S.PointTop
                    className="point"
                    onMouseLeave={() => {
                        this.setState({ selected: false });
                    }}
                    onMouseEnter={() => {
                        this.setState({ selected: true });
                    }}
                    data-id={point.getID()}
                    data-linkid={point.getLink().getID()}
                    cx={point.getPosition().x}
                    cy={point.getPosition().y}
                    r={15}
                    opacity={0.0}
                />
            </g>
        );
    }
}
