/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from 'react';
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client"
// import { WebViewAPI } from './WebViewAPI';
import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

import { ComponentListView, ComponentViewInfo, resetSelected, selected } from './ComponentListView';
import { TitleBar } from './components/TitleBar';
import styled from '@emotion/styled';
import { ResourcesList } from './ResourcesList';
import { ServiceDeclaration, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { Codicon, Typography } from '@wso2-enterprise/ui-toolkit';
import { MachineStateValue, VisualizerLocation } from '@wso2-enterprise/eggplant-core';
import { ProjectComponentProcessor } from './util/project-component-processor';

export interface SelectedComponent {
    fileName: string;
    serviceST: ServiceDeclaration
}

const OverviewHeader = styled.div`
    display: flex;
    justify-content: space-between;
`;

const ButtonWrap = styled.div`
    height: 40px;
    align-self: end;
`;

export function Overview() {
    const [currentComponents, setCurrentComponents] = useState<any>();
    const [selectedComponent, setSelectedComponent] = useState<SelectedComponent>();
    const [loading, setLoading] = useState(true);
    const { rpcClient } = useVisualizerContext();

    const [isPanelOpen, setPanelOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const openPanel = () => {
        setPanelOpen(!isPanelOpen);
    };

    const handleIsFetching = (value: boolean) => {
        setIsFetching(value);
    }

    const fetchData = async () => {
        try {
            const res = await rpcClient?.getLangServerRpcClient()?.getBallerinaProjectComponents(undefined);
            setCurrentComponents(res);
            // if (selected) {
            //     const projectComponentProcessor = new ProjectComponentProcessor(res);
            //     projectComponentProcessor.process();
            //     const updatedComps = projectComponentProcessor.getComponents();
            //     Object.keys(updatedComps)
            //         .filter((key) => updatedComps[key].length)
            //         .forEach((key, index) => {
            //             const filteredComponents = updatedComps[key];

            //             filteredComponents.forEach(async (comp: ComponentViewInfo, compIndex: number) => {
            //                 if (selected && selected.name == comp.name) {
            //                     const context: VisualizerLocation = {
            //                         documentUri: comp.filePath,
            //                         position: comp.position,
            //                         identifier: comp.name
            //                     }
            //                     await rpcClient.getVisualizerRpcClient().openView(context);
            //                 }
            //             });
            //         })
            // }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const LoaderContainer = styled.div({
        width: "100%",
        overflow: "hidden",
        height: "90vh",
        display: "grid"
    });

    const LoaderContent = styled.div({
        margin: "auto",
    });

    const Loader = () => {
        return (
            <LoaderContainer>
                <LoaderContent>
                    <VSCodeProgressRing style={{ height: 24, margin: 'auto' }} />
                    Fetching components...
                </LoaderContent>
            </LoaderContainer>
        )
    }

    if (loading) {
        // Render a loading indicator
        return <Loader />;
    }

    const handleClear = () => {
        setSelectedComponent(null);
        resetSelected();
    }

    const handleServiceView = () => {
        // Open service designer view
        const context: VisualizerLocation = {
            documentUri: selectedComponent.fileName,
            position: selectedComponent.serviceST.position,
            identifier: selectedComponent.serviceST.absoluteResourcePath.reduce((result, obj) => result + obj.value, "")
        }
        rpcClient.getVisualizerRpcClient().openView(context);
    }

    return (
        <>
            <TitleBar clearSelection={handleClear} />
            {currentComponents ? (
                selectedComponent ? (
                    <>
                        <OverviewHeader>
                            <Typography sx={{ padding: 'unset' }} variant="h3">{selectedComponent.serviceST.absoluteResourcePath.map(res => res.value)}</Typography>
                            <Typography sx={{ padding: 'unset' }} variant="h4">Listening on port {getPortNumber(selectedComponent.serviceST)}</Typography>
                            <ButtonWrap>
                                <VSCodeButton appearance="icon" title="Show Designer" onClick={handleServiceView}>
                                    <Codicon name="preview" />
                                </VSCodeButton>
                            </ButtonWrap>
                        </OverviewHeader>
                        <ResourcesList component={selectedComponent} />
                    </>
                ) : (
                    <ComponentListView handleIsFetching={handleIsFetching} currentComponents={currentComponents} setSelectedComponent={setSelectedComponent} />
                )
            ) : (
                <div>No data available</div>
            )}
            {isFetching &&
                <LoaderContent>
                    <VSCodeProgressRing style={{ height: 24, margin: 'auto' }} />
                </LoaderContent>
            }
        </>
    );
}

function getPortNumber(model: ServiceDeclaration) {
    if (STKindChecker.isExplicitNewExpression(model.expressions[0])) {
        if (
            STKindChecker.isQualifiedNameReference(
                model.expressions[0].typeDescriptor
            )
        ) {
            // serviceType = model.expressions[0].typeDescriptor.modulePrefix.value.toUpperCase();
            const listeningOnText = model.expressions[0].source;
            // Define a regular expression pattern to match the port number
            const pattern: RegExp = /\b(\d{4})\b/;

            // Use RegExp.exec to find the match in the input string
            const match: RegExpExecArray | null = pattern.exec(listeningOnText);

            // Check if a match is found and extract the port number
            if (match && match[1]) {
                return match[1];
            }
        }
    }
}
