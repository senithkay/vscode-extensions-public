import React, { useState } from 'react';
import { ProjectStructureEntry, ProjectStructureResponse, ProjectDirectoryMap } from '@wso2-enterprise/mi-core';
import { ComponentCard, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

const allowedConfigs = ["esbConfigs", "endpoints", "api"];

const IconWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const HorizontalCardContainer = styled.div`
    display: flex;
    flex-direction: row;
`;

const ProjectStructureView = (props: { projectStructure: ProjectStructureResponse }) => {
    const { projectStructure } = props;
    const { rpcClient } = useVisualizerContext();

    const handleClick = (directory: string, path?: string) => {
        if (directory === "api") {
            rpcClient.getMiVisualizerRpcClient().openView({view: "ServiceDesigner", documentUri: path});
        }
    };

    const renderEntries = (entries: ProjectStructureEntry[]) => {
        return entries.map((entry, index) => (
            <ComponentCard key={index} onClick={() => handleClick(entry.type, entry.path)} sx={{ height: 40, marginTop: 15, margin: 10 }}>
                <IconWrapper>
                    <div>{entry.name}</div>
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
                            <Typography variant="h3">{key.toUpperCase()}</Typography>
                            <HorizontalCardContainer>
                                {renderEntries(value)}
                                <ComponentCard key={0} onClick={() => handleClick("NEW")} sx={{ height: 40, marginTop: 15, margin: 10 }}>
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
        return renderObject(directoryMap);
    };

    return (
        <div>
            {renderDirectoryMap()}
        </div>
    );
};

export default ProjectStructureView;
