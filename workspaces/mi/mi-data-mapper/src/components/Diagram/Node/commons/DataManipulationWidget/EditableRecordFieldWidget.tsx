/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useMemo, useState } from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { Button, Codicon, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { TypeKind } from "@wso2-enterprise/mi-core";
import * as ts from "typescript";

import classnames from "classnames";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { DMTypeWithValue } from "../../../Mappings/DMTypeWithValue";
import { DataMapperPortWidget, PortState, RecordFieldPortModel } from "../../../Port";
import { OutputSearchHighlight } from "../Search";

import { ValueConfigMenu, ValueConfigOption } from "./ValueConfigButton";
import { ValueConfigMenuItem } from "./ValueConfigButton/ValueConfigMenuItem";
import { useIONodesStyles } from "../../../../styles";
import { useDMCollapsedFieldsStore } from '../../../../../store/store';

export interface EditableRecordFieldWidgetProps {
    parentId: string;
    field: DMTypeWithValue;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    parentMappingConstruct: ts.Node;
    context: IDataMapperContext;
    fieldIndex?: number;
    treeDepth?: number;
    deleteField?: (node: ts.Node) => Promise<void>;
    hasHoveredParent?: boolean;
}

export function EditableRecordFieldWidget(props: EditableRecordFieldWidgetProps) {
    const {
        parentId,
        field,
        getPort,
        engine,
        parentMappingConstruct,
        context,
        fieldIndex,
        treeDepth = 0,
        deleteField,
        hasHoveredParent
    } = props;
    // const {
    //     enableStatementEditor,
    //     handleCollapse
    // } = context;
    const classes = useIONodesStyles();
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isAddingTypeCast, setIsAddingTypeCast] = useState(false);
    const [portState, setPortState] = useState<PortState>(PortState.Unselected);
    const collapsedFieldsStore = useDMCollapsedFieldsStore();

    let fieldName = field.type.fieldName;
    let indentation = treeDepth * 16;
    let expanded = true;

    const typeName = field.type.kind;
    const isArray = typeName === TypeKind.Array;
    const isRecord = typeName === TypeKind.Interface;

    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}${fieldName && `.${fieldName}`}`
        : `${parentId}.${fieldName}`;
    const portIn = getPort(fieldId + ".IN");

    const propertyAssignment = field.hasValue() && ts.isPropertyAssignment(field.value) && field.value;
    const mappingConstruct = ts.isObjectLiteralExpression(parentMappingConstruct) && parentMappingConstruct;
    const hasValue = propertyAssignment
        && propertyAssignment.initializer
        && !!propertyAssignment.initializer.getText();

    const fields = isRecord && field.childrenTypes;
    const isWithinArray = fieldIndex !== undefined;

    const connectedViaLink = useMemo(() => {
        if (hasValue) {
            // TODO: Check if the field is connected via a link by validating the values
            return ts.isBinaryExpression(propertyAssignment.initializer);
        }
        return false;
    }, [field]);

    const value: string = !isArray && !isRecord && hasValue && propertyAssignment.initializer.getText();

    const handleAddValue = async () => {
        setIsLoading(true);
        try {
            // const defaultValue = getDefaultValue(field.type.typeName);
            // await createSourceForUserInput(field, mappingConstruct, defaultValue, context.applyModifications);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditValue = () => {
        if (field.value && ts.isPropertyAssignment(field.value)) {
            const innerExpr = field.value.initializer;
            // enableStatementEditor({
            //     value: innerExpr.source,
            //     valuePosition: innerExpr.position as NodePosition,
            //     label: field.value.fieldName.value as string
            // });
        }
    };

    const handleDeleteValue = async () => {
        setIsLoading(true);
        try {
            await deleteField(field.value);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExpand = () => {
		const collapsedFields = collapsedFieldsStore.collapsedFields;
        if (!expanded) {
            collapsedFieldsStore.setCollapsedFields(collapsedFields.filter((element) => element !== fieldId));
        } else {
            collapsedFieldsStore.setCollapsedFields([...collapsedFields, fieldId]);
        }
    };

    const handlePortState = (state: PortState) => {
        setPortState(state)
    };

    const onMouseEnter = () => {
        setIsHovered(true);
    };

    const onMouseLeave = () => {
        setIsHovered(false);
    };

    const hasValueWithoutLink = value && !connectedViaLink;
    // const hasDefaultValue = value && getDefaultValue(field.type.typeName) === value.trim();
    const hasDefaultValue = false;
    let isDisabled = portIn?.descendantHasValue;

    if (!isDisabled) {
        if (portIn?.parentModel && (Object.entries(portIn?.parentModel.links).length > 0 || portIn?.parentModel.ancestorHasValue)) {
            portIn.ancestorHasValue = true;
            isDisabled = true;
        }
        if (hasValue
            && !connectedViaLink
            && !hasDefaultValue
            && (isRecord || hasValueWithoutLink)) {
            portIn?.setDescendantHasValue();
            isDisabled = true;
        }
    }

    if (portIn && portIn.collapsed) {
        expanded = false;
    }

    if (!portIn) {
        indentation += 24;
    }

    if (isWithinArray) {
        const elementName = fieldName || field.parentType.type?.fieldName;
        fieldName = elementName ? `${elementName}Item` : 'item';
    }

    const label = !isArray && (
        <span style={{ marginRight: "auto" }} data-testid={`record-widget-field-label-${portIn?.getName()}`}>
            <span
                className={classnames(classes.valueLabel,
                    isDisabled && !hasHoveredParent ? classes.valueLabelDisabled : ""
                )}
                style={{ marginLeft: fields ? 0 : indentation + 24 }}
            >
                <OutputSearchHighlight>{fieldName}</OutputSearchHighlight>
                {!field.type?.optional && <span className={classes.requiredMark}>*</span>}
                {typeName && ":"}
            </span>
            {typeName && (
                <span
                    className={classnames(classes.outputTypeLabel,
                        isDisabled && !hasHoveredParent ? classes.typeLabelDisabled : ""
                    )}
                >
                    {typeName || ''}
                </span>
            )}
        </span>
    );

    const addOrEditValueMenuItem: ValueConfigMenuItem = hasValue
        ? { title: ValueConfigOption.EditValue, onClick: handleEditValue }
        : { title: ValueConfigOption.InitializeWithValue, onClick: handleAddValue };

    const deleteValueMenuItem: ValueConfigMenuItem = {
        title: isWithinArray ? ValueConfigOption.DeleteElement : ValueConfigOption.DeleteValue,
        onClick: handleDeleteValue
    };

    const valConfigMenuItems = [
        !isWithinArray && addOrEditValueMenuItem,
        (hasValue || isWithinArray) && deleteValueMenuItem,
    ];

    return (
        <>
            {!isArray && (
                <div
                    id={"recordfield-" + fieldId}
                    className={classnames(classes.treeLabel,
                        isDisabled && !hasHoveredParent && !isHovered ? classes.treeLabelDisabled : "",
                        isDisabled && isHovered ? classes.treeLabelDisableHover : "",
                        portState !== PortState.Unselected ? classes.treeLabelPortSelected : "",
                        hasHoveredParent ? classes.treeLabelParentHovered : ""
                    )}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <span className={classes.inPort}>
                        {portIn && (
                            <DataMapperPortWidget
                                engine={engine}
                                port={portIn}
                                disable={isDisabled && expanded}
                                handlePortState={handlePortState}
                            />
                        )}
                    </span>
                    <span className={classes.label}>
                        {fields && (
                            <Button
                                appearance="icon"
                                tooltip="Expand/Collapse"
                                sx={{ marginLeft: indentation }}
                                onClick={handleExpand}
                                data-testid={`${portIn?.getName()}-expand-icon-element`}
                            >
                                {expanded ? <Codicon name="chevron-right" /> : <Codicon name="chevron-down" />}
                            </Button>
                        )}
                        {label}
                    </span>
                    {(!isDisabled || hasValue) && (
                        <>
                            {(isLoading || isAddingTypeCast) ? (
                                <ProgressRing sx={{ height: '16px', width: '16px' }} />
                            ) : (
                                <ValueConfigMenu menuItems={valConfigMenuItems} portName={portIn?.getName()} />
                            )}
                        </>
                    )}
                </div>
            )}
            {fields && expanded &&
                fields.map((subField, index) => {
                    return (
                        <EditableRecordFieldWidget
                            key={index}
                            engine={engine}
                            field={subField}
                            getPort={getPort}
                            parentId={fieldId}
                            parentMappingConstruct={mappingConstruct}
                            context={context}
                            treeDepth={treeDepth + 1}
                            deleteField={deleteField}
                            hasHoveredParent={isHovered || hasHoveredParent}
                        />
                    );
                })
            }
        </>
    );
}
