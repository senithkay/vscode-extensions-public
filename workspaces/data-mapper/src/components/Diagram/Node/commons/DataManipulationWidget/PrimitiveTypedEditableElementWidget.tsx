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
import React, { useEffect, useMemo, useState } from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classnames from "classnames";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, PortState, RecordFieldPortModel } from "../../../Port";
import { getDefaultValue, getExprBodyFromLetExpression, getFieldLabel, getFieldName } from "../../../utils/dm-utils";

import { useStyles } from "./styles";
import { ValueConfigMenu, ValueConfigOption } from "./ValueConfigButton";

export interface PrimitiveTypedEditableElementWidgetProps {
    parentId: string;
    field: EditableRecordField;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    context: IDataMapperContext;
    fieldIndex?: number;
    deleteField?: (node: STNode) => Promise<void>;
    isArrayElement?: boolean;
    hasHoveredParent?: boolean;
}

export function PrimitiveTypedEditableElementWidget(props: PrimitiveTypedEditableElementWidgetProps) {
    const {
        parentId,
        field,
        getPort,
        engine,
        context,
        fieldIndex,
        deleteField,
        isArrayElement,
        hasHoveredParent
    } = props;
    const classes = useStyles();

    const fieldName = getFieldName(field);
    const typeName = field.type.typeName;
    let fieldId = parentId;
    if (fieldIndex !== undefined) {
        fieldId = fieldName !== ''
            ? `${parentId}.${fieldIndex}.${fieldName}`
            : `${parentId}.${fieldIndex}`;
    } else if (fieldName) {
        fieldId = `${parentId}.${typeName}.${fieldName}`;
    } else {
        fieldId = `${parentId}.${typeName}`;
    }
    const portIn = getPort(`${fieldId}.IN`);
    let body: STNode;

    if (field?.value && STKindChecker.isLetExpression(field.value)) {
        body = getExprBodyFromLetExpression(field.value)
    } else if (field?.value && STKindChecker.isQueryExpression(field.value)) {
        body = field.value.selectClause.expression;
    } else {
        body = field.value;
    }
    const value = body && body.source.trim();

    const [editable, setEditable] = useState<boolean>(false);
    const [portState, setPortState] = useState<PortState>(PortState.Unselected);

    useEffect(() => {
        if (editable) {
            context.enableStatementEditor({
                value: field?.value && field.value.source,
                valuePosition: field?.value && field.value.position as NodePosition,
                label: getFieldLabel(fieldId)
            });
            setEditable(false);
        }
    }, [editable]);

    const label = (
        <span style={{marginRight: "auto"}} data-testid={`primitive-array-element-${portIn.getName()}`}>
            <span className={classes.valueLabel}>
                {value}
            </span>
        </span>
    );

    const handleEditable = () => {
        setEditable(true);
    };

    const handleDelete = async () => {
        await deleteField(field.value);
    };

    const valueConfigMenuItems = useMemo(() => {
        const items =  [
            {
                title: ValueConfigOption.EditValue,
                onClick: handleEditable
            }
        ];
        if (isArrayElement) {
            items.push({
                title: ValueConfigOption.DeleteElement,
                onClick: handleDelete
            });
        } else if (value !== getDefaultValue(field.type)) {
            items.push({
                title: ValueConfigOption.DeleteValue,
                onClick: handleDelete
            });
        }
        return items;
    }, [value]);

    const handlePortState = (state: PortState) => {
        setPortState(state)
    };

    return (
        <>
            {value && (
                <div
                    id={"recordfield-" + fieldId}
                    className={classnames(classes.treeLabel,
                        (portState !== PortState.Unselected) ? classes.treeLabelPortSelected : "",
                        hasHoveredParent ? classes.treeLabelParentHovered : ""
                    )}
                >
                    <span className={classes.treeLabelInPort}>
                        {portIn &&
                            <DataMapperPortWidget engine={engine} port={portIn} handlePortState={handlePortState} />
                        }
                    </span>
                    <span>{label}</span>
                    <ValueConfigMenu
                        menuItems={valueConfigMenuItems}
                        portName={portIn?.getName()}
                    />
                </div>
            )}
        </>
    );
}
