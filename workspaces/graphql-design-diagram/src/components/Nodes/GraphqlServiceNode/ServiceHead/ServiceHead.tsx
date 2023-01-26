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
// tslint:disable: jsx-no-lambda
import React, { useEffect, useRef } from 'react';

import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';

import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { GraphQLIcon } from "../../../resources/assets/icons/GraphQL";
import { HeaderName } from "../../../resources/styles/styles";
import { GraphqlServiceNodeModel } from "../GraphqlServiceNodeModel";
import { ServiceHead } from '../styles/styles';

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: GraphqlServiceNodeModel;
}

export function ServiceHeadWidget(props: ServiceHeadProps) {
    const { engine, node } = props;
    const headPorts = useRef<PortModel[]>([]);

    const displayName: string = node.serviceObject.serviceName ? node.serviceObject.serviceName : "/root";

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node]);


    return (
        <ServiceHead>
            <GraphQLIcon/>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${node.getID()}`)}
                engine={engine}
            />
            <HeaderName>{displayName}</HeaderName>

            <GraphqlBasePortWidget
                port={node.getPort(`right-${node.getID()}`)}
                engine={engine}
            />
            <GraphqlBasePortWidget
                port={node.getPort(`top-${node.getID()}`)}
                engine={engine}
            />
        </ServiceHead>
    );
}
