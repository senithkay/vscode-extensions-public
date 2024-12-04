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
import { Button, Codicon, Icon, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { IOType, Mapping, TypeKind } from "@wso2-enterprise/ballerina-core";
import classnames from "classnames";

import { useIONodesStyles } from "../../../styles";
import { useDMCollapsedFieldsStore, useDMExpressionBarStore } from '../../../../store/store';
import { useDMSearchStore } from "../../../../store/store";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperPortWidget, PortState, InputOutputPortModel } from "../../Port";
import { OutputSearchHighlight } from "../commons/Search";
import { ObjectOutputFieldWidget } from "../ObjectOutput/ObjectOutputFieldWidget";
import { ValueConfigMenu, ValueConfigOption } from "../commons/ValueConfigButton";
import { ValueConfigMenuItem } from "../commons/ValueConfigButton/ValueConfigMenuItem";
import { findMappingByOutput, getDefaultValue } from "../../utils/common-utils";
import { DiagnosticTooltip } from "../../Diagnostic/DiagnosticTooltip";
import { TreeBody } from "../commons/Tree/Tree";
import { getTypeName } from "../../utils/type-utils";
import FieldActionWrapper from "../commons/FieldActionWrapper";
import { addValue } from "../../utils/modification-utils";
import { PrimitiveOutputElementWidget } from "../PrimitiveOutput/PrimitiveOutputElementWidget";

export interface ArrayOutputFieldWidgetProps {
    parentId: string;
    field: IOType;
    engine: DiagramEngine;
    getPort: (portId: string) => InputOutputPortModel;
    context: IDataMapperContext;
    fieldIndex?: number;
    treeDepth?: number;
    deleteField?: (node: Node) => Promise<void>;
    asOutput?: boolean;
    hasHoveredParent?: boolean;
}

