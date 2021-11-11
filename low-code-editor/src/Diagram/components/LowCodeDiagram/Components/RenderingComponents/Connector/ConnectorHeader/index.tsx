/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React from "react";

import { STNode } from "@ballerina/syntax-tree";
import cn from "classnames";

import { EndpointViewState, StatementViewState } from "../../../../../../view-state";
import { DraftStatementViewState } from "../../../../../../view-state/draft";
import { getConnectorIcon } from "../../../../../Portals/utils";

import {
    CLIENT_RADIUS,
    CLIENT_SHADOW_OFFSET,
    CLIENT_SVG_WIDTH_WITH_SHADOW,
    ConnectorSVG
} from "./ConnectorClientSVG";
import "./style.scss";

export interface ConnectorClientProps {
    model: STNode;
}

export function ConnectorHeaderC(props: ConnectorClientProps) {
    const { model } = props
    const connectorClientViewState: StatementViewState = model.viewState as StatementViewState;
    const epViewState: EndpointViewState = connectorClientViewState.endpoint as EndpointViewState;


    const x = connectorClientViewState.endpoint.lifeLine.cx - (CLIENT_SVG_WIDTH_WITH_SHADOW / 2);
    const y = epViewState.isExternal ? connectorClientViewState.endpoint.lifeLine.cy - (CLIENT_RADIUS * 2) - (CLIENT_SHADOW_OFFSET / 2) : connectorClientViewState.bBox.cy - (CLIENT_SHADOW_OFFSET / 2);

    const draftVS: any = connectorClientViewState as DraftStatementViewState;
    const connectorIconId = (model?.viewState as StatementViewState)?.endpoint?.iconId;
    const connectorWrapper = cn("main-connector-wrapper connector-client");
    const iconProps = {
        cx: connectorClientViewState.endpoint.lifeLine.cx,
        cy: epViewState.isExternal ? connectorClientViewState.endpoint.lifeLine.cy - CLIENT_RADIUS : connectorClientViewState.endpoint.lifeLine.cy + CLIENT_RADIUS
    };

    const icon = getConnectorIcon(connectorIconId, iconProps);

    return (
            <g>
                <g className={connectorWrapper}>
                    <ConnectorSVG
                        x={x}
                        y={y}
                    />
                    <g className="icon-wrapper">
                        {icon}
                    </g>
                </g>
            </g>

    );
}

export const ConnectorHeader = ConnectorHeaderC;
