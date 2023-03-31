/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useState } from "react";

import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { IdentifierToken, STNode } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperPortWidget, PortState, RecordFieldPortModel } from '../../Port';
import { TypeDescriptor } from "../commons/DataMapperNode";
import { OutputSearchHighlight } from "../commons/SearchHighlight";
import { TreeBody, TreeContainer, TreeHeader } from '../commons/Tree/Tree';

import { useStyles } from "./style";
import {UnionTypeSelector} from "./UnionTypeSelector";

export interface UnionTypeTreeWidgetProps {
    id: string;
    engine: DiagramEngine;
    context: IDataMapperContext;
    typeName: string;
    typeIdentifier: TypeDescriptor | IdentifierToken;
    typeDef: Type;
    valueLabel?: string;
    getValueExpr: () => STNode;
    getPort: (portId: string) => RecordFieldPortModel;
}

export function UnionTypeTreeWidget(props: UnionTypeTreeWidgetProps) {
    const { id, engine, context, typeName, typeIdentifier, typeDef, valueLabel, getValueExpr, getPort } = props;
    const classes = useStyles();
    const [portState, setPortState] = useState<PortState>(PortState.Unselected);
    const [isHovered, setIsHovered] = useState(false);

    const portIn = getPort(`${id}.IN`);

    const handlePortState = (state: PortState) => {
        setPortState(state)
    };

    const onMouseEnter = () => {
        setIsHovered(true);
    };

    const onMouseLeave = () => {
        setIsHovered(false);
    };

    const label = (
        <span style={{ marginRight: "auto" }}>
			{valueLabel && (
                <span className={classes.valueLabel}>
					<OutputSearchHighlight>{valueLabel}</OutputSearchHighlight>
                    {typeName && ":"}
				</span>
            )}
            {typeName && (
                <span className={classes.typeLabel}>
					{typeName}
				</span>
            )}

		</span>
    );

    return (
        <TreeContainer data-testid={"union-type-selector-node"}>
            <TreeHeader
                isSelected={portState !== PortState.Unselected}
                id={"recordfield-" + id}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
					<span className={classes.treeLabelInPort}>
						{portIn &&
                            <DataMapperPortWidget engine={engine} port={portIn} handlePortState={handlePortState} />
                        }
					</span>
                <span className={classes.label}>
                    {label}
                </span>
            </TreeHeader>
            <TreeBody>
                <UnionTypeSelector
                    context={context}
                    typeIdentifier={typeIdentifier}
                    typeDef={typeDef}
                    getValueExpr={getValueExpr}
                />
            </TreeBody>
        </TreeContainer>
    );
}
