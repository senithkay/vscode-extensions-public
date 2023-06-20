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

import MoreVertIcon from '@mui/icons-material/MoreVert';
import Tooltip from "@mui/material/Tooltip";

import { Colors, Position } from "../../../resources/model";

import { ServiceSubheader } from "./ServiceMenuActions/ServiceSubheader";

interface ServiceHeaderMenuProps {
    location: Position;
}

export function ServiceHeaderMenu(props: ServiceHeaderMenuProps) {
    const { location } = props;

    const [showTooltip, setTooltipStatus] = useState<boolean>(false);

    return (
        <>
            {location &&
            <Tooltip
                open={showTooltip}
                onClose={() => setTooltipStatus(false)}
                title={
                    <div onClick={() => setTooltipStatus(false)}>
                        <ServiceSubheader location={location}/>
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
                        backgroundColor: `${Colors.SECONDARY}`,
                        borderRadius: '30%',
                        fontSize: '18px',
                        margin: '0px',
                        position: 'absolute',
                        right: 2.5,
                        marginLeft: '5px',
                    }}
                />
            </Tooltip>
            }
        </>
    );
}
