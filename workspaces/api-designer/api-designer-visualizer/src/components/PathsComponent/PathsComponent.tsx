/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Paths } from "../../Definitions/ServiceDefinitions";
import { Codicon, ContextMenu, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { getColorByMethod, getResourceID } from "../Utils/OpenAPIUtils";
import { TreeView } from "../Treeview/TreeView";
import { TreeViewItem } from "../Treeview/TreeViewItem";
import { useEffect, useRef, useState } from "react";

interface OpenAPIDefinitionProps {
    paths: Paths;
    selectedPathID?: string;
    onAddPath: () => void;
    hideOverview?: boolean;
    onAddResource?: (path: string, method: string) => void;
    onDeletePath?: (resourceID: string) => void;
    onPathChange?: (pathID: string) => void;
}

const PathsContainer = styled.div`
    /* padding: 0px 0px 0px 5px; */
`;

interface OperationProps {
    backgroundColor: string;
    selected: boolean;
}

const Operation = styled.div<OperationProps>`
    background-color: ${(props: OperationProps) => props.backgroundColor};
    border: ${(props: OperationProps) => props.selected ? "2px solid var(--vscode-inputOption-activeForeground)" : "2px solid transparent"};
    border-radius: 4px;
    margin-bottom: 3px;
    width: fit-content;
    color: white;
    cursor: pointer;
`;

const OverviewTitle = styled.div`
    display: flex;
    flex-direction: row;
    gap: 6px;
    padding: 2px 0;
    cursor: pointer;
    &:hover {
        background-color: var(--vscode-editorHoverWidget-background);
    }
`;

const LeftPathContainer = styled.div`
    /* width: 90%; */
    display: flex;
    flex-direction: row;
    flex-grow: 1;
`;
const RightPathContainer = styled.div`
    width: 10px;
`;
const PathContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
`;
const PathWrapper = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const contextMenuSx = {
    transform: "rotate(90deg)",
    fontSize: "15px",
    marginLeft: "-2px"
}

export const subMenuverticalIconWrapper = {
    ":hover": {
        backgroundColor: "var(--vscode-inputOption-hoverBackground)",
    },
    borderRadius: "3px",
    width: "10px",
    height: "15px"
}

export const menuVerticalIconWrapper = {
    ":hover": {
        backgroundColor: "var(--vscode-inputOption-hoverBackground)",
    },
    borderRadius: "3px",
    width: "10px",
    height: "15px",
    marginLeft: "1px"
}

const APIResources = [
    "get","post","put","delete","patch","head","options","trace"
];

export function PathsComponent(props: OpenAPIDefinitionProps) {
    const { paths, hideOverview, selectedPathID, onAddPath, onAddResource, onDeletePath, onPathChange } = props;
    const pathContinerRef = useRef<HTMLDivElement>(null);
    const [currentDivWidth, setCurrentDivWidth] = useState<number>(pathContinerRef.current?.clientWidth || 0);
    const [, setSelPathID] = useState<string | undefined>(selectedPathID);
    const pathsArray = paths ? Object.keys(paths) : [];
    // Get PathItems from paths
    const pathItems = paths ? Object.values(paths) : [];
    const handleOverviewClick = () => {
        onPathChange && onPathChange(undefined);
    };
    const handleAddPath = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        onAddPath && onAddPath();
    }
    const handleAddResource = (evt: React.MouseEvent, path: string, method: string) => {
        evt.stopPropagation();
        onAddResource && onAddResource(path, method);
    }
    const handleDeletePath = (evt: React.MouseEvent, path: string) => {
        evt.stopPropagation();
        onDeletePath && onDeletePath(path);
    }

    const menuItems = [
        { id: "add", label: "Add Path", onClick: handleAddPath }
    ];

    useEffect(() => {
        if (!pathContinerRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentBoxSize) {
                    const width = entry.contentBoxSize[0].inlineSize;
                    setCurrentDivWidth(width);
                } else {
                    // Fallback for browsers that don't support contentBoxSize
                    const width = entry.contentRect.width;
                    setCurrentDivWidth(width);
                }
            }
        });

        resizeObserver.observe(pathContinerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        setSelPathID(selectedPathID);
    }, [selectedPathID]);

    // console.log("PathsComponent pathsArray: ", pathsArray);
    // console.log("PathsComponent pathItems: ", pathItems);
    // console.log("PathsComponent selectedPathID: ", selectedPathID);

    return (
        <PathsContainer ref={pathContinerRef}>
            {!hideOverview && (
                <OverviewTitle onClick={handleOverviewClick}>
                    <Codicon name="globe" />
                    <Typography variant="h3" sx={{ margin: 0 }}>Overview</Typography>
                </OverviewTitle>
            )}
            <TreeView 
                rootTreeView
                id="Paths"
                content={
                    <PathContainer>
                        <LeftPathContainer>
                            <Typography sx={{ margin: "0 0 0 2px" }} variant="h3">Paths</Typography>
                        </LeftPathContainer>
                        <RightPathContainer>
                            <ContextMenu iconSx={contextMenuSx} sx={menuVerticalIconWrapper} menuItems={menuItems} />
                        </RightPathContainer>
                    </PathContainer>
                }
                selectedId={selectedPathID}
                onSelect={onPathChange}
            >
                {pathsArray.map((path, index) => {
                    const pathItem = pathItems[index];
                    const operations = Object.keys(pathItem);
                    const newOperations = APIResources.filter((operation) => !operations.includes(operation));
                    const subMenuItems = newOperations.map((operation) => {
                        return {
                            id: operation,
                            label: operation.toUpperCase(),
                            onClick: (evt?: React.MouseEvent<HTMLElement, MouseEvent>) => { handleAddResource(evt, path, operation) }
                        }
                    });
                    const resourceMenuItems = [
                        { 
                            id: "add", 
                            label: "Add Opreration",
                            onClick: () => {},
                            sunMenuItems: subMenuItems
                        },
                        { id: "delete path", label: "Delete Path",
                             onClick: (evt?: React.MouseEvent<HTMLElement, MouseEvent>) => handleDeletePath(evt, path) 
                        }
                    ];
                    return (
                        <TreeView
                            id={path} 
                            content={
                                <PathContainer>
                                    <LeftPathContainer>
                                        <Typography 
                                            sx={{
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                width: (currentDivWidth - 50),
                                                margin: "0 0 0 2px" 
                                            }} variant="h3">
                                            {path}
                                        </Typography>
                                    </LeftPathContainer>
                                    <RightPathContainer>
                                        <ContextMenu
                                            iconSx={contextMenuSx}
                                            sx={subMenuverticalIconWrapper}
                                            menuItems={resourceMenuItems}
                                        />
                                    </RightPathContainer>
                                </PathContainer>
                            }
                            selectedId={selectedPathID}
                            onSelect={onPathChange}
                        >
                            {operations.map((operation) => {
                                return (
                                    <TreeViewItem id={getResourceID(path, operation)}>
                                        <Operation
                                            backgroundColor={getColorByMethod(operation.toUpperCase())}
                                            selected={selectedPathID === getResourceID(path, operation)}
                                            onClick={() => onPathChange && onPathChange(selectedPathID)}
                                        >
                                            <Typography variant="h4" sx={{ margin: 0, padding: 6, display: "flex", justifyContent: "center", minWidth: 60 }}>{operation}</Typography>
                                        </Operation>
                                    </TreeViewItem>
                                );
                            })}
                        </TreeView>
                    );
                })}
            </TreeView>
        </PathsContainer>
    )
}
