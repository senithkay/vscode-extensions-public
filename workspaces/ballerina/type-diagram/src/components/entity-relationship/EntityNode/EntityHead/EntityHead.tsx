/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useRef } from 'react';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { EntityPortWidget } from '../../EntityPort/EntityPortWidget';
import { EntityModel } from '../EntityModel';
import { EntityHead, EntityName } from '../styles';
import { DiagramContext } from '../../../common/DiagramContext/DiagramContext';
import { CtrlClickGo2Source } from '../../../common/CtrlClickHandler/CtrlClickGo2Source';

interface ServiceHeadProps {
    engine: DiagramEngine;
    node: EntityModel;
    isSelected: boolean;
}

const ANON_RECORD_DISPLAY: string = 'record';

export function EntityHeadWidget(props: ServiceHeadProps) {
    const { engine, node, isSelected } = props;
    const { setFocusedNodeId } = useContext(DiagramContext);
    const headPorts = useRef<PortModel[]>([]);
    // const [isHovered, setIsHovered] = useState<boolean>(false);

    const displayName: string = node.getID().slice(node.getID().lastIndexOf(':') + 1);

    useEffect(() => {
        headPorts.current.push(node.getPortFromID(`left-${node.getID()}`));
        headPorts.current.push(node.getPortFromID(`right-${node.getID()}`));
    }, [node])

    const handleOnHover = (task: string) => {
        // setIsHovered(task === 'SELECT' ? true : false);
        node.handleHover(headPorts.current, task);
    }

    // const isClickable = currentView === Views.TYPE;
    const isClickable = false; // TODO: allow clickable for composition diagram


    const handleOnClickOnEntityName = () => {
        if (isClickable) {
            // getTypeComposition(node.getID());
            setFocusedNodeId(undefined);
        }
    }

    return (
        <CtrlClickGo2Source location={node.entityObject.sourceLocation}>
            <EntityHead
                isAnonymous={node.entityObject.isAnonymous}
                isSelected={isSelected}
                onMouseOver={() => handleOnHover('SELECT')}
                onMouseLeave={() => handleOnHover('UNSELECT')}
                data-testid={`entity-head-${displayName}`}
            >
                <EntityPortWidget
                    port={node.getPort(`left-${node.getID()}`)}
                    engine={engine}
                />
                <EntityName
                    isClickable={isClickable}
                    isAnonymous={node.entityObject.isAnonymous}
                    onClick={handleOnClickOnEntityName}
                >
                    {node.entityObject.isAnonymous ? ANON_RECORD_DISPLAY : displayName}
                </EntityName>
                {/* {isHovered && node.entityObject.sourceLocation &&
                        <NodeMenuWidget
                            background={'white'}
                            location={node.entityObject.sourceLocation}
                        />
                    } */}
                <EntityPortWidget
                    port={node.getPort(`right-${node.getID()}`)}
                    engine={engine}
                />
            </EntityHead>
        </CtrlClickGo2Source>
    )
}
