/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as React from "react";
import { AdvancedLinkModel } from "./AdvancedLinkModel";
import { AdvancedLinkWidget } from "./AdvancedLinkWidget";
import styled from "@emotion/styled";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { css, keyframes } from "@emotion/react";

namespace S {
    export const Keyframes = keyframes`
		from {
			stroke-dashoffset: 24;
		}
		to {
			stroke-dashoffset: 0;
		}
	`;

    export const Path = styled.path`
        fill: none;
        pointer-events: auto;
    `;
}

export class AdvancedLinkFactory<Link extends AdvancedLinkModel = AdvancedLinkModel> extends AbstractReactFactory<Link, DiagramEngine> {
    constructor(type = "default-2") {
        super(type);
    }

    generateReactWidget(event: { model: AdvancedLinkModel }): JSX.Element {
        return <AdvancedLinkWidget link={event.model} diagramEngine={this.engine} />;
    }

    generateModel(): Link {
        return new AdvancedLinkModel() as Link;
    }

    generateLinkSegment(model: Link, selected: boolean, path: string, showArrow?: boolean) {
        return (
            <g>
                <S.Path
                    // selected={selected}
                    stroke={selected ? model.getOptions().selectedColor : model.getOptions().color}
                    strokeWidth={model.getOptions().width}
                    d={path}
                    markerEnd={showArrow ? "url(#arrowhead)" :""}
                />
            </g>
        );
    }
}
