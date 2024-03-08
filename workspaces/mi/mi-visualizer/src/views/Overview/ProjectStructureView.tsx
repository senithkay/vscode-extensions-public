/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ProjectStructureEntry, ProjectStructureResponse, ProjectDirectoryMap, EsbDirectoryMap, EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { ComponentCard } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import path from 'path';

const allowedConfigs = ["apis", "sequences", "endpoints", "api", "inboundEndpoints", "messageProcessors", "proxyServices"];

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

const ProjectStructureView = (props: { projectStructure: ProjectStructureResponse, workspaceDir: string }) => {
    const { projectStructure } = props;
    const { rpcClient } = useVisualizerContext();

    const handleClick = (directory: string, path?: string) => {
        if (directory.toLowerCase() === "api") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.ServiceDesigner, documentUri: path } });
        } else if (directory.toLowerCase() === "sequence") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Diagram, documentUri: path } });
        } else if (directory.toLowerCase() === "message_processor") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.MessageProcessorForm, documentUri: path } });
        } else if (directory.toLowerCase() === "proxy_service") {
            rpcClient.getMiDiagramRpcClient().openFile({ path: path });
        }
    };

    const handlePlusClick = async (key: string) => {
        const dir = path.join(props.workspaceDir, 'src', 'main', 'wso2mi', 'artifacts', key);
        const entry = { info: { path: dir } };
        if (key === 'apis') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-api", entry] });
        } else if (key === 'endpoints') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-endpoint", entry] });
        } else if (key === 'sequences') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-sequence", entry] });
        } else if (key === 'inboundEndpoints') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-inbound-endpoint", entry] });
        } else if (key === 'registry') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-registry-resource", entry] });
        } else if (key === 'messageProcessors') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-message-processor", entry] });
        } else if (key === 'proxyServices') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-proxy-service", entry] });
        }
    };

    const renderEntries = (entries: ProjectStructureEntry[] | EsbDirectoryMap[]) => {
        return entries.map((entry, index) => (
            <ComponentCard key={index} onClick={() => handleClick(entry.type, entry.path)} sx={{ height: 40, marginTop: 15, margin: 10 }}>
                <IconWrapper>
                    <TextContainer>{entry.name.replace(".xml", "")}</TextContainer>
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
