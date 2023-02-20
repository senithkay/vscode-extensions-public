/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline  no-implicit-dependencies no-submodule-imports
import React, { useState } from "react";

import MoreVertIcon from '@mui/icons-material/MoreVert';
import Tooltip from "@mui/material/Tooltip";

import { FunctionType, Position } from "../../../resources/model";

import { DeleteFunctionWidget } from "./MenuActionComponents/DeleteFunction";
import { DesignFunctionWidget } from "./MenuActionComponents/DesignFunction";
import { EditFunctionWidget } from "./MenuActionComponents/EditFunction";

interface FunctionMenuWidgetProps {
    location: Position;
}

export function FunctionMenuWidget(props: FunctionMenuWidgetProps) {
    const { location } = props;

    const [showTooltip, setTooltipStatus] = useState<boolean>(false);

    return (
        <>
            {location &&
            <Tooltip
                open={showTooltip}
                onClose={() => setTooltipStatus(false)}
                title={
                    <>
                        <DesignFunctionWidget position={location}/>
                        {/*TODO support for subscription and mutation types*/}
                        <EditFunctionWidget position={location} functionType={FunctionType.QUERY}/>
                        <DeleteFunctionWidget position={location}/>
                    </>
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
                            backgroundColor: '#efeeee',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
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
                        // backgroundColor: `${Colors.SECONDARY}`,
                        // borderRadius: '30%',
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
