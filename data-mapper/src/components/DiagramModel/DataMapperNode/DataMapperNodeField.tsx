import { Collapse, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from "@material-ui/core";

import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import React from "react";
import { DataMapperNodeModel } from "./DataMapperNode";
import { DataMapperPortWidget } from "./DataMapperPortWidget";

export interface DataMapperNodeFieldProps {
    label: string;
    value: any;
    nodeModel: DataMapperNodeModel;
    engine: DiagramEngine;
}

export function DataMapperNodeField(props: DataMapperNodeFieldProps) {
    const { label, value, nodeModel, engine } = props;
    return <ListItem>
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
        {isObject(value) && false &&
            <Collapse in={true} timeout="auto" unmountOnExit>
                <List dense={true}>
                    {
                        Object.entries(value).map((entry: [string, any]): JSX.Element => 
                            <DataMapperNodeField
                                nodeModel={nodeModel} label={entry[0]} value={entry[1]} engine={engine} 
                            />)
                    }
                </List>
            </Collapse>
        }
    </ListItem>;
}

function isObject (item: any) {
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
  }