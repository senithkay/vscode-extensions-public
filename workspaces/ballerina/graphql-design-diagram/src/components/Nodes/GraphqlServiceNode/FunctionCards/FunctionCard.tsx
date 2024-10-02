/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda sx-wrap-multiline
import React, { useEffect, useRef, useState } from 'react';

import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';

import { CtrlClickHandler } from '../../../CtrlClickHandler';
import { FunctionType, RemoteFunction, ResourceFunction } from '../../../resources/model';
import { getFormattedPosition } from "../../../utils/common-util";
import { GraphqlServiceNodeModel } from "../GraphqlServiceNodeModel";
import { FunctionContainer } from '../styles/styles';

import { FunctionMenuWidget } from "./FunctionMenuWidget";
import { RemoteFunctionWidget } from './RemoteFunction';
import { ResourceFunctionWidget } from './ResourceFunction';

interface FunctionCardProps {
    engine: DiagramEngine;
    node: GraphqlServiceNodeModel;
    functionElement: ResourceFunction | RemoteFunction;
    isResourceFunction: boolean;
    isSubscription?: boolean;
}

export function FunctionCard(props: FunctionCardProps) {
    const { engine, node, functionElement, isResourceFunction, isSubscription } = props;

    const [isHovered, setIsHovered] = useState<boolean>(false);

    const functionPorts = useRef<PortModel[]>([]);
    const path = functionElement.identifier;

    useEffect(() => {
        functionPorts.current.push(node.getPortFromID(`left-${path}`));
        functionPorts.current.push(node.getPortFromID(`right-${path}`));
    }, [functionElement]);

    const handleOnHover = (task: string) => {
        setIsHovered(task === 'SELECT' ? true : false);
    };

    const addFunctionMenu = () => {
        if (!isResourceFunction) {
            return (
                <FunctionMenuWidget location={functionElement.position} functionType={FunctionType.MUTATION} />
            );
        } else {
            if (isSubscription) {
                return (
                    <FunctionMenuWidget location={functionElement.position} functionType={FunctionType.SUBSCRIPTION} />
                );
            } else {
                return (
                    <FunctionMenuWidget location={functionElement.position} functionType={FunctionType.QUERY} />
                );
            }
        }
    };


    return (
        <CtrlClickHandler
            filePath={functionElement?.position?.filePath}
            position={functionElement?.position && getFormattedPosition(functionElement.position)}
        >
            <FunctionContainer
                onMouseOver={() => handleOnHover('SELECT')}
                onMouseLeave={() => handleOnHover('UNSELECT')}
                data-testid={`function-card-${functionElement.identifier}`}
            >
                {isResourceFunction ? (
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
                <div style={{width: '10px'}}>
                    {/* {isHovered && addFunctionMenu()} */}
                </div>

            </FunctionContainer>
        </CtrlClickHandler>
    );
}
