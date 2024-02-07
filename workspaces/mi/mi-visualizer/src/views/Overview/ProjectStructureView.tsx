import React, { useState } from 'react';
import { ProjectStructureEntry, ProjectStructureResponse, ProjectDirectoryMap, EsbDirectoryMap } from '@wso2-enterprise/mi-core';
import { ComponentCard, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

const allowedConfigs = ["sequences", "endpoints", "api"];

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

const VerticalCardContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const TextContainer = styled.div`
    width: 120px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
`;

const ProjectStructureView = (props: { projectStructure: ProjectStructureResponse }) => {
    const { projectStructure } = props;
    const { rpcClient } = useVisualizerContext();
    const { directoryMap } = projectStructure;

    const [esbConfig, setEsbConfig] = useState(directoryMap.esbConfigs[0]);

    const handleClick = (directory: string, path?: string) => {
        if (directory === "api") {
            rpcClient.getMiVisualizerRpcClient().openView({view: "ServiceDesigner", documentUri: path});
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
    
    const renderEsbs = (entries: EsbDirectoryMap[]) => {
        return entries.map((entry, index) => (
            <ComponentCard key={index} isSelected={entry === esbConfig} onClick={() => setEsbConfig(entry)} sx={{ height: 40, marginTop: 15, margin: 10 }}>
                <IconWrapper>
                    <TextContainer>{entry.name}</TextContainer>
                </IconWrapper>
            </ComponentCard>
        ));
    };

    const renderObject = (entry: ProjectDirectoryMap | ProjectStructureResponse["directoryMap"]) => {
        return Object.entries(entry).map(([key, value]) => {
            if (key === "esbConfigs") {
                if (Array.isArray(value)) {
                    return (
                        <div key={key}>
                            <Typography variant="h3">{key.toUpperCase()}</Typography>
                            <HorizontalCardContainer>
                                {renderEsbs(value as EsbDirectoryMap[])}
                                <ComponentCard key={0} onClick={() => handleClick("NEW")} sx={{ height: 40, marginTop: 15, margin: 10 }}>
                                    <IconWrapper>+</IconWrapper>
                                </ComponentCard>
                            </HorizontalCardContainer>
                            <VerticalCardContainer>
                                {renderObject(esbConfig.esbConfigs)}
                            </VerticalCardContainer>
                        </div>
                    )
                } else {
                    return (<div>{renderObject(value)}</div>)
                }
            } else if (allowedConfigs.includes(key)) {
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
