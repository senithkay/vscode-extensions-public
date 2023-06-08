/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useRef } from "react";

import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { CtrlClickHandler } from "../../../CtrlClickHandler";
import { GoToSourceNodeMenu } from "../../../NodeActionMenu/GoToSourceNodeMenu";
import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { ServiceClassIcon } from "../../../resources/assets/icons/ServiceClassIcon";
import { HeaderName, InterfaceNodeHeader, InterfaceSubHeader } from "../../../resources/styles/styles";
import { getFormattedPosition } from "../../../utils/common-util";
import { InterfaceNodeModel } from "../InterfaceNodeModel";

interface InterfaceHeadProps {
    engine: DiagramEngine;
    node: InterfaceNodeModel;
}

export function InterfaceHeadWidget(props: InterfaceHeadProps) {
    const { engine, node } = props;
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.interfaceObject.name;

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node]);

    return (
        <CtrlClickHandler
            filePath={node.interfaceObject?.position?.filePath}
            position={node.interfaceObject?.position && getFormattedPosition(node.interfaceObject.position)}
        >
            <InterfaceNodeHeader>
                <div>{"<<interface>>"}</div>
                <InterfaceSubHeader>
                    <ServiceClassIcon/>
                    <GraphqlBasePortWidget
                        port={node.getPort(`left-${node.getID()}`)}
                        engine={engine}
                    />
                    <HeaderName>{displayName}</HeaderName>
                    <GoToSourceNodeMenu location={node.interfaceObject?.position} />
                    <GraphqlBasePortWidget
                        port={node.getPort(`right-${node.getID()}`)}
                        engine={engine}
                    />
                    <GraphqlBasePortWidget
                        port={node.getPort(`top-${node.getID()}`)}
                        engine={engine}
                    />
                </InterfaceSubHeader>
            </InterfaceNodeHeader>
        </CtrlClickHandler>
    );
}
