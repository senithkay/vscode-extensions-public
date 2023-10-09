/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useRef, useState } from 'react';
import { CMRemoteFunction as RemoteFunction, CMResourceFunction as ResourceFunction } from '@wso2-enterprise/ballerina-languageclient';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { ServiceNodeModel } from '../ServiceNodeModel';
import { RemoteFunctionWidget } from './RemoteFunction';
import { ResourceFunctionWidget } from './ResourceFunction';
import { Colors, ServiceTypes } from '../../../../resources';
import { FunctionContainer } from '../styles/styles';
import { CtrlClickGo2Source, DiagramContext, NodeMenuWidget } from '../../../common';

interface FunctionCardProps {
    engine: DiagramEngine;
    node: ServiceNodeModel;
    functionElement: RemoteFunction | ResourceFunction;
    isSelected: boolean;
}

export function FunctionCard(props: FunctionCardProps) {
    const { engine, node, functionElement, isSelected } = props;
    const { editingEnabled } = useContext(DiagramContext);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const functionPorts = useRef<PortModel[]>([]);
    const path = functionElement.id;

    useEffect(() => {
        functionPorts.current.push(node.getPortFromID(`left-${path}`));
        functionPorts.current.push(node.getPortFromID(`right-${path}`));
    }, [functionElement])

    const handleOnHover = (task: string) => {
        setIsHovered(task === 'SELECT' ? true : false);
        node.handleHover(functionPorts.current, task);
    }

    return (
        <CtrlClickGo2Source location={functionElement.sourceLocation}>
            <FunctionContainer
                alignStart={isResource(functionElement) || node.serviceType === ServiceTypes.GRAPHQL}
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
                {isHovered && functionElement.sourceLocation && editingEnabled &&
                    <NodeMenuWidget
                        background={Colors.SECONDARY}
                        location={functionElement.sourceLocation}
                        resourceFunction={functionElement}
                    />
                }
            </FunctionContainer>
        </CtrlClickGo2Source>
    )
}

function isResource(functionObject: RemoteFunction | ResourceFunction): functionObject is ResourceFunction {
    return "path" in functionObject;
}
