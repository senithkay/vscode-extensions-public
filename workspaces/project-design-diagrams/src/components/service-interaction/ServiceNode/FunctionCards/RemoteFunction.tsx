/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { CMRemoteFunction as RemoteFunction } from '@wso2-enterprise/ballerina-languageclient';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { GraphQLMutationIcon, ServiceTypes } from '../../../../resources';
import { ServiceNodeModel } from '../ServiceNodeModel';
import { ServicePortWidget } from '../../ServicePort/ServicePortWidget';
import { RemoteName } from '../styles/styles';

interface RemoteFunctionProps {
    engine: DiagramEngine;
    node: ServiceNodeModel;
    remoteFunc: RemoteFunction;
}

export function RemoteFunctionWidget(props: RemoteFunctionProps) {
    const { engine, node, remoteFunc } = props;

    return (
        <>
            <ServicePortWidget
                port={node.getPort(`left-${remoteFunc.name}`)}
                engine={engine}
            />
                {node.serviceType === ServiceTypes.GRAPHQL && <GraphQLMutationIcon />}
                <RemoteName spaceOut={node.serviceType === ServiceTypes.GRAPHQL}>
                    {remoteFunc.name}
                </RemoteName>
            <ServicePortWidget
                port={node.getPort(`right-${remoteFunc.name}`)}
                engine={engine}
            />
        </>
    );
}
