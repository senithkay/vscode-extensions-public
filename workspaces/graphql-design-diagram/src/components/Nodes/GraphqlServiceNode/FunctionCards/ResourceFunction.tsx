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

import { DiagramEngine } from '@projectstorm/react-diagrams';

import { GraphqlBasePortWidget } from "../../../Port/GraphqlBasePortWidget";
import { ResourceFunction } from "../../../resources/model";
import { GraphqlServiceNodeModel } from "../GraphqlServiceNodeModel";
import { ResourceName } from '../styles/styles';

interface ResourceFunctionProps {
    engine: DiagramEngine;
    node: GraphqlServiceNodeModel;
    resource: ResourceFunction;
    resourcePath: string;
}
// TODO: add params, return
export function ResourceFunctionWidget(props: ResourceFunctionProps) {
    const { engine, node, resource, resourcePath} = props;

    return (
        <>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${resourcePath}`)}
                engine={engine}
            />
                <ResourceName>
                    {resource.identifier}
                </ResourceName>
            {resource.returns}
            <GraphqlBasePortWidget
                port={node.getPort(`right-${resourcePath}`)}
                engine={engine}
            />
        </>
    );
}
