/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ReactNode, useState } from "react";
import { Paths } from "../../Definitions/ServiceDefinitions";
import { Button, Codicon, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { getColorByMethod, getResourceID } from "../Utils/OpenAPIUtils";

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
    cursor: pointer;
`;

export function PathsComponent(props: OpenAPIDefinitionProps) {
    const { paths, selectedPathID, onAddPath, onPathChange } = props;
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const pathsArray = Object.keys(paths);
    const pathComponents: ReactNode[] = [];
    // Get PathItems from paths
    const pathItems = Object.values(paths);
    pathsArray.forEach((path, index) => {
        const pathItem = pathItems[index];
        // Get operations from pathItem
        const operations = Object.keys(pathItem);
        pathComponents.push((
            <>
                <Typography
                    variant="h4"
                    sx={{ margin: 2, paddingTop: 5, paddingBottom: 5 }}
                >
                    {path}
                </Typography>
                <Operations>
                    {operations.map((operation) => {
                        return (
                            <Operation
                                backgroundColor={getColorByMethod(operation.toUpperCase())}
                                selected={selectedPathID === getResourceID(path, operation)}
                                onClick={() => onPathChange && onPathChange(getResourceID(path, operation))}
                            >
                                <Typography variant="h5" sx={{ margin: 0, padding: 6 }}>{operation.toUpperCase()}</Typography>
                            </Operation>
                        );
                    })}
                </Operations>
            </>
        )
        );
    });

    const handleExpand = () => {
        setIsExpanded(!isExpanded);
        onPathChange && onPathChange("");
    };

    return (
        <PathsContainer>
            <PathsTitle>
                <Button sx={{marginTop: -2, marginLeft: -2}} appearance="icon">
                    <Codicon
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        iconSx={{ fontSize: 20 }}
                        sx={{height: 20, width: 20}}
                        onClick={handleExpand} 
                    />
                </Button>
                <Typography variant="h3" sx={{ margin: 2 }}>Paths</Typography>
                <Button sx={{marginTop: -2, marginLeft: 150}} appearance="icon" onClick={onAddPath}>
                    <Codicon
                        name={"add"}
                        iconSx={{ fontSize: 20 }}
                        sx={{height: 20, width: 20}}
                    />
                </Button>
            </PathsTitle>
            <PathItemContainer>
                {isExpanded && pathComponents}
            </PathItemContainer>
        </PathsContainer>
    )
}
