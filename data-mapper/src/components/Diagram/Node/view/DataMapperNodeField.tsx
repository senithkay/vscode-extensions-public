import React from "react";

import md5 from "blueimp-md5";

import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TreeItem from '@material-ui/lab/TreeItem';

// tslint:disable-next-line: no-implicit-dependencies
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { RecordField, RecordTypeDesc, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DataMapperPortWidget } from "../../Port/view/DataMapperPortWidget";
import { DataMapperNodeModel, TypeDescriptor } from "../model/DataMapperNode";
import { DataMapperPortModel } from "../../Port/model/DataMapperPortModel";
import { getFieldTypeName } from "../../utils";

// tslint:disable: jsx-no-multiline-js
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        nested: {
            paddingLeft: theme.spacing(4),
        },
        treeLabel: {
            verticalAlign: "middle",
            padding: "5px",
            minWidth: "100px",
            backgroundColor: "#74828F"
        },
        treeLabelOutPort: {
            float: "right"
        },
        treeLabelInPort: {
            float: "left",
            marginRight: "25px"
        },
        typeLabel: {
            marginLeft: "3px",
            // color: "green",
            backgroundColor: "green",
            padding: "2px 5px 2px 5px"
        }
    }),
);

export interface DataMapperNodeFieldProps {
    parentId: string;
    name: string;
    typeNode: RecordField | RecordTypeDesc;
    nodeModel: DataMapperNodeModel;
    engine: DiagramEngine;
    classNames?: string;
}

export function DataMapperNodeField(props: DataMapperNodeFieldProps) {
    const { parentId, name, typeNode, nodeModel, engine, classNames } = props;
    const classes = useStyles();
    
    const portIn = nodeModel.getPort(md5(JSON.stringify(typeNode.position) + "IN")) as DataMapperPortModel;
    const portOut = nodeModel.getPort(md5(JSON.stringify(typeNode.position) + "OUT")) as DataMapperPortModel;
    const typeName = STKindChecker.isRecordField(typeNode)
        ? getFieldTypeName(typeNode)
        : "record";

    const label = (
        <div className={classes.treeLabel}>
            <span className={classes.treeLabelInPort}>
                {portIn &&
                    <DataMapperPortWidget engine={engine} port={portIn} />
                }
            </span>
            <span>
                {name}
            </span>
            {typeName &&
                <span className={classes.typeLabel}>
                    {typeName}
                </span>
            }
            <span className={classes.treeLabelOutPort}>
                {portOut &&
                    <DataMapperPortWidget engine={engine} port={portOut} />
                }
            </span>
        </div>
    );
    return (
        <>
            <TreeItem nodeId={parentId + "." + name} label={label}>
                {STKindChecker.isRecordField(typeNode) && STKindChecker.isRecordTypeDesc(typeNode.typeName) &&
                    typeNode.typeName.fields.map((field) => {
                        if (STKindChecker.isRecordField(field)) {
                            return <DataMapperNodeField
                                engine={engine}
                                name={field.fieldName.value}
                                typeNode={field}
                                nodeModel={nodeModel}
                                parentId={parentId + "." + name}
                                classNames={classes.nested}
                            />;
                        } else {
                            // TODO handle fields with default values and included records
                            return <></>;
                        }
                    })
                }
            </TreeItem>
        </>
    );
}
