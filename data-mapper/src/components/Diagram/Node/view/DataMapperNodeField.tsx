import { Collapse, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import React from "react";
import { DataMapperNodeModel, TypeDescriptor } from "../model/DataMapperNode";
import { DataMapperPortWidget } from "../../Port/view/DataMapperPortWidget";
import { isObject } from "../../../../utils/st-utils";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

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
    const portIn = nodeModel.getPort(parentId + "." + name + ".in");
    const portOut = nodeModel.getPort(parentId + "." + name + ".out");

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
                <List dense component="div" disablePadding>
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
