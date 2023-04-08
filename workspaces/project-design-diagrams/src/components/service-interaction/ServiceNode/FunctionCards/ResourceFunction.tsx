/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React from 'react';
import { ServiceResourceFunction } from '@wso2-enterprise/ballerina-languageclient';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { ServiceNodeModel } from '../ServiceNodeModel';
import { ServicePortWidget } from '../../ServicePort/ServicePortWidget';
import { GraphQLQueryIcon, GraphQLSubscriptionIcon, GRAPHQL_SUBSCRIBE_ACTION, ServiceTypes } from '../../../../resources';
import { ActionColors, ResourceAction, ResourceName } from '../styles/styles';

interface ResourceFunctionProps {
    engine: DiagramEngine;
    node: ServiceNodeModel;
    resource: ServiceResourceFunction;
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
