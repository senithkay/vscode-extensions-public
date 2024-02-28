/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ProjectStructureEntry, ProjectStructureResponse, ProjectDirectoryMap, EsbDirectoryMap } from '@wso2-enterprise/mi-core';
import { ComponentCard } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

const allowedConfigs = ["apis", "sequences", "endpoints", "api", "inboundEndpoints"];

const IconWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const HorizontalCardContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
`;

const TextContainer = styled.div`
    width: 100px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
`;

const Title = styled.div`
    text-align: left;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 400;
    margin-top: 5px;
    margin-bottom: 5px;
    font-size: 1.5em;
    line-height: normal;
`;

const ProjectStructureView = (props: { projectStructure: ProjectStructureResponse }) => {
    const { projectStructure } = props;
    const { rpcClient } = useVisualizerContext();

    const handleClick = (directory: string, path?: string) => {
        if (directory.toLowerCase() === "api") {
            rpcClient.getMiVisualizerRpcClient().openView({view: "ServiceDesigner", documentUri: path});
        } else if (directory.toLowerCase() === "sequence") {
            rpcClient.getMiVisualizerRpcClient().openView({view: "Diagram", documentUri: path});
        }
    };

    const handlePlusClick = async (key: string) => {
        if (key === 'apis') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({commands: ["project-explorer.add-api"]});
        } else if (key === 'endpoints') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({commands: ["project-explorer.add-endpoint"]});
        } else if (key === 'sequences') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({commands: ["project-explorer.add-sequence"]});
        } else if (key === 'inboundEndpoints') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({commands: ["project-explorer.add-inbound-endpoint"]});
        }
    };

    const renderEntries = (entries: ProjectStructureEntry[] | EsbDirectoryMap[]) => {
        return entries.map((entry, index) => (
            <ComponentCard key={index} onClick={() => handleClick(entry.type, entry.path)} sx={{ height: 40, marginTop: 15, margin: 10 }}>
                <IconWrapper>
                    <TextContainer>{entry.name.replace(".xml","")}</TextContainer>
                </IconWrapper>
            </ComponentCard>
        ));
    };

    const renderObject = (entry: ProjectDirectoryMap | ProjectStructureResponse["directoryMap"]) => {
        return Object.entries(entry).map(([key, value]) => {
            if (allowedConfigs.includes(key)) {
                if (Array.isArray(value)) {
                    return (
                        <div key={key}>
                            <Title>{key.toUpperCase()}</Title>
                            <HorizontalCardContainer>
                                {renderEntries(value)}
                                <ComponentCard key={0} onClick={() => handlePlusClick(key)} sx={{ height: 40, marginTop: 15, margin: 10 }}>
                                    <IconWrapper>+</IconWrapper>
                                </ComponentCard>
                            </HorizontalCardContainer>
                        </div>
                    )
                } else {
                    return (<div>{renderObject(value)}</div>)
                }
            }
        });
    }

    const renderDirectoryMap = () => {
        const { directoryMap } = projectStructure;
        const artifacts = (directoryMap as any)?.src?.main?.wso2mi?.artifacts;
        if (artifacts) return renderObject(artifacts);
    };

    return (
        <div>
            {renderDirectoryMap()}
        </div>
    );
};

export default ProjectStructureView;
