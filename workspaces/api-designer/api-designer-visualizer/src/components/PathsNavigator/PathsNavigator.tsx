/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Paths } from "../../Definitions/ServiceDefinitions";
import { Button, Codicon, ContextMenu, TextField, Tooltip, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { getBackgroundColorByMethod, getColorByMethod, getResourceID } from "../Utils/OpenAPIUtils";
import { TreeView } from "../Treeview/TreeView";
import { TreeViewItem } from "../Treeview/TreeViewItem";
import { useEffect, useRef, useState } from "react";
import { useVisualizerContext } from "@wso2-enterprise/api-designer-rpc-client";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";

interface OpenAPIDefinitionProps {
    paths: Paths;
    selectedPathID?: string;
    onAddPath: () => void;
    onAddResources?: (path: string, methods: string[]) => void;
    onDeletePath?: (resourceID: string) => void;
    onPathChange?: (pathID: string) => void;
    onPathRename?: (path: string, index: number) => void;
}

const PathsContainer = styled.div`
    /* padding: 0px 0px 0px 5px; */
`;

interface OperationProps {
    foreGroundColor: string;
    hoverForeGroundColor?: string;
    selected: boolean;
}

const Operation = styled.div<OperationProps>`
    width: fit-content;
    color: ${(props: OperationProps) => props.foreGroundColor};
    cursor: pointer;
    &:hover { // Added hover style
        color: ${(props: OperationProps) => props.hoverForeGroundColor || props.foreGroundColor};
    }
`;

interface OverviewTitleProps {
    selected: boolean;
}
const OverviewTitle = styled.div<OverviewTitleProps>`
    display: flex;
    flex-direction: row;
    gap: 6px;
    padding: 0px 0;
    cursor: pointer;
    background-color: ${(props: OverviewTitleProps) => props.selected ? "var(--vscode-editorHoverWidget-background)" : "none"};
    &:hover {
        background-color: var(--vscode-editorHoverWidget-background);
    }
`;

const LeftPathContainer = styled.div`
    /* width: 90%; */
    display: flex;
    flex-direction: row;
    flex: 1;
    align-items: center;
`;
const RightPathContainerButtons = styled.div`
    display: flex;
    gap: 1px;
    opacity: 0;
    align-items: center;
    transition: opacity 0.2s ease;
`
const PathContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1;
    align-items: center;

    &:hover div.buttons-container {
        opacity: 1;
    }
`;


export const menuVerticalIconWrapper = {
    ":hover": {
        backgroundColor: "var(--vscode-inputOption-hoverBackground)",
    },
    borderRadius: "3px",
    width: "10px",
    height: "15px",
    marginLeft: "1px",
    padding: "2px"
}

export const PathItemWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 6px;
    width: 100%;
    padding: 0px 0;
    cursor: pointer;
`;
export const PathSummary = styled.div`
    display: flex;
    width: 100%;
    padding-top: 4px;
    overflow: hidden;
`;

const AddNewLink = styled(VSCodeLink)`
    padding: 5px 20px;
    color:  var(--vscode-editor-foreground);
`;

const APIResources = [
    "get","post","put","delete","patch","head","options","trace"
];

export function PathsNavigator(props: OpenAPIDefinitionProps) {
    const { paths, selectedPathID, onAddPath, onAddResources, onDeletePath, onPathChange, onPathRename } = props;
    const { rpcClient } = useVisualizerContext();
    const pathContinerRef = useRef<HTMLDivElement>(null);
    const [currentDivWidth, setCurrentDivWidth] = useState<number>(pathContinerRef.current?.clientWidth || 0);
    const [, setSelPathID] = useState<string | undefined>(selectedPathID);
    const [pathEditIndex, setPathEditIndex] = useState<number>(-1);
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
    const handleDeletePath = (evt: React.MouseEvent, path: string) => {
        evt.stopPropagation();
        if(onDeletePath){
            rpcClient.showConfirmMessage({message:`Are you sure you want to delete the path '${path}'?`,buttonText:"Delete"}).then(res=>{
                if(res){
                    onDeletePath(path)
                }
            })
        }       
    }

    const modifyPathClick = (evt: React.MouseEvent, index: number, path: string, currentOperations: string[]) => {
        evt.stopPropagation();
        rpcClient.selectQuickPickItem({title: `Select an option`,items:[
            { label: "Edit Route path",detail: `Edit the route '${path}'` },
            { label: "Select Methods", detail: `Select the methods belonging to the path '${path}'` }
        ]}).then(res=>{
            if(res.label === "Edit Route path"){
                rpcClient.showInputBox({title:"Edit Route path",value: path}).then(newPath=>{
                    if(onPathRename && newPath){
                        onPathRename(newPath, index)
                    }
                })
            }else if(res.label === "Select Methods"){
                rpcClient.selectQuickPickItems({title:"Select the methods of the path",items:APIResources.map(method=>({
                    label:method,
                    picked: currentOperations.includes(method)
                }))}).then(methodSelection=>{
                    if(!methodSelection || methodSelection.length<1){
                        rpcClient.showErrorNotification("Need to select at least one method for the path")
                    }else{
                        onAddResources(path, methodSelection.map(item=>item.label))
                    }
                })
            }
        })
    }

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

    return (
        <PathsContainer ref={pathContinerRef}>
            <OverviewTitle selected={selectedPathID === undefined} onClick={handleOverviewClick}>
                <Codicon sx={{marginTop: -1}} name="globe" />
                <Typography variant="h4" sx={{ margin: 0, fontWeight: 300 }}>Overview</Typography>
            </OverviewTitle>
            <TreeView 
                rootTreeView
                id="Paths"
                content={
                    <PathContainer>
                        <LeftPathContainer>
                            <Typography sx={{ margin: "0 0 0 2px", fontWeight: 300 }} variant="h4">Paths</Typography>
                        </LeftPathContainer>
                    </PathContainer>
                }
                selectedId={selectedPathID}
                onSelect={onPathChange}
            >
                {pathsArray.map((path, index) => {
                    const pathItem = pathItems[index];
                    const operations = Object.keys(pathItem);
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
                                                margin: "0 0 0 2px",
                                                fontWeight: 300
                                            }} variant="h4">
                                            {path}
                                        </Typography>
                                    </LeftPathContainer>
                                    {pathEditIndex === -1 && (
                                        <RightPathContainerButtons className="buttons-container">
                                            <Button tooltip="Modify Path" appearance="icon" onClick={(e)=>modifyPathClick(e, index, path, operations)}><Codicon name="gear"/></Button>
                                            <Button tooltip="Delete Path" appearance="icon" onClick={(e)=>handleDeletePath(e, path)}><Codicon name="trash"/></Button>
                                        </RightPathContainerButtons>
                                    )}
                                </PathContainer>
                            }
                            selectedId={selectedPathID}
                            onSelect={onPathChange}
                        >
                            {operations.map((operation) => {
                                return (
                                    <TreeViewItem id={getResourceID(path, operation)}>
                                        <PathItemWrapper>
                                            <Tooltip content={pathItem[operation]?.summary}>
                                                <Operation
                                                    foreGroundColor={getColorByMethod(operation.toUpperCase())}
                                                    hoverForeGroundColor={getBackgroundColorByMethod(operation.toUpperCase())}
                                                    selected={selectedPathID === getResourceID(path, operation)}
                                                    onClick={() => onPathChange && onPathChange(selectedPathID)}
                                                >
                                                    <Typography variant="h5" sx={{ margin: 0, padding: 4, display: "flex", justifyContent: "flex-start", width: 45, fontWeight: 300 }}>{operation.toUpperCase()}</Typography>
                                                </Operation>
                                            </Tooltip>
                                        </PathItemWrapper>
                                    </TreeViewItem>
                                );
                            })}
                        </TreeView>
                    );
                })}
                <AddNewLink onClick={handleAddPath}>Add Path</AddNewLink>
            </TreeView>
        </PathsContainer>
    )
}
