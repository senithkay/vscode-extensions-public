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
import React from "react";

import { Button, IconButton } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { MappingConstructor, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import { createSourceForUserInput, getBalRecFieldName, getDefaultValue, getTypeName } from "../../../utils/dm-utils";
import { getModification } from "../../../utils/modifications";

import { EditableRecordFieldWidget } from "./EditableRecordFieldWidget";
import { PrimitiveTypedEditableArrayElementWidget } from "./PrimitiveTypedEditableArrayElementWidget";
import { useStyles } from "./styles";
import { ValueConfigButton } from "./ValueConfigButton";

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
        ? `${parentId}.${fieldIndex}${fieldName && `.${fieldName}`}`
        : `${parentId}.${fieldName}`;
    const portIn = getPort(`${fieldId}.IN`);
    const valExpr = field.hasValue()
        && (STKindChecker.isSpecificField(field.value) ? field.value.valueExpr : field.value);
    const hasValue = valExpr && !!valExpr.source;
    const typeName = getTypeName(field.type);
    const elements = field.elements;

    let expanded = true;
    if (portIn && portIn.collapsed) {
        expanded = false;
    }

    const listConstructor = hasValue ? (STKindChecker.isListConstructor(valExpr) ? valExpr : null) : null;

    let indentation = treeDepth * 16;
    if (!portIn || (listConstructor && expanded)) {
        indentation += 24;
    }

    const label = (
        <span style={{ marginRight: "auto" }}>
            <span className={classes.valueLabel} style={{ marginLeft: !!elements ? 0 : indentation + 24 }}>
                {fieldName}
                {fieldName && typeName && ":"}
            </span>
            {typeName && (
                <span className={classes.typeLabel}>
                    {typeName}
                </span>
            )}
        </span>
    );

    const arrayElements = elements && (
        elements.map((element, index) => {
            if (element.elementNode && STKindChecker.isMappingConstructor(element.elementNode)) {
                return (
                    <>
                        <div className={classes.treeLabel}>
                            <span>{'{'}</span>
                        </div>
                        {
                            element.members.map((typeWithVal) => {
                                return (
                                    <EditableRecordFieldWidget
                                        key={fieldId}
                                        engine={engine}
                                        field={typeWithVal}
                                        getPort={getPort}
                                        parentId={fieldId}
                                        mappingConstruct={element.elementNode as MappingConstructor}
                                        context={context}
                                        fieldIndex={index}
                                        treeDepth={treeDepth + 1}
                                    />
                                );
                            })
                        }
                        <div className={classes.treeLabel}>
                            <span>{'}'}</span>
                        </div>
                    </>
                );
            } else if (element.elementNode && STKindChecker.isListConstructor(element.elementNode)) {
                return element.members.map((typeWithVal) => {
                    return (
                        <ArrayTypedEditableRecordFieldWidget
                            key={fieldId}
                            engine={engine}
                            field={typeWithVal}
                            getPort={getPort}
                            parentId={fieldId}
                            mappingConstruct={mappingConstruct}
                            context={context}
                            fieldIndex={index}
                            treeDepth={treeDepth + 1}
                        />
                    );
                })
            } else {
                return (
                    <PrimitiveTypedEditableArrayElementWidget
                        parentId={fieldId}
                        field={element.members[0]} // Element only contains a single member
                        engine={engine}
                        getPort={getPort}
                        context={context}
                        fieldIndex={index}
                    />
                );
            }
        })
    );

    const handleExpand = () => {
        context.handleCollapse(fieldId, !expanded);
    };

    const handleArrayInitialization = async () => {
        await createSourceForUserInput(field, mappingConstruct, '[]', context.applyModifications);
    };

    const handleAddArrayElement = () => {
        const targetPosition = listConstructor.openBracket.position;
        const fieldsAvailable = !!listConstructor.expressions.length;
        const defaultValue = getDefaultValue(field.type.memberType);
        const modification = [getModification(`\n${fieldsAvailable ? `${defaultValue},` : defaultValue}`, {
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
                    {portIn && (!listConstructor || !expanded) &&
                        <DataMapperPortWidget engine={engine} port={portIn} />
                    }
                </span>
                <span className={classes.label}>
                    <IconButton
                        className={classes.expandIcon}
                        style={{ marginLeft: indentation }}
                        onClick={handleExpand}
                    >
                        {elements && (expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />)}
                    </IconButton>
                    {label}
                </span>
                {!hasValue && (
                    <ValueConfigButton
                        onClick={handleArrayInitialization}
                    />
                )}
            </div>
            {expanded && (
                <>
                    {hasValue && listConstructor && (
                        <div className={classes.treeLabel}>
                            <span>[</span>
                        </div>
                    )}
                    {arrayElements}
                    {hasValue && listConstructor && (
                        <>
                            <div className={classes.treeLabel}>
                                <Button
                                    aria-label="add"
                                    className={classes.addIcon}
                                    onClick={handleAddArrayElement}
                                    startIcon={<AddIcon />}
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
            )}
        </>
    );
}
