/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React from "react";

import { Autocomplete, TextField } from "@mui/material";

import { useGraphQlContext } from "../DiagramContext/GraphqlDiagramContext";

import { useStyles } from "./styles";

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
}

export function NodeFilter(props: NodeFilterProps) {
    const { nodeList } = props;
    const { setFilteredNode, filteredNode } = useGraphQlContext();
    const filterStyles = useStyles();

    const updateNode = (newValue: NodeType) => {
        if (newValue) {
            setFilteredNode(newValue);
        }
    }

    return (
        <>
            {
                nodeList && (
                    <Autocomplete
                        data-testid="node-filter-autocomplete"
                        id="node-filter-select"
                        options={nodeList}
                        defaultValue={filteredNode ? filteredNode : nodeList[0]}
                        value={filteredNode ? filteredNode : nodeList[0]}
                        onChange={(_, newValue: NodeType) => updateNode(newValue)}
                        getOptionLabel={(option) => option.name}
                        size="small"
                        renderInput={(params) =>
                            <TextField {...params} size="small" label="Type" variant="outlined" className={filterStyles.autoComplete} />}
                        className={filterStyles.autoComplete}
                    />
                )
            }
        </>
    );
}
