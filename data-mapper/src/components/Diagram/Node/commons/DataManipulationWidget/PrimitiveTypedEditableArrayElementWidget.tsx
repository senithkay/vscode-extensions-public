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

import { DiagramEngine } from "@projectstorm/react-diagrams-core";

import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";

import { useStyles } from "./styles";

export interface PrimitiveTypedEditableArrayElementWidgetProps {
    parentId: string;
    field: EditableRecordField;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    fieldIndex?: number;
}

export function PrimitiveTypedEditableArrayElementWidget(props: PrimitiveTypedEditableArrayElementWidgetProps) {
    const { parentId, field, getPort, engine, fieldIndex } = props;
    const classes = useStyles();

    const value = field?.value.source.trim();
    const fieldId = fieldIndex !== undefined
        ? `${parentId}.${fieldIndex}`
        : `${parentId}.${value}`;
    const portIn = getPort(`${fieldId}.IN`);

    const label = (
        <span style={{marginRight: "auto"}}>
            <span className={classes.valueLabel}>
                {value}
            </span>
        </span>
    );

    return (
        <>
            <div className={classes.treeLabel}>
                <span className={classes.treeLabelInPort}>
                    {portIn &&
                        <DataMapperPortWidget engine={engine} port={portIn}/>
                    }
                </span>
                <span>{label}</span>
                {/*<IconButton*/}
                {/*    onClick={undefined}*/}
                {/*    className={classes.iconButton}*/}
                {/*>*/}
                {/*    <div className={classes.editIcon}>*/}
                {/*        <EditIcon />*/}
                {/*    </div>*/}
                {/*</IconButton>*/}
            </div>
        </>
    );
}
