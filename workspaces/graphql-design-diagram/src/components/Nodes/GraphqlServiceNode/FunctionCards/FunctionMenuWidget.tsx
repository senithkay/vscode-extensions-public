/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline  no-implicit-dependencies no-submodule-imports
import React, { useState } from "react";

import { MenuList, Paper } from "@material-ui/core";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Tooltip from "@mui/material/Tooltip";

import { GoToSourceMenuItem } from "../../../NodeActionMenu/GoToSourceMenuItem";
import { FunctionType, Position } from "../../../resources/model";

import { DeleteFunctionWidget } from "./MenuActionComponents/DeleteFunction";
import { DesignFunctionWidget } from "./MenuActionComponents/DesignFunction";
import { EditFunctionWidget } from "./MenuActionComponents/EditFunction";

interface FunctionMenuWidgetProps {
    location: Position;
    functionType: FunctionType;
}

export function FunctionMenuWidget(props: FunctionMenuWidgetProps) {
    const { location, functionType } = props;

    const [showTooltip, setTooltipStatus] = useState<boolean>(false);

    return (
        <>
            {location &&
            <Tooltip
                open={showTooltip}
                onClose={() => setTooltipStatus(false)}
                title={
                    <div onClick={() => setTooltipStatus(false)}>
                        <Paper style={{ maxWidth: "100%" }}>
                            <MenuList style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                                <DesignFunctionWidget position={location} />
                                <EditFunctionWidget position={location} functionType={functionType} />
                                <DeleteFunctionWidget position={location} />
                                {location?.filePath &&
                                <GoToSourceMenuItem location={location} />
                                }
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
                    cursor="pointer"
                    onClick={() => setTooltipStatus(true)}
                    sx={{
                        fontSize: '18px',
                        margin: '0px',
                        position: 'absolute',
                        right: 0.5
                    }}
                />
            </Tooltip>
            }
        </>
    );
}
