import { Collapse, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import React from "react";
import { DataMapperNodeModel } from "./DataMapperNode";
import { DataMapperPortWidget } from "./DataMapperPortWidget";
import { isObject } from "./utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    nested: {
      paddingLeft: theme.spacing(4),
    },
  }),
);

export interface DataMapperNodeFieldProps {
    label: string;
    value: any;
    nodeModel: DataMapperNodeModel;
    engine: DiagramEngine;
    classNames?: string;
}

export function DataMapperNodeField(props: DataMapperNodeFieldProps) {
    const { label, value, nodeModel, engine, classNames } = props;
    const classes = useStyles();
    return (
        <>
            <ListItem className={classNames}>
                {nodeModel.supportInput &&
                    <ListItemIcon>
                        <DataMapperPortWidget engine={engine} port={nodeModel.getPort(label + "_in")} />
                    </ListItemIcon>
                }
                <ListItemText
                    primary={label}
                />
                {nodeModel.supportOutput &&
                    <ListItemSecondaryAction>
                        <DataMapperPortWidget engine={engine} port={nodeModel.getPort(label + "_out")} />
                    </ListItemSecondaryAction>

                }
            </ListItem>
            {isObject(value) &&
                <List dense component="div" disablePadding>
                {
                    Object.entries(value).map((entry: [string, any]): JSX.Element => 
                        <DataMapperNodeField
                            nodeModel={nodeModel} label={entry[0]} value={entry[1]} engine={engine}
                            classNames={classes.nested}
                        />)
                }
                </List>
            }
        </>
    );
}
