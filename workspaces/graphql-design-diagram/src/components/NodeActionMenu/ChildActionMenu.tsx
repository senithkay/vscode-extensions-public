/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda jsx-wrap-multiline  no-implicit-dependencies no-submodule-imports
import React, { useEffect, useState } from "react";

import { MenuList, Paper } from "@material-ui/core";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Tooltip from "@mui/material/Tooltip";
import { NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { useGraphQlContext } from "../DiagramContext/GraphqlDiagramContext";
import { FunctionType, Position } from "../resources/model";
import { getParentSTNodeFromRange } from "../utils/common-util";
import { getSyntaxTree } from "../utils/ls-util";

import { DesignNode } from "./DesignNode";
import { EditNode } from "./EditNode";

interface ChildActionMenuProps {
    functionType: FunctionType;
    location: Position;
    path?: string;
}

export function ChildActionMenu(props: ChildActionMenuProps) {
    const { functionType, location, path } = props;
    const { langClientPromise, currentFile, fullST } = useGraphQlContext();

    const [showTooltip, setTooltipStatus] = useState<boolean>(false);
    const [currentModel, setCurrentModel] = useState<STNode>(null);
    const [currentST, setST] = useState<STNode>(fullST);

    useEffect(() => {
        if (showTooltip) {
            let parentModel: STNode;
            (async () => {
                const nodePosition: NodePosition = {
                    endColumn: location.endLine.offset,
                    endLine: location.endLine.line,
                    startColumn: location.startLine.offset,
                    startLine: location.startLine.line
                };
                if (location.filePath === currentFile.path) {
                    const parentNode = getParentSTNodeFromRange(nodePosition, fullST);
                    parentModel = parentNode;
                } else {
                    // parent node is retrieved as the classObject.position only contains the position of the class name
                    const syntaxTree: STNode = await getSyntaxTree(location.filePath, langClientPromise);
                    const parentNode = getParentSTNodeFromRange(nodePosition, syntaxTree);
                    parentModel = parentNode;
                    setST(syntaxTree)
                }
                if (parentModel && STKindChecker.isClassDefinition(parentModel)) {
                    parentModel.members.forEach((resource: any) => {
                        if (STKindChecker.isResourceAccessorDefinition(resource)) {
                            if (resource.relativeResourcePath.length === 1 && resource.relativeResourcePath[0]?.value === path) {
                                setCurrentModel(resource);
                            }
                        }
                    });
                }
            })();
        }
    }, [showTooltip]);

    return (
        <>
            {location?.filePath && location?.startLine && location?.endLine &&
            <Tooltip
                open={showTooltip}
                onClose={() => setTooltipStatus(false)}
                title={
                    <div onClick={() => setTooltipStatus(false)}>
                        <Paper style={{ maxWidth: "100%" }}>
                            <MenuList style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                                <EditNode model={currentModel} functionType={functionType} location={location} st={currentST} />
                                <DesignNode model={currentModel} location={location} />
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
