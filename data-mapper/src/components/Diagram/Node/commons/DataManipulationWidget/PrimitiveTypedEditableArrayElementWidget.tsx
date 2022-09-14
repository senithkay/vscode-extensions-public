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
import React, { useState } from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { EditButton } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import { getModification } from "../../../utils/modifications";

import { useStyles } from "./styles";

export interface PrimitiveTypedEditableArrayElementWidgetProps {
    parentId: string;
    field: EditableRecordField;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    context: IDataMapperContext;
    fieldIndex?: number;
}

export function PrimitiveTypedEditableArrayElementWidget(props: PrimitiveTypedEditableArrayElementWidgetProps) {
    const { parentId, field, getPort, engine, context, fieldIndex } = props;
    const classes = useStyles();

    const value = field?.value.source.trim();
    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}`
        : `${parentId}.${value}`;
    const portIn = getPort(`${fieldId}.IN`);
    const hasValue = field.hasValue() && !!value;

    const [editable, setEditable] = useState<boolean>(false);
    const [str, setStr] = useState(hasValue ? value : "");

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

    const onChange = (newVal: string) => {
        setStr(newVal);
    };

    const onKeyUp = (key: string) => {
        if (key === "Escape") {
            setEditable(false);
        }
        if (key === "Enter") {
            const targetPosition = field?.value.position;
            const modification = [getModification(str, {
                ...targetPosition
            })];
            context.applyModifications(modification);
        }
    };

    return (
        <>
            <div className={classes.treeLabel}>
                <span className={classes.treeLabelInPort}>
                    {portIn &&
                        <DataMapperPortWidget engine={engine} port={portIn}/>
                    }
                </span>
                <span>{label}</span>
                <EditButton
                    onClick={handleEditable}
                    className={classes.editButton}
                />
            </div>
            {editable && (
                <input
                    size={str.length}
                    spellCheck={false}
                    style={{
                        padding: "5px",
                        fontFamily: "monospace",
                        zIndex: 1000,
                        border: "1px solid #5567D5"
                    }}
                    autoFocus={true}
                    value={str}
                    onChange={(event) => onChange(event.target.value)}
                    onKeyUp={(event) => onKeyUp(event.key)}
                    onBlur={() => setEditable(false)}
                />
            )}
        </>
    );
}
