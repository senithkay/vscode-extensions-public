/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { Box, FormControl, InputLabel, MenuItem } from "@material-ui/core";
import Select from "@material-ui/core/Select";

export enum NodeCategory {
    GRAPHQL_SERVICE = "graphqlService",
    RECORD = "record",
    SERVICE_CLASS = "serviceClass",
    INTERFACE = "interface",
    UNION = "union",
    ENUM = "enum"
}

export interface NodeType {
    name: string;
    type: NodeCategory;
}

interface NodeFilterProps {
    nodeList: NodeType[];
    updateNodeFiltering: (node: NodeType) => void;
}
export function NodeFilter(props: NodeFilterProps) {
    const { nodeList, updateNodeFiltering } = props;
    const [selectedNode, setSelectedNode] = React.useState<NodeType>(null);

    const menuItems = nodeList && nodeList.map((node) => (
        <MenuItem key={node.name} value={node.name}>
            {node.name}
        </MenuItem>
    ));

    const updateNode = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedValue = event.target.value as string;
        const selectedNodeType = nodeList.find((node) => node.name === selectedValue) || null;
        setSelectedNode(selectedNodeType);
        updateNodeFiltering(selectedNodeType);
    }

    return (
        <Box>
            <FormControl style={{margin: "10px", width: "130px"}} variant="outlined">
                <InputLabel id="node-filter-select-label" >Node</InputLabel>
                <Select
                    id="node-filter-select"
                    value={selectedNode ? selectedNode.name : (nodeList ? nodeList[0].name : "")}
                    label="Node"
                    onChange={updateNode}
                    SelectDisplayProps={{ style: { padding: '10px' } }}
                >
                    {nodeList && menuItems}
                </Select>
            </FormControl>
        </Box>
    );
}
