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
// tslint:disable: jsx-no-multiline-js
// tslint:disable: jsx-no-lambda
// tslint:disable: sx-wrap-multiline
import React, { useEffect, useRef, useState } from 'react';

import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';

import { RemoteFunction, ResourceFunction } from '../../../resources/model';
import { GraphqlServiceNodeModel } from "../GraphqlServiceNodeModel";
import { FunctionContainer } from '../styles/styles';

import { RemoteFunctionWidget } from './RemoteFunction';
import { ResourceFunctionWidget } from './ResourceFunction';

interface FunctionCardProps {
    engine: DiagramEngine;
    node: GraphqlServiceNodeModel;
    functionElement: ResourceFunction | RemoteFunction;
    isResourceFunction: boolean;
}

export function FunctionCard(props: FunctionCardProps) {
    const { engine, node, functionElement, isResourceFunction } = props;

    const functionPorts = useRef<PortModel[]>([]);
    const path = functionElement.identifier;

    useEffect(() => {
        functionPorts.current.push(node.getPortFromID(`left-${path}`));
        functionPorts.current.push(node.getPortFromID(`right-${path}`));
    }, [functionElement])


    return (
        <FunctionContainer>
            { isResourceFunction ? (
                    <ResourceFunctionWidget
                        engine={engine}
                        node={node}
                        resource={functionElement as ResourceFunction}
                        resourcePath={path}
                    />
                )
                 : (
                    <RemoteFunctionWidget
                        engine={engine}
                        node={node}
                        remoteFunc={functionElement}
                        remotePath={path}
                    />
                )
            }
        </FunctionContainer>
    )
}
