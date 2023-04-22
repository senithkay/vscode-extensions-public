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
import React, { useContext, useEffect, useState } from "react";

import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper } from "@material-ui/core";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Tooltip from "@mui/material/Tooltip";
import { LabelEditIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { DiagramContext } from "../../../DiagramContext/GraphqlDiagramContext";
import { NodeMenuItem } from "../../../NodeActionMenu/NodeMenuItem";
import { useStyles } from "../../../NodeActionMenu/styles";
import { Colors, FunctionType, Position } from "../../../resources/model";
import { getParentSTNodeFromRange } from "../../../utils/common-util";

interface ServiceHeaderMenuProps {
    location: Position;
}

export function ClassHeaderMenu(props: ServiceHeaderMenuProps) {
    const { location } = props;
    const classes = useStyles();

    const { fullST, functionPanel } = useContext(DiagramContext);

    const [showTooltip, setTooltipStatus] = useState<boolean>(false);
    const [model, setModel] = useState<STNode>(null);

    useEffect(() => {
        const nodePosition: NodePosition = {
            endColumn: location.endLine.offset,
            endLine: location.endLine.line,
            startColumn: location.startLine.offset,
            startLine: location.startLine.line
        };
        const parentNode = getParentSTNodeFromRange(nodePosition, fullST);
        setModel(parentNode);
    }, [location]);

    const handleEditClassDef = () => {
        if (model && STKindChecker.isClassDefinition(model)) {
            const lastMemberPosition: NodePosition = {
                endColumn: model.closeBrace.position.endColumn,
                endLine: model.closeBrace.position.endLine,
                startColumn: model.closeBrace.position.startColumn,
                startLine: model.closeBrace.position.startLine
            };
            functionPanel(lastMemberPosition, "GraphqlClass", model);
        }
     }

    return (
        <>
            { model &&
            <Tooltip
                open={showTooltip}
                onClose={() => setTooltipStatus(false)}
                title={
                    <>
                        <Paper style={{maxWidth: "100%"}}>
                            <MenuList style={{paddingTop: "0px", paddingBottom: "0px"}}>
                                <MenuItem onClick={() => handleEditClassDef()} style={{paddingTop: "0px", paddingBottom: "0px"}}>
                                    <ListItemIcon  style={{marginRight: "10px", minWidth: "0px"}}>
                                        <LabelEditIcon/>
                                    </ListItemIcon>
                                    <ListItemText className={classes.listItemText}>Rename Class</ListItemText>
                                </MenuItem>
                                <Divider />
                                <NodeMenuItem position={location} model={model} functionType={FunctionType.CLASS_RESOURCE}/>
                            </MenuList>
                        </Paper>
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
                        right: 2.5
                    }}
                />
            </Tooltip>
            }
        </>
    );
}
