// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline  no-implicit-dependencies no-submodule-imports
import React, { useState } from "react";

import MoreVertIcon from '@mui/icons-material/MoreVert';
import Tooltip from "@mui/material/Tooltip";

import { Colors, FunctionType, Position } from "../../../resources/model";

import { AddFunctionWidget } from "./ServiceMenuActions/AddFunctionWidget";

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
                    <>
                        <AddFunctionWidget position={location} functionType={FunctionType.QUERY}/>
                        <AddFunctionWidget position={location} functionType={FunctionType.MUTATION}/>
                        <AddFunctionWidget position={location} functionType={FunctionType.SUBSCRIPTION}/>
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
                            backgroundColor: '#e6e6e6',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }
                    },
                    arrow: {
                        sx: {
                            color: '#e6e6e6'
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
                        right: 2.5
                    }}
                />
            </Tooltip>
            }
        </>
    );
}
