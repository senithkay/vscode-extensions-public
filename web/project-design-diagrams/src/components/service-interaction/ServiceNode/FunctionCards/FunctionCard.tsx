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

import React, { useEffect, useRef, useState } from 'react';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { ServiceNodeModel } from '../ServiceNodeModel';
import { RemoteFunctionWidget } from './RemoteFunction';
import { ResourceFunctionWidget } from './ResourceFunction';
import { ResourceFunction, RemoteFunction, Colors } from '../../../../resources';
import { FunctionContainer } from '../styles';
import { NodeMenuWidget } from '../../../common';

interface FunctionCardProps {
    engine: DiagramEngine;
    node: ServiceNodeModel;
    functionElement: ResourceFunction | RemoteFunction;
    isSelected: boolean;
}

export function FunctionCard(props: FunctionCardProps) {
    const { engine, node, functionElement, isSelected } = props;
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const functionPorts = useRef<PortModel[]>([]);
    const path = isResource(functionElement) ? `${functionElement.resourceId.action}/${functionElement.identifier}` :
        functionElement.name;

    useEffect(() => {
        functionPorts.current.push(node.getPortFromID(`left-${path}`));
        functionPorts.current.push(node.getPortFromID(`right-${path}`));
    }, [functionElement])

    const handleOnHover = (task: string) => {
        setIsHovered(task === 'SELECT' ? true : false);
        node.handleHover(functionPorts.current, task);
    }

    return (
        <FunctionContainer
            isResource={isResource(functionElement)}
            isSelected={isHovered || isSelected}
            onMouseOver={() => handleOnHover('SELECT')}
            onMouseLeave={() => handleOnHover('UNSELECT')}
        >
            {isResource(functionElement) ?
                <ResourceFunctionWidget
                    engine={engine}
                    node={node}
                    resource={functionElement}
                    resourcePath={path}
                /> :
                <RemoteFunctionWidget
                    engine={engine}
                    node={node}
                    remoteFunc={functionElement}
                />
            }
            {isHovered && functionElement.lineRange &&
                <NodeMenuWidget
                    background={Colors.SECONDARY}
                    lineRange={functionElement.lineRange}
                />
            }
        </FunctionContainer>
    )
}

function isResource(functionObject: ResourceFunction | RemoteFunction): functionObject is ResourceFunction {
    return (functionObject as ResourceFunction).resourceId !== undefined;
}
