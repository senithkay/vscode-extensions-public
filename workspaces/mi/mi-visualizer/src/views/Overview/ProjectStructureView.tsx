/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ProjectStructureEntry, ProjectStructureResponse, ProjectDirectoryMap, EsbDirectoryMap, EVENT_TYPE, MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { Codicon, ComponentCard } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import path from 'path';
import { VSCodeButton, VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from "@vscode/webview-ui-toolkit/react";

const allowedConfigs = ["apis", "sequences", "endpoints", "api", "inboundEndpoints", "messageProcessors", "proxyServices", "tasks", "templates", "messageStores", "localEntries", "registryResources"];

const IconWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const HorizontalCardContainer = styled.div`
    display: flex;
    flex-direction: column;
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

const Listing = styled.div({
    marginTop: "2em"
})

const ProjectStructureView = (props: { projectStructure: ProjectStructureResponse, workspaceDir: string }) => {
    const { projectStructure } = props;
    const { rpcClient } = useVisualizerContext();

    const handleClick = (directory: string, path?: string) => {
        if (directory.toLowerCase() === "api") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.ServiceDesigner, documentUri: path } });
        } else if (directory.toLowerCase() === "endpoint") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.EndPointForm, documentUri: path } });
        } else if (directory.toLowerCase() === "sequence") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.SequenceView, documentUri: path } });
        } else if (directory.toLowerCase() === "message_processor") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.MessageProcessorForm, documentUri: path } });
        } else if (directory.toLowerCase() === "proxy_service") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.ProxyView, documentUri: path } });
        } else if (directory.toLowerCase() === "task") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.TaskForm, documentUri: path } });
        } else if (directory.toLowerCase() === "template") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.TemplateForm, documentUri: path } });
        } else if (directory.toLowerCase() === "inbound_endpoint") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.InboundEPForm, documentUri: path } });
        } else if (directory.toLowerCase() === "message_store") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.MessageStoreForm, documentUri: path } });
        } else if (directory.toLowerCase() === "local_entry") {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.LocalEntryForm, documentUri: path } });
        }
    };

    const handlePlusClick = async (key: string) => {
        const dir = path.join(props.workspaceDir, 'src', 'main', 'wso2mi', 'artifacts', key);
        const entry = { info: { path: dir } };
        console.log(entry);
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
        } else if (key === 'tasks') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-task", entry] });
        } else if (key === 'templates') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-template", entry] });
        } else if (key === 'messageStores') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-message-store", entry] });
        } else if (key === 'localEntries') {
            await rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.add-local-entry", entry] });
        }
    };

    const renderEntries = (entries: ProjectStructureEntry[] | EsbDirectoryMap[]) => {
        return entries.map((entry, index) => (
            <VSCodeDataGridRow>
                <VSCodeDataGridCell grid-column={1}>
                    {entry.name}
                </VSCodeDataGridCell>
            </VSCodeDataGridRow>
        ));
    };

    const renderObject = (entry: ProjectDirectoryMap | ProjectStructureResponse["directoryMap"]) => {
        return Object.entries(entry).map(([key, value]) => {
            if (allowedConfigs.includes(key)) {
                if (Array.isArray(value) && value.length > 0) {
                    return (
                        <div key={key}>
                            <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                            <VSCodeDataGrid align="left">
                                {renderEntries(value)}
                            </VSCodeDataGrid>
                        </div>
                    )
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
        <Listing>
            {renderDirectoryMap()}
        </Listing>
    );
};

export default ProjectStructureView;
