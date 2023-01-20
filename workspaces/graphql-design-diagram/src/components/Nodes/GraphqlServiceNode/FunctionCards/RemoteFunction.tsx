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
import { RemoteFunction } from "../../../resources/model";
import { GraphqlServiceNodeModel } from "../GraphqlServiceNodeModel";
import { ResourceName } from "../styles/styles";

interface RemoteFunctionProps {
    engine: DiagramEngine;
    node: GraphqlServiceNodeModel;
    remoteFunc: RemoteFunction;
    remotePath: string;
}

export function RemoteFunctionWidget(props: RemoteFunctionProps) {
    const { engine, node, remoteFunc, remotePath } = props;

    return (
        <>
            <GraphqlBasePortWidget
                port={node.getPort(`left-${remotePath}`)}
                engine={engine}
            />
            <ResourceName>
                {remoteFunc.identifier}
            </ResourceName>
            {remoteFunc.returns}
            <GraphqlBasePortWidget
                port={node.getPort(`right-${remotePath}`)}
                engine={engine}
            />
        </>
    );
}
