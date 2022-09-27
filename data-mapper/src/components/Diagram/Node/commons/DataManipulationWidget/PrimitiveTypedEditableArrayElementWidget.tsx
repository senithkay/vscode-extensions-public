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

import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import { getFieldLabel } from "../../../utils/dm-utils";

import { useStyles } from "./styles";
import { ValueConfigMenu, ValueConfigOption } from "./ValueConfigButton";

export interface PrimitiveTypedEditableArrayElementWidgetProps {
    parentId: string;
    field: EditableRecordField;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    context: IDataMapperContext;
    fieldIndex?: number;
    deleteField?: (node: STNode) => void;
}

export function PrimitiveTypedEditableArrayElementWidget(props: PrimitiveTypedEditableArrayElementWidgetProps) {
    const { parentId, field, getPort, engine, context, fieldIndex, deleteField } = props;
    const classes = useStyles();

    const value = field?.value && field.value.source.trim();
    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}`
        : `${parentId}.${value}`;
    const portIn = getPort(`${fieldId}.IN`);

    const [editable, setEditable] = useState<boolean>(false);

    useEffect(() => {
        if (editable) {
            context.enableStatementEditor({
                value: field?.value && field.value.source,
                valuePosition: field?.value && field.value.position,
                label: getFieldLabel(fieldId)
            });
        }
    }, [editable]);

    const label = (
        <span style={{marginRight: "auto"}}>
            <span className={classes.valueLabel}>
                {value}
            </span>
        </span>
    );

    const handleEditable = () => {
        setEditable(true);
    };

    const handleDelete = async () => {
        deleteField(field.value);
    };

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
                        menuItems={[
                            {
                                title: ValueConfigOption.EditValue,
                                onClick: handleEditable
                            },
                            {
                                title: ValueConfigOption.DeleteElement,
                                onClick: handleDelete
                            }
                        ]}
                    />
                </div>
            )}
        </>
    );
}
