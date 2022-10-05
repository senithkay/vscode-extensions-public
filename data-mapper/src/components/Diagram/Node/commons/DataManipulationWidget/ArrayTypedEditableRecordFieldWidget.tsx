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
import React, { useMemo } from "react";

import { Button, IconButton } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { MappingConstructor, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import {
    createSourceForUserInput,
    getDefaultValue,
    getFieldName,
    getTypeName,
    isConnectedViaLink
} from "../../../utils/dm-utils";
import { getModification } from "../../../utils/modifications";
import { TreeBody } from "../Tree/Tree";

import { EditableRecordFieldWidget } from "./EditableRecordFieldWidget";
import { PrimitiveTypedEditableArrayElementWidget } from "./PrimitiveTypedEditableArrayElementWidget";
import { useStyles } from "./styles";
import { ValueConfigMenu, ValueConfigOption } from "./ValueConfigButton";

export interface ArrayTypedEditableRecordFieldWidgetProps {
    parentId: string;
    field: EditableRecordField;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    mappingConstruct: MappingConstructor;
    context: IDataMapperContext;
    fieldIndex?: number;
    treeDepth?: number;
    deleteField?: (node: STNode) => void;
}

export function ArrayTypedEditableRecordFieldWidget(props: ArrayTypedEditableRecordFieldWidgetProps) {
    const { parentId, field, getPort, engine, mappingConstruct, context, fieldIndex, treeDepth = 0, deleteField } = props;
    const classes = useStyles();

    const fieldName = getFieldName(field);
    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}${fieldName && `.${fieldName}`}`
        : `${parentId}.${fieldName}`;
    const portIn = getPort(`${fieldId}.IN`);
    const valExpr = field.hasValue()
        && (STKindChecker.isSpecificField(field.value) ? field.value.valueExpr : field.value);
    const hasValue = valExpr && !!valExpr.source;
    const isValQueryExpr = STKindChecker.isQueryExpression(valExpr);
    const typeName = getTypeName(field.type);
    const elements = field.elements;

    const connectedViaLink = useMemo(() => {
        if (hasValue) {
            return isConnectedViaLink(valExpr);
        }
        return false;
    }, [field]);

    let expanded = true;
    if (portIn && portIn.collapsed) {
        expanded = false;
    }

    const listConstructor = hasValue ? (STKindChecker.isListConstructor(valExpr) ? valExpr : null) : null;

    let indentation = treeDepth * 16;
    if (!portIn) {
        indentation += 24;
    }

    let isDisabled = portIn.descendantHasValue;
    if (!isDisabled) {
        if (listConstructor && expanded) {
            portIn.setDescendantHasValue();
            isDisabled = true;
        }
        if (portIn.parentModel && (Object.entries(portIn.parentModel.links).length > 0 || portIn.parentModel.ancestorHasValue)){
            portIn.ancestorHasValue = true;
            isDisabled = true;
        }
    }

    const label = (
        <span style={{ marginRight: "auto" }}>
            <span
                className={classes.valueLabel}
                style={{ marginLeft: (hasValue && !connectedViaLink && !isValQueryExpr) ? 0 : indentation + 24 }}
            >
                {fieldName}
                {!field.type?.optional && <span className={classes.requiredMark}>*</span>}
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
                        <TreeBody>
                            <EditableRecordFieldWidget
                                key={fieldId}
                                engine={engine}
                                field={element.member}
                                getPort={getPort}
                                parentId={fieldId}
                                mappingConstruct={element.elementNode as MappingConstructor}
                                context={context}
                                fieldIndex={index}
                                treeDepth={treeDepth + 1}
                                deleteField={deleteField}
                            />
                        </TreeBody>
                        <br />
                    </>
                );
            } else if (element.elementNode && STKindChecker.isListConstructor(element.elementNode)) {
                return (
                    <ArrayTypedEditableRecordFieldWidget
                        key={fieldId}
                        engine={engine}
                        field={element.member}
                        getPort={getPort}
                        parentId={fieldId}
                        mappingConstruct={mappingConstruct}
                        context={context}
                        fieldIndex={index}
                        treeDepth={treeDepth + 1}
                        deleteField={deleteField}
                    />
                )
            } else {
                return (
                    <TreeBody>
                        <PrimitiveTypedEditableArrayElementWidget
                            parentId={fieldId}
                            field={element.member}
                            engine={engine}
                            getPort={getPort}
                            context={context}
                            fieldIndex={index}
                            deleteField={deleteField}
                        />
                    </TreeBody>
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

    const handleArrayDeletion = async () => {
        deleteField(field.value);
    };

    const handleAddArrayElement = () => {
        const fieldsAvailable = !!listConstructor.expressions.length;
        const defaultValue = getDefaultValue(field.type.memberType);
        let targetPosition: NodePosition;
        let newElementSource: string;
        if (fieldsAvailable) {
            targetPosition = listConstructor.expressions[listConstructor.expressions.length - 1].position;
            newElementSource = `,\n${defaultValue}`
        } else {
            targetPosition = listConstructor.openBracket.position;
            newElementSource = `\n${defaultValue}`
        }
        const modification = [getModification(newElementSource, {
            ...targetPosition,
            startLine: targetPosition.endLine,
            startColumn: targetPosition.endColumn
        })];
        context.applyModifications(modification);
    };

    return (
        <div className={classNames(classes.treeLabel, classes.treeLabelArray)}>
            <div className={classes.ArrayFieldRow}>
                <span className={classes.treeLabelInPort}>
                    {portIn &&
                        <DataMapperPortWidget engine={engine} port={portIn} disable={isDisabled && expanded} />
                    }
                </span>
                <span className={classes.label}>
                    {(hasValue && !connectedViaLink) && (
                        <IconButton
                            className={classes.expandIcon}
                            style={{ marginLeft: indentation }}
                            onClick={handleExpand}
                        >
                            {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    )}
                    {label}
                </span>
                {((hasValue && !connectedViaLink) || !isDisabled) && (
                    <ValueConfigMenu
                        menuItems={[
                            {
                                title: !hasValue ? ValueConfigOption.InitializeArray : ValueConfigOption.DeleteArray,
                                onClick: !hasValue ? handleArrayInitialization : handleArrayDeletion
                            }
                        ]}
                    />
                )}
            </div>
            {expanded && hasValue && listConstructor && (
                <div>
                    <div className={classes.innerTreeLabel}>
                        <span>[</span>
                        {arrayElements}
                        <Button
                            aria-label="add"
                            className={classes.addIcon}
                            onClick={handleAddArrayElement}
                            startIcon={<AddIcon />}
                        >
                            Add Element
                        </Button>
                        <span>]</span>
                    </div>
                </div>
            )}
        </div>
    );
}
