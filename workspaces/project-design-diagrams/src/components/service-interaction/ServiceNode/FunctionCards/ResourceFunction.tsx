/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React from 'react';
import { CMResourceFunction as ResourceFunction } from '@wso2-enterprise/ballerina-languageclient';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ServiceNodeModel } from '../ServiceNodeModel';
import { ServicePortWidget } from '../../ServicePort/ServicePortWidget';
import { GraphQLQueryIcon, GraphQLSubscriptionIcon, GRAPHQL_SUBSCRIBE_ACTION, ServiceTypes } from '../../../../resources';
import { ActionColors, ResourceAction, ResourceName } from '../styles/styles';

interface ResourceFunctionProps {
    engine: DiagramEngine;
    node: ServiceNodeModel;
    resource: ResourceFunction;
    resourcePath: string;
}

export function ResourceFunctionWidget(props: ResourceFunctionProps) {
    const { engine, node, resource, resourcePath } = props;
    return (
        <>
            <ServicePortWidget
                port={node.getPort(`left-${resourcePath}`)}
                engine={engine}
            />
            {node.serviceType === ServiceTypes.GRAPHQL ?
                resource.resourceId.action === GRAPHQL_SUBSCRIBE_ACTION ?
                    <GraphQLSubscriptionIcon /> :
                    <GraphQLQueryIcon /> :
                <ResourceAction color={ActionColors.get(resource.resourceId.action)}>
                    {resource.resourceId.action}
                </ResourceAction>
            }
            <ResourceName>
                {resource.resourceId.path}
            </ResourceName>
            <ServicePortWidget
                port={node.getPort(`right-${resourcePath}`)}
                engine={engine}
            />
        </>
    );
}