export function ArrayOutputFieldWidget(props: ArrayOutputFieldWidgetProps) {
    const {
        parentId,
        field,
        getPort,
        engine,
        context,
        fieldIndex,
        treeDepth = 0,
        deleteField,
        asOutput,
        hasHoveredParent
    } = props;
    const classes = useIONodesStyles();

    const [isLoading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [portState, setPortState] = useState<PortState>(PortState.Unselected);
    const [isAddingElement, setIsAddingElement] = useState(false);
    const collapsedFieldsStore = useDMCollapsedFieldsStore();
    const setExprBarFocusedPort = useDMExpressionBarStore(state => state.setFocusedPort);

    const arrayField = field.member;
    const typeName = getTypeName(field);
    // const fieldName = field.variableName || '';
    // const fieldId = fieldIndex !== undefined
    //     ? `${parentId}.${fieldIndex}${fieldName && `.${fieldName}`}`
    //     : `${parentId}${fieldName && `.${fieldName}`}`;
    // const fieldId = fieldIndex !== undefined
    //     ? fieldName ? `${fieldName}.${fieldIndex}` : ''
    //     : fieldName || '';

    let fieldFQN = parentId;
    if (fieldIndex !== undefined) {
        fieldFQN = `${parentId}.${fieldIndex}`
    }
    const fieldName = field?.variableName || '';
    // const portName = portPrefix ? `${portPrefix}.${fieldFQN}` : fieldFQN;

    const portIn = getPort(`${fieldFQN}.IN`);

    // const mapping = findMappingByOutput(context.model.mappings, fieldName);
    const mapping = portIn && portIn.value;
    const { inputs, expression, elements, diagnostics } = mapping || {};
    const searchValue = useDMSearchStore.getState().outputSearch;
    const hasElements = elements?.length > 0;
    const connectedViaLink = inputs?.length > 0;

    let expanded = true;
    if (portIn && portIn.collapsed) {
        expanded = false;
    }

    let indentation = treeDepth * 16;
    if (!portIn) {
        indentation += 24;
    }

    const hasDefaultValue = expression && getDefaultValue(arrayField.kind) === expression.trim();
    let isDisabled = portIn.descendantHasValue;

    if (!isDisabled && !hasDefaultValue) {
        if (hasElements && expanded && portIn.parentModel) {
            portIn.setDescendantHasValue();
            isDisabled = true;
        }
        if (portIn.parentModel
            && (Object.entries(portIn.parentModel.links).length > 0 || portIn.parentModel.ancestorHasValue)
        ) {
            portIn.ancestorHasValue = true;
            isDisabled = true;
        }
    }

    const handlePortState = (state: PortState) => {
        setPortState(state)
    };

    const handleEditValue = () => {
        if (portIn)
            setExprBarFocusedPort(portIn);
    };

    const onAddElementClick = async () => {
        await handleAddArrayElement(arrayField?.kind);
    };

    const label = (
        <span style={{ marginRight: "auto" }} data-testid={`record-widget-field-label-${portIn?.getName()}`}>
            <span
                className={classnames(classes.valueLabel,
                    isDisabled ? classes.labelDisabled : "")}
                style={{ marginLeft: expression && !connectedViaLink ? 0 : indentation + 24 }}
            >
                <OutputSearchHighlight>{fieldName}</OutputSearchHighlight>
                {!field?.optional && <span className={classes.requiredMark}>*</span>}
                {fieldName && typeName && ":"}
            </span>
            {typeName && (
                <span className={classnames(classes.outputTypeLabel, isDisabled ? classes.labelDisabled : "")}>
                    {typeName}
                </span>
            )}
            {!hasElements && !connectedViaLink && (expression || hasDefaultValue) && (
                <span className={classes.outputNodeValueBase}>
                    {diagnostics ? (
                        <DiagnosticTooltip
                            placement="right"
                            diagnostic={diagnostics[0].message}
                            value={expression}
                            onClick={handleEditValue}
                        >
                            <Button
                                appearance="icon"
                                data-testid={`array-widget-field-${portIn?.getName()}`}
                            >
                                {expression}
                                <Icon
                                    name="error-icon"
                                    sx={{ height: "14px", width: "14px", marginLeft: "4px" }}
                                    iconSx={{ fontSize: "14px", color: "var(--vscode-errorForeground)" }}
                                />
                            </Button>
                        </DiagnosticTooltip>
                    ) : (
                        <span
                            className={classes.outputNodeValue}
                            onClick={handleEditValue}
                            data-testid={`array-widget-field-${portIn?.getName()}`}
                        >
                            {expression}
                        </span>
                    )}
                </span>
            )}
        </span>
    );

    const arrayElements = useMemo(() => {
        return elements && (
            elements.map((element, index) => {
                const { expression } = element;
                if (arrayField?.kind === TypeKind.Record) {
                    return (
                        <>
                            <TreeBody>
                                <ObjectOutputFieldWidget
                                    key={`arr-output-field-${fieldFQN}-${index}`}
                                    engine={engine}
                                    field={arrayField}
                                    getPort={getPort}
                                    parentId={fieldFQN}
                                    context={context}
                                    fieldIndex={index}
                                    treeDepth={treeDepth + 1}
                                    deleteField={deleteField}
                                    hasHoveredParent={isHovered || hasHoveredParent}
                                />
                            </TreeBody>
                            <br />
                        </>
                    );
                } else if (arrayField?.kind === TypeKind.Array) {
                    return (
                        <ArrayOutputFieldWidget
                            key={`arr-output-field-${fieldFQN}-${index}`}
                            engine={engine}
                            field={arrayField}
                            getPort={getPort}
                            parentId={fieldFQN}
                            context={context}
                            fieldIndex={index}
                            treeDepth={treeDepth + 1}
                            deleteField={deleteField}
                            hasHoveredParent={isHovered || hasHoveredParent}
                        />
                    )
                } else {
                    if (searchValue && !expression.toLowerCase().includes(searchValue.toLowerCase())) {
                        return null;
                    }
                }
                return (
                    <PrimitiveOutputElementWidget
                        key={`arr-output-field-${fieldFQN}-${index}`}
                        parentId={fieldFQN}
                        field={arrayField}
                        engine={engine}
                        getPort={getPort}
                        context={context}
                        fieldIndex={index}
                        deleteField={deleteField}
                        isArrayElement={true}
                        hasHoveredParent={isHovered || hasHoveredParent}
                    />
                );
            })
        );
    }, [elements]);

    const addElementButton = useMemo(() => {
        return (
            <Button
                key={`array-widget-${portIn?.getName()}-add-element`}
                className={classes.addArrayElementButton}
                appearance="icon"
                aria-label="add"
                onClick={onAddElementClick}
                disabled={isAddingElement}
                data-testid={`array-widget-${portIn?.getName()}-add-element`}
            >
                {isAddingElement
                    ? <ProgressRing sx={{ height: '16px', width: '16px' }} />
                    : <Codicon name="add" iconSx={{ color: "var(--vscode-inputOption-activeForeground)" }} />
                }
                Add Element
            </Button>
        );
    }, [isAddingElement]);

    const handleExpand = () => {
        const collapsedFields = collapsedFieldsStore.collapsedFields;
        if (!expanded) {
            collapsedFieldsStore.setCollapsedFields(collapsedFields.filter((element) => element !== fieldFQN));
        } else {
            collapsedFieldsStore.setCollapsedFields([...collapsedFields, fieldFQN]);
        }
    };

    const handleArrayInitialization = async () => {
        setLoading(true);
        try {
            await addValue(fieldFQN, '[]', context);
        } finally {
            setLoading(false);
        }
    };

    const handleArrayDeletion = async () => {
        setLoading(true);
        try {
            // await deleteField(field.value);
        } finally {
            setLoading(false);
        }
    };

    const handleAddArrayElement = async (typeKind: TypeKind) => {
        setIsAddingElement(true)
        try {
            const { mappings } = context.model;
            let updatedMappings = mappings.slice();
            const defaultValue = getDefaultValue(typeKind);

            if (hasElements) {
                // TODO: handle array element addition for alredy initialized array
            } else {
                const newMapping: Mapping = {
                    output: fieldFQN,
                    inputs: [],
                    expression: defaultValue
                };
                updatedMappings.push(newMapping);          
            }

            return await context.applyModifications(updatedMappings);
        } finally {
            setIsAddingElement(false);
        }
    };

    const onMouseEnter = () => {
        setIsHovered(true);
    };

    const onMouseLeave = () => {
        setIsHovered(false);
    };

    const valConfigMenuItems: ValueConfigMenuItem[] = hasElements || hasDefaultValue
        ? [
            { title: ValueConfigOption.EditValue, onClick: handleEditValue },
            { title: ValueConfigOption.DeleteArray, onClick: handleArrayDeletion },
        ]
        : [
            { title: ValueConfigOption.InitializeArray, onClick: handleArrayInitialization }
        ];

    return (
        <div
            className={classnames(classes.treeLabelArray, hasHoveredParent ? classes.treeLabelParentHovered : "")}
        >
            {!asOutput && (
                <div
                    id={"recordfield-" + fieldFQN}
                    className={classnames(classes.ArrayFieldRow,
                        isDisabled ? classes.ArrayFieldRowDisabled : "",
                        (portState !== PortState.Unselected) ? classes.treeLabelPortSelected : "",
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
                                dataTestId={`array-type-editable-record-field-${portIn.getName()}`}
                            />
                        )}
                    </span>
                    <span className={classes.label}>
                        {(expression && !connectedViaLink) && (
                            <FieldActionWrapper>
                                <Button
                                    appearance="icon"
                                    sx={{ marginLeft: indentation }}
                                    onClick={handleExpand}
                                    data-testid={`${portIn?.getName()}-expand-icon-array-field`}
                                >
                                    {expanded ? <Codicon name="chevron-down" /> : <Codicon name="chevron-right" />}
                                </Button>
                            </FieldActionWrapper>
                        )}
                        {label}
                    </span>
                    {(isLoading) ? (
                        <ProgressRing />
                    ) : (((expression && !connectedViaLink) || !isDisabled) && (
                        <FieldActionWrapper>
                            <ValueConfigMenu
                                menuItems={valConfigMenuItems}
                                isDisabled={!typeName}
                                portName={portIn?.getName()}
                            />
                        </FieldActionWrapper>
                    ))}
                </div>
            )}
            {(expanded && expression) && (
                <div data-testid={`array-widget-${portIn?.getName()}-values`}>
                    <div className={classes.innerTreeLabel}>
                        <span>[</span>
                        {arrayElements}
                        {addElementButton}
                        <span>]</span>
                    </div>
                </div>
            )}
        </div>
    );
}
