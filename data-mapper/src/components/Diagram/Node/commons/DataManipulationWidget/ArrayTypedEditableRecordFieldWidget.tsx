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
import { ListConstructor, MappingConstructor, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import { createSourceForUserInput, getBalRecFieldName } from "../../../utils/dm-utils";
import { getModification } from "../../../utils/modifications";

import { EditableRecordFieldWidget } from "./EditableRecordFieldWidget";
import { useStyles } from "./styles";

export interface ArrayTypedEditableRecordFieldWidgetProps {
    parentId: string;
    field: EditableRecordField;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    mappingConstruct: MappingConstructor;
    context: IDataMapperContext;
    fieldIndex?: number;
    treeDepth?: number;
}

export function ArrayTypedEditableRecordFieldWidget(props: ArrayTypedEditableRecordFieldWidgetProps) {
    const { parentId, field, getPort, engine, mappingConstruct, context, fieldIndex, treeDepth = 0 } = props;
    const classes = useStyles();

    const fieldName = getBalRecFieldName(field.type.name);
    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}.${fieldName}`
        : `${parentId}.${fieldName}`;
    const portIn = getPort(`${fieldId}.IN`);
    const portOut = getPort(`${fieldId}.OUT`);
    const hasValue = field.hasValue() && !!field.value.valueExpr.source;
    const typeName = field.type.memberType.typeName;
    const elements = field.elements;

    const [expanded, setExpanded] = useState<boolean>(true);
    const listConstructor = hasValue ? (STKindChecker.isListConstructor(field.value.valueExpr)
                                ? field.value.valueExpr : null) : null;

    const indentation = !!elements ? 0 : ((treeDepth + 1) * 16) + 8;

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
        createSourceForUserInput(field, mappingConstruct, '[]', context.applyModifications);
    };

    const handleAddArrayElement = () => {
        const targetPosition = listConstructor.openBracket.position;
        const fieldsAvailable = !!listConstructor.expressions.length;
        const modification = [getModification(`\n${fieldsAvailable ? "{}," : "{}"}`, {
            ...targetPosition,
            startLine: targetPosition.endLine,
            startColumn: targetPosition.endColumn
        })];
        context.applyModifications(modification);
    };

    return (
        <>
            <div className={classes.treeLabel}>
                <span className={classes.treeLabelInPort}>
                    {portIn && !listConstructor &&
                        <DataMapperPortWidget engine={engine} port={portIn}/>
                    }
                </span>
                {elements &&
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
            {elements && (
                <>
                    {
                        elements.map((element, index) => {
                            return (
                                <>
                                    <div className={classes.treeLabel}>
                                        <span>{'{'}</span>
                                    </div>
                                    {
                                        element.members.map((typeWithVal) => {
                                            // TODO: Add support to render array elements other than the mapping constructors
                                            return STKindChecker.isMappingConstructor(element.elementNode) && (
                                                <>
                                                    <EditableRecordFieldWidget
                                                        key={fieldId}
                                                        engine={engine}
                                                        field={typeWithVal}
                                                        getPort={getPort}
                                                        parentId={fieldId}
                                                        mappingConstruct={element.elementNode}
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
