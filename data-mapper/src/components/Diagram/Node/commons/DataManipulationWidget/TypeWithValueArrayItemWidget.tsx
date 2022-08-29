/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useState } from "react";

import { Button, IconButton } from "@material-ui/core";
import { default as AddIcon } from  "@material-ui/icons/Add";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { ListConstructor, MappingConstructor, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { TypeWithValue } from "../../../Mappings/TypeWithValue";
import { DataMapperPortWidget, RecordFieldPortModel, SpecificFieldPortModel } from "../../../Port";
import { getBalRecFieldName, getFieldIndex, getNewSource } from "../../../utils/dm-utils";

import { useStyles } from "./styles";
import { TypeWithValueItemWidget } from "./TypeWithValueItemWidget";

export interface TypeWithValueArrayItemWidgetProps {
    parentId: string;
    field: TypeWithValue;
    engine: DiagramEngine;
    getPort: (portId: string) => SpecificFieldPortModel | RecordFieldPortModel;
    mappingConstruct: MappingConstructor;
    context: IDataMapperContext;
    fieldIndex?: number;
    treeDepth?: number;
}

export function TypeWithValueArrayItemWidget(props: TypeWithValueArrayItemWidgetProps) {
    const { parentId, field, getPort, engine, mappingConstruct, context, fieldIndex = 0, treeDepth = 0 } = props;
    const classes = useStyles();

    const fieldName = getBalRecFieldName(field.type.name);
    const fieldId = `${parentId}.${fieldName}`;
    const portIn = getPort(`${fieldId}.${fieldIndex}.IN`);
    const portOut = getPort(`${fieldId}.${fieldIndex}.OUT`);
    const hasValue = field.hasValue();
    const typeName = field.type.memberType.typeName;
    const members = field.memberType;

    const [expanded, setExpanded] = useState<boolean>(true);
    const [listConstructor, setListConstructor] = useState<ListConstructor>(null);

    const indentation = !!members ? 0 : ((treeDepth + 1) * 16) + 8;

    useEffect(() => {
        if (hasValue) {
            if (STKindChecker.isListConstructor(field.value.valueExpr)) {
                setListConstructor(field.value.valueExpr);
            }
        }
    }, [mappingConstruct]);

    const label = (
        <span style={{marginRight: "auto"}}>
            <span className={classes.valueLabel} style={{marginLeft: indentation}}>
                {`${fieldName}[]`}
                {typeName && ":"}
            </span>
            {typeName && (
                <span className={classes.typeLabel}>
                    {typeName}
                </span>
            )}

        </span>
    );

    const handleExpand = () => {
        // TODO Enable expand collapse functionality
        // setExpanded(!expanded)
    };

    const handleArrayInitialization = () => {
        const [newSource, targetMappingConstruct] = getNewSource(field, mappingConstruct, '[]');
        const fieldsAvailable = !!targetMappingConstruct.fields.length;
        updateSource(newSource, targetMappingConstruct.openBrace.position, fieldsAvailable);
    };

    const handleAddArrayElement = () => {
        const targetPosition = listConstructor.openBracket.position;
        const fieldsAvailable = !!listConstructor.expressions.length;
        updateSource('{}', targetPosition, fieldsAvailable);
    };

    const updateSource = (newSource: string, targetPosition: NodePosition, fieldsAvailable: boolean) => {
        const modifications = [
            {
                type: "INSERT",
                config: {
                    "STATEMENT": `\n${fieldsAvailable ? `${newSource},` : newSource}`,
                },
                endColumn: targetPosition.endColumn,
                endLine: targetPosition.endLine,
                startColumn: targetPosition.endColumn,
                startLine: targetPosition.endLine
            }
        ];
        context.applyModifications(modifications);
    };

    return (
        <>
            <div className={classes.treeLabel}>
                <span className={classes.treeLabelInPort}>
                    {portIn &&
                        <DataMapperPortWidget engine={engine} port={portIn}/>
                    }
                </span>
                {members &&
                    (expanded ? (
                            <ExpandMoreIcon style={{color: "black", marginLeft: treeDepth * 16}} onClick={handleExpand}/>
                        ) :
                        (
                            <ChevronRightIcon style={{color: "black", marginLeft: treeDepth * 16}} onClick={handleExpand}/>
                        ))
                }

                <span>{label}</span>
                {!hasValue && (
                    <IconButton
                        aria-label="add"
                        className={classes.addIcon}
                        onClick={handleArrayInitialization}
                    >
                        <AddIcon />
                    </IconButton>
                )}
                <span className={classes.treeLabelOutPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut}/>
                    }
                </span>
            </div>
            {hasValue && listConstructor && (
                <div className={classes.treeLabel}>
                    <span>[</span>
                </div>
            )}
            {members && (
                <>
                    {
                        members.map((member, index) => {
                            return (
                                <>
                                    <div className={classes.treeLabel}>
                                        <span>{'{'}</span>
                                    </div>
                                    {
                                        member.members.map((typeWithVal) => {
                                            return (
                                                <>
                                                    <TypeWithValueItemWidget
                                                        key={fieldId}
                                                        engine={engine}
                                                        field={typeWithVal}
                                                        getPort={getPort}
                                                        parentId={fieldId}
                                                        mappingConstruct={member.node as MappingConstructor}
                                                        context={context}
                                                        fieldIndex={index}
                                                        treeDepth={treeDepth + 1}
                                                    />
                                                </>
                                            );
                                        })
                                    }
                                    <div className={classes.treeLabel}>
                                        <span>{'}'}</span>
                                    </div>
                                </>
                            );
                        })
                    }
                </>
            )}
            {hasValue && listConstructor && (
                <>
                    <div className={classes.treeLabel}>
                        <Button
                            aria-label="add"
                            className={classes.addIcon}
                            onClick={handleAddArrayElement}
                            startIcon={<AddIcon/>}
                        >
                            Add Element
                        </Button>
                    </div>
                    <div className={classes.treeLabel}>
                        <span>]</span>
                    </div>
                </>
            )}
        </>
    );
}
