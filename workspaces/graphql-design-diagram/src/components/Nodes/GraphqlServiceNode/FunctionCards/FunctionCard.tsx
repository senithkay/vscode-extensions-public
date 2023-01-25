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

// tslint:disable: jsx-no-multiline-js jsx-no-lambda sx-wrap-multiline
import React, { useEffect, useRef } from 'react';

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
