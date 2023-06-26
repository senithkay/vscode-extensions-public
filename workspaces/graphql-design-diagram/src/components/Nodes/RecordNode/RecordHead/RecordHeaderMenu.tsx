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

import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper } from "@material-ui/core";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Tooltip from "@mui/material/Tooltip";
import { LabelEditIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { useGraphQlContext } from "../../../DiagramContext/GraphqlDiagramContext";
import { GoToSourceMenuItem } from "../../../NodeActionMenu/GoToSourceMenuItem";
import { useStyles } from "../../../NodeActionMenu/styles";
import { Colors, Position } from "../../../resources/model";
import { getParentSTNodeFromRange } from "../../../utils/common-util";
import { getSyntaxTree } from "../../../utils/ls-util";

interface RecordHeaderMenuProps {
    location: Position;
}

export function RecordHeaderMenu(props: RecordHeaderMenuProps) {
    const { location } = props;
    const classes = useStyles();

    const { recordEditor, langClientPromise, fullST, currentFile } = useGraphQlContext();

    const [showTooltip, setTooltipStatus] = useState<boolean>(false);

    const handleEditRecord = async () => {
        let recordModel: STNode;
        let currentST: STNode = fullST;
        const nodePosition: NodePosition = {
            endColumn: location.endLine.offset,
            endLine: location.endLine.line,
            startColumn: location.startLine.offset,
            startLine: location.startLine.line
        };
        if (location.filePath === currentFile.path) {
            const parentNode = getParentSTNodeFromRange(nodePosition, fullST);
            recordModel = parentNode;
        } else {
            const syntaxTree: STNode = await getSyntaxTree(location.filePath, langClientPromise);
            const parentNode = getParentSTNodeFromRange(nodePosition, syntaxTree);
            recordModel = parentNode;
            currentST = syntaxTree;
        }
        if (recordModel && (STKindChecker.isRecordTypeDesc(recordModel) || STKindChecker.isTypeDefinition(recordModel))) {
            recordEditor(recordModel, location.filePath, currentST);
        }
    }

    return (
        <>
            {location?.filePath && location?.startLine && location?.endLine &&
            <Tooltip
                open={showTooltip}
                onClose={() => setTooltipStatus(false)}
                title={
                    <div onClick={() =>  setTooltipStatus(false)}>
                        <Paper style={{ maxWidth: "100%" }}>
                            <MenuList style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                                <MenuItem onClick={() => handleEditRecord()} style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                                    <ListItemIcon style={{ marginRight: "10px", minWidth: "0px" }}>
                                        <LabelEditIcon />
                                    </ListItemIcon>
                                    <ListItemText className={classes.listItemText}>Edit Record</ListItemText>
                                </MenuItem>
                                <Divider />
                                <GoToSourceMenuItem location={location} />
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
