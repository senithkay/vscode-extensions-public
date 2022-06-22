import React from "react";

import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
// tslint:disable-next-line: no-implicit-dependencies
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DataMapperPortWidget } from "../../Port/view/DataMapperPortWidget";
import { DataMapperNodeModel, TypeDescriptor } from "../model/DataMapperNode";
import { DataMapperPortModel } from "../../Port/model/DataMapperPortModel";

// tslint:disable: jsx-no-multiline-js
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        nested: {
            paddingLeft: theme.spacing(4),
        },
    }),
);

export interface DataMapperNodeFieldProps {
    parentId: string;
    name: string;
    typeDesc: TypeDescriptor;
    nodeModel: DataMapperNodeModel;
    engine: DiagramEngine;
    classNames?: string;
}

export function DataMapperNodeField(props: DataMapperNodeFieldProps) {
    const { parentId, name, typeDesc, nodeModel, engine, classNames } = props;
    const classes = useStyles();
    const portIn = nodeModel.getPort(typeDesc.position.toString() + "IN") as DataMapperPortModel;
    const portOut = nodeModel.getPort(typeDesc.position.toString() + "OUT") as DataMapperPortModel;

    return (
        <>
            <ListItem className={classNames}>

                {nodeModel.supportInput && portIn &&
                    <ListItemIcon>
                        <DataMapperPortWidget engine={engine} port={portIn} />
                    </ListItemIcon>
                }
                <ListItemText
                    primary={name}
                />
                {nodeModel.supportOutput && portOut &&
                    <ListItemSecondaryAction>
                        <DataMapperPortWidget engine={engine} port={portOut} />
                    </ListItemSecondaryAction>

                }
            </ListItem>
            {STKindChecker.isRecordTypeDesc(typeDesc) &&
                <List dense={true} component="div" disablePadding={true}>
                    {
                        typeDesc.fields.map((field) => {
                            if (STKindChecker.isRecordField(field)) {
                                return <DataMapperNodeField
                                    engine={engine}
                                    name={field.fieldName.value}
                                    typeDesc={field.typeName}
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
                </List>

            }
        </>
    );
}
