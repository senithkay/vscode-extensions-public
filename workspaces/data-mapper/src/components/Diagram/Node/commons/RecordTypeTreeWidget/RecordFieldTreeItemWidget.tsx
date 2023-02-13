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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React from "react";

import IconButton from "@material-ui/core/IconButton";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import { getBalRecFieldName, getOptionalRecordField, getTypeName } from "../../../utils/dm-utils";
import { InputSearchHighlight } from "../SearchHighlight";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        treeLabel: {
            verticalAlign: "middle",
            padding: "5px",
            minWidth: "100px",
            display: "flex",
            minHeight: "24px",
            background: "#FFF"
        },
        treeLabelOutPort: {
            float: "right",
            width: 'fit-content',
            marginLeft: "auto",
        },
        treeLabelInPort: {
            float: "left",
            marginRight: "5px",
            width: 'fit-content',
        },
        typeLabel: {
            marginLeft: "3px",
            verticalAlign: "middle",
            padding: "5px",
            minWidth: "100px",
            marginRight: "24px",
            fontFamily: "GilmerRegular",
            fontWeight: 400
        },
        valueLabel: {
            verticalAlign: "middle",
            padding: "5px",
        },
        group: {
            marginLeft: "0px",
            paddingLeft: "0px",
            paddingBottom: "5px"
        },
        content: {
            borderTopRightRadius: theme.spacing(2),
            borderBottomRightRadius: theme.spacing(2),
            paddingRight: theme.spacing(1),
        },
        label: {
            width: "300px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            display: "inline-block",
            textOverflow: "ellipsis",
            "&:hover": {
                overflow: "visible"
            }
        },
        expandIcon: {
            color: theme.palette.common.black,
            height: "25px",
            width: "25px",
            marginLeft: "auto"
        }
    }),
);

export interface RecordFieldTreeItemWidgetProps {
    parentId: string;
    field: Type;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    treeDepth?: number;
    handleCollapse: (portName: string, isExpanded?: boolean) => void;
    isOptional?: boolean;

}

export function RecordFieldTreeItemWidget(props: RecordFieldTreeItemWidgetProps) {
    const { parentId, field, getPort, engine, handleCollapse, treeDepth = 0, isOptional } = props;
    const classes = useStyles();

    const fieldName = getBalRecFieldName(field.name);
    const fieldId = `${parentId}${isOptional ? `?.${fieldName}` : `.${fieldName}`}`;
    const portIn = getPort(`${fieldId}.IN`);
    const portOut = getPort(`${fieldId}.OUT`);
    let fields: Type[];
    let optional = false;

    const optionalRecordField = getOptionalRecordField(field);
    if (optionalRecordField) {
        optional = true
        fields = optionalRecordField.fields;
    } else if (field.typeName === PrimitiveBalType.Record) {
        fields = field.fields;
    }

    let expanded = true;
    if ((portIn && portIn.collapsed) || (portOut && portOut.collapsed)) {
        expanded = false;
    }

    const typeName = getTypeName(field);

    const indentation = fields ? 0 : ((treeDepth + 1) * 16) + 8;

    const label = (
        <span style={{ marginRight: "auto" }}>
            <span className={classes.valueLabel} style={{ marginLeft: indentation }}>
                <InputSearchHighlight>{fieldName}</InputSearchHighlight>
                {field.optional && "?"}
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
        handleCollapse(fieldId, !expanded);
    }

    return (
        <>
            <div className={classes.treeLabel}>
                <span className={classes.treeLabelInPort}>
                    {portIn &&
                        <DataMapperPortWidget engine={engine} port={portIn} />
                    }
                </span>
                <span className={classes.label}>
                    {fields && <IconButton
                        className={classes.expandIcon}
                        style={{ marginLeft: treeDepth * 16 }}
                        onClick={handleExpand}
                    >
                        {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                    </IconButton>}
                    {label}
                </span>
                <span className={classes.treeLabelOutPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut} />
                    }
                </span>
            </div>
            {fields && expanded &&
                fields.map((subField) => {
                    return (
                        <RecordFieldTreeItemWidget
                            key={fieldId}
                            engine={engine}
                            field={subField}
                            getPort={getPort}
                            parentId={fieldId}
                            handleCollapse={handleCollapse}
                            treeDepth={treeDepth + 1}
                            isOptional={isOptional || optional}
                        />
                    );
                })
            }
        </>
    );
}
