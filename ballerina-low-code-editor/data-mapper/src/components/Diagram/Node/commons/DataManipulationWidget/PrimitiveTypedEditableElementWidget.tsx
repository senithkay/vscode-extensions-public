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

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import { getDefaultValue, getFieldLabel, getFieldName } from "../../../utils/dm-utils";

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
}

export function PrimitiveTypedEditableElementWidget(props: PrimitiveTypedEditableElementWidgetProps) {
    const { parentId, field, getPort, engine, context, fieldIndex, deleteField, isArrayElement } = props;
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
    const body = field?.value && STKindChecker.isLetExpression(field.value) ? field.value.expression : field.value;
    const value = body && body.source.trim();

    const [editable, setEditable] = useState<boolean>(false);

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

    return (
        <>
            {value && (
                <div className={classes.treeLabel}>
                    <span className={classes.treeLabelInPort}>
                        {portIn &&
                            <DataMapperPortWidget engine={engine} port={portIn}/>
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
