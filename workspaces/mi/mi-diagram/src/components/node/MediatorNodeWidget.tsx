/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { NodeProps, PortWidget } from '@projectstorm/react-diagrams-core';
import { Colors } from '../../resources/assets/Constants';
import styled from '@emotion/styled';

export interface MediatorNodeProps extends NodeProps {
    node: any;
    diagramEngine: any;
}

namespace S {
    export const Port = styled.div`
        margin-top: -9px;
        margin-left: 8px;
		width: 16px;
		height: 16px;
		z-index: 10;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 8px;
		cursor: pointer;

		&:hover {
			background: rgba(0, 0, 0, 1);
		}
	`;
}

export function MediatorNodeWidget(props: MediatorNodeProps) {
    return (
        <EntityNode>
            <p>{props.node.getOptions().id}</p>

            <PortWidget
                style={{
                    left: 0,
                    top: 18,
                    position: 'absolute'
                }}
                port={props.node.getPort(`left-${props.node.getOptions().id}`)}
                engine={props.diagramEngine}
            >
                <S.Port />
            </PortWidget>
            <PortWidget
                style={{
                    right: 8,
                    top: 18,
                    position: 'absolute'
                }}
                port={props.node.getPort(`right-${props.node.getOptions().id}`)}
                engine={props.diagramEngine}
            >
                <S.Port />
            </PortWidget>
        </EntityNode>
    );
}
export const EntityNode: React.FC<any> = styled.div`
    background-color: ${Colors.SECONDARY_SELECTED};
    border: ${`1px solid ${Colors.PRIMARY_SELECTED}`};
    border-radius: 6px !important;
    color: ${Colors.DEFAULT_TEXT};
    display: flex;
    flex-direction: column;
    padding: 10px;
`;