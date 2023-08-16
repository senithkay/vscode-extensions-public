/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline  no-implicit-dependencies no-submodule-imports
import React, { useState } from "react";

import { MenuList, Paper } from "@material-ui/core";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Tooltip from "@mui/material/Tooltip";

import { NodeType } from "../NodeFilter";

import { FilterNodeMenuItem } from "./FilterNodeMenuItem";

interface FilterNodeMenuProps {
    nodeType: NodeType;
}

export function FilterNodeMenu(props: FilterNodeMenuProps) {
    const { nodeType } = props;

    const [showTooltip, setTooltipStatus] = useState<boolean>(false);

    return (
        <>
            <Tooltip
                open={showTooltip}
                onClose={() => setTooltipStatus(false)}
                title={
                    <div onClick={() => setTooltipStatus(false)}>
                        <Paper style={{ maxWidth: "100%" }}>
                            <MenuList style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                                <FilterNodeMenuItem nodeType={nodeType} />
                            </MenuList>
                        </Paper>
                    </div>
                }
                PopperProps={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, -10],
                            },
                        },
                    ],
                }}
                componentsProps={{
                    tooltip: {
                        sx: {
                            backgroundColor: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            padding: 0
                        }
                    },
                    arrow: {
                        sx: {
                            color: '#efeeee'
                        }
                    }
                }}
                arrow={true}
                placement="right"
            >
                <MoreVertIcon
                    data-testid="filter-node-menu"
                    cursor="pointer"
                    onClick={() => setTooltipStatus(true)}
                    sx={{
                        fontSize: '18px',
                        margin: '0px',
                        position: 'absolute',
                        right: 0.5,
                        zIndex: 1
                    }}
                />
            </Tooltip>
        </>
    );
}
