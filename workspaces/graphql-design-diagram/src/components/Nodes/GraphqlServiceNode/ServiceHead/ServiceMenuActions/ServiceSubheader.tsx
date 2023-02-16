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

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline no-implicit-dependencies no-submodule-imports
import React, { useContext, useState } from "react";

import Button from "@material-ui/core/Button";
import Tooltip from "@mui/material/Tooltip";

import { DiagramContext } from "../../../../DiagramContext/GraphqlDiagramContext";
import { FunctionType, Position } from "../../../../resources/model";

import { AddFunctionWidget } from "./AddFunctionWidget";

interface ServiceSubheaderProps {
    location: Position;
}

export function ServiceSubheader(props: ServiceSubheaderProps) {
    const { location } = props;
    const { servicePanel } = useContext(DiagramContext);

    const [showTooltip, setTooltipStatus] = useState<boolean>(false);

    return (
        <>
            <Button
                onClick={() => servicePanel()}
                onMouseOver={() => setTooltipStatus(false)}
                color="primary"
                data-testid="add-operation"
                style={{ textTransform: 'none', padding: '0px', justifyContent: "flex-start" }}
            >
                Edit Service
            </Button>
            <Tooltip
                open={showTooltip}
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
                                offset: [0, 0],
                            },
                        },
                    ]
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
                            color: '#efeeee',
                            marginLeft: '5px'
                        }
                    }
                }}
                arrow={true}
                placement="right"
            >
                <Button
                    onMouseOver={() => setTooltipStatus(true)}
                    color="primary"
                    data-testid="add-operation"
                    style={{ textTransform: 'none', padding: '0px', justifyContent: "flex-start" }}
                >
                    Add Operation
                </Button>
            </Tooltip>
        </>
    );
}
