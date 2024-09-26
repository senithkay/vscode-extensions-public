/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Paths } from "../../Definitions/ServiceDefinitions";
import { Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { getColorByMethod, getResourceID } from "../Utils/OpenAPIUtils";
import { TreeView } from "../Treeview/TreeView";
import { TreeViewItem } from "../Treeview/TreeViewItem";

interface OpenAPIDefinitionProps {
    paths: Paths;
    selectedPathID?: string;
    onAddPath: () => void;
    onPathChange?: (pathID: string) => void;
}

const PathsContainer = styled.div`
    /* padding: 0px 0px 0px 5px; */
`;

const PathItemContainer = styled.div`
    padding-left: 30px;
`;

const PathsTitle = styled.div`
    display: flex;
    flex-direction: row;
    padding: 5px 5px 0 5px;
`;

const Operations = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
    color: white;
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

export function PathsComponent(props: OpenAPIDefinitionProps) {
    const { paths, selectedPathID, onAddPath, onPathChange } = props;
    const pathsArray = Object.keys(paths);
    // Get PathItems from paths
    const pathItems = Object.values(paths);
    return (
        <PathsContainer>
            <TreeView rootTreeView id="Paths" content={<Typography sx={{ margin: "0 0 0 2px" }} variant="h3">Paths</Typography>} selectedId={selectedPathID} onSelect={onPathChange}>
                {pathsArray.map((path, index) => {
                    const pathItem = pathItems[index];
                    const operations = Object.keys(pathItem);
                    return (
                        <TreeView id={path} content={<Typography sx={{ margin: "0 0 0 2px"  }} variant="h3">{path}</Typography>} selectedId={selectedPathID} onSelect={onPathChange}>
                            {operations.map((operation) => {
                                return (
                                    <TreeViewItem id={getResourceID(path, operation)}>
                                        <Operation
                                            backgroundColor={getColorByMethod(operation.toUpperCase())}
                                            selected={selectedPathID === getResourceID(path, operation)}
                                            onClick={() => onPathChange && onPathChange(getResourceID(path, operation))}
                                        >
                                            <Typography variant="h5" sx={{ margin: 0, padding: 6 }}>{operation.toUpperCase()}</Typography>
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
