/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Codicon, ErrorBanner, Icon, LinkButton, ProgressRing, Typography } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect } from 'react';
import SidePanelContext from '../SidePanelContexProvider';
import { getMediatorIconsFromFont } from '../../../resources/icons/mediatorIcons/icons';
import { FirstCharToUpperCase } from '../../../utils/commons';
import { sidepanelAddPage } from '..';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { GetMediatorsResponse, Mediator } from '@wso2-enterprise/mi-core';
import { ButtonGroup, GridButton } from '../commons/ButtonGroup';
import { DEFAULT_ICON, ERROR_MESSAGES } from '../../../resources/constants';
import { MediatorPage } from './Mediator';
import { ModuleSuggestions } from './ModuleSuggestions';
import { Modules } from '../modules/ModulesList';
import AddConnector from '../Pages/AddConnector';

interface MediatorProps {
    nodePosition: any;
    trailingSpace: string;
    documentUri: string;
    searchValue?: string;
    clearSearch?: () => void;
}

const INBUILT_MODULES = ["favourites", "generic", "flow control", "database", "extension", "security", "transformation", "other"];
export function Mediators(props: MediatorProps) {
    const sidePanelContext = React.useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const [allMediators, setAllMediators] = React.useState<GetMediatorsResponse>();
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [localConnectors, setLocalConnectors] = React.useState<any>();
    const [expandedModules, setExpandedModules] = React.useState<any[]>([]);
    const mediatorListRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMediators();
        fetchLocalConnectorData();
    }, [props.documentUri, props.nodePosition, rpcClient]);

    // Scroll to newly added connector
    React.useEffect(() => {
        if (expandedModules.length === 1 && mediatorListRef.current) {
            const targetKey = expandedModules[0];
            const element = mediatorListRef.current.querySelector(`[data-key="${targetKey}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        }
    }, [expandedModules]);

    const fetchMediators = async () => {
        try {
            const mediatorsList = await rpcClient.getMiDiagramRpcClient().getMediators({
                documentUri: props.documentUri,
                position: props.nodePosition.start,
            });

            // Populate connector icons
            const mediatorsWithConnectorIcons: GetMediatorsResponse = {};
            await Promise.all(Object.entries(mediatorsList).map(async ([key, values]) => {
                const isConnector = !INBUILT_MODULES.includes(key);

                if (isConnector) {
                    const iconPath = values.items[0].iconPath;
                    const iconPathUri = await rpcClient.getMiDiagramRpcClient().getIconPathUri({ path: iconPath, name: "icon-small" });

                    values.items.forEach((value) => {
                        value.iconPath = iconPathUri.uri;
                    });
                }

                if (key !== "other") {
                    mediatorsWithConnectorIcons[key] = values;
                }
            }));

            // Add the other mediators at the end
            if (mediatorsList["other"]) {
                mediatorsWithConnectorIcons["other"] = mediatorsList["other"];
            }

            setAllMediators(mediatorsWithConnectorIcons);

            if (expandedModules.length === 0) {
                initializeExpandedModules(mediatorsList);
            }
        } catch (error) {
            console.error('Error fetching mediators:', error);
            setAllMediators(undefined);
        }
        setIsLoading(false);
    };

    const fetchLocalConnectorData = async () => {
        const connectorData = await rpcClient.getMiDiagramRpcClient().getAvailableConnectors({ documentUri: props.documentUri, connectorName: "" });
        if (connectorData) {
            setLocalConnectors(connectorData.connectors);
        } else {
            setLocalConnectors([]);
        }
    };

    const getMediator = async (mediator: Mediator, isMostPopular: boolean, icon?: React.ReactNode) => {
        const mediatorDetails = await rpcClient.getMiDiagramRpcClient().getMediator({
            mediatorType: mediator.tag,
        });

        if (mediator.tag.includes('.')) {
            const connecterForm = <AddConnector formData={mediatorDetails}
                nodePosition={props.nodePosition}
                documentUri={props.documentUri}
                connectorName={mediator.tag[0]}
                operationName={mediator.operationName} />;

            sidepanelAddPage(sidePanelContext, connecterForm, `Add ${FirstCharToUpperCase(mediator.operationName)} Operation`,
                <div style={{ height: 30, width: 30, fontSize: 30 }}>{icon}</div>);
        } else {
            const form =
                <div style={{ padding: '20px' }}>
                    <MediatorPage
                        mediatorData={mediatorDetails}
                        mediatorType={mediator.tag}
                        isUpdate={false}
                        documentUri={props.documentUri}
                        nodeRange={props.nodePosition}
                        showMediaotrPanel={true}
                    />
                </div>;
            sidepanelAddPage(sidePanelContext, form, `Add ${mediatorDetails.title}`, getMediatorIconsFromFont(mediator.tag, isMostPopular));
        }
    }

    const initializeExpandedModules = (mediatorList: GetMediatorsResponse) => {
        if (mediatorList) {
            const modulesToExpand = Object.keys(mediatorList).filter(key => key !== 'other');
            setExpandedModules(modulesToExpand);
        }
    };

    const searchForm = (value: string, search?: boolean) => {
        const normalizeString = (str: string) => str.toLowerCase().replace(/\s+/g, '');
        const searchValue = normalizeString(value || '');

        return Object.keys(allMediators).reduce((acc: any, key: string) => {
            const filtered = (allMediators as any)[key].items.filter((mediator: { title: string; operationName: string }) => {
                if (search) {
                    return normalizeString(mediator.operationName).includes(searchValue) || normalizeString(mediator.title).includes(searchValue);
                } else {
                    return normalizeString(mediator.operationName) === searchValue;
                }
            });

            if (filtered.length > 0) {
                acc[key] = { "items": filtered };
            }
            return acc;
        }, {});
    };

    const reloadPalette = async (connectorName: string) => {
        props.clearSearch();
        await fetchMediators();
        fetchLocalConnectorData();
        setExpandedModules([connectorName]);
    };

    const deleteConnector = async (artifaceId: string, version: string) => {
        const projectDetails = await rpcClient.getMiVisualizerRpcClient().getProjectDetails();
        const connectorDependencies = projectDetails.dependencies.connectorDependencies;

        for (const d of connectorDependencies) {
            if (d.artifact === artifaceId && d.version === version) {
                await rpcClient.getMiVisualizerRpcClient().updatePomValues({
                    pomValues: [{ range: d.range, value: '' }]
                });
                break;
            }
        }

        const response = await rpcClient.getMiVisualizerRpcClient().updateConnectorDependencies();

        if (response === "Success") {
            props.clearSearch();
            await fetchMediators();
            fetchLocalConnectorData();
        }
    }

    const addModule = () => {
        const modulesList = <Modules
            nodePosition={props.nodePosition}
            trailingSpace={props.trailingSpace}
            documentUri={props.documentUri}
            localConnectors={localConnectors}
            reloadMediatorPalette={reloadPalette} />;
        const icon = <Codicon name="library" iconSx={{ fontSize: 20, color: 'var(--vscode-textLink-foreground)' }} />

        sidepanelAddPage(sidePanelContext, modulesList, 'Add Modules', icon);
    }

    const MediatorList = () => {
        let mediators: GetMediatorsResponse;
        if (props.searchValue) {
            mediators = searchForm(props.searchValue, true);
        } else {
            mediators = allMediators;
        }

        if (!mediators) {
            return <ErrorBanner errorMsg={ERROR_MESSAGES.ERROR_LOADING_MEDIATORS} />;
        }

        return Object.keys(mediators).length === 0 ? <h3 style={{ textAlign: "center" }}>No mediators found</h3> :
            <div ref={mediatorListRef}>
                {Object.entries(mediators).map(([key, values]) => (
                    <div key={key} style={{ marginTop: '15px' }} data-key={key}>
                        <ButtonGroup
                            key={key}
                            title={FirstCharToUpperCase(key)}
                            isCollapsed={!expandedModules.includes(key)}
                            connectorDetails={values["isConnector"] ? { artifactId: values["artifactId"], version: values["version"] } : undefined}
                            onDelete={deleteConnector}>
                            {values["items"].map((mediator: Mediator) => (
                                <GridButton
                                    key={mediator.title}
                                    title={mediator.title}
                                    description={mediator.description}
                                    icon={
                                        mediator.iconPath ?
                                            <img src={mediator.iconPath}
                                                alt="Icon"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = DEFAULT_ICON
                                                }} /> :
                                            getMediatorIconsFromFont(mediator.tag, key === "most popular")
                                    }
                                    onClick={() => getMediator(mediator, key === "most popular",
                                        <img src={mediator.iconPath}
                                            alt="Icon"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = DEFAULT_ICON
                                            }} />
                                    )}
                                />
                            ))}
                        </ButtonGroup >
                    </div>
                ))}
            </div>
    }

    return (
        <div>
            {
                isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px' }}>
                        <ProgressRing />
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'end', marginTop: '10px', alignItems: 'center' }}>
                            <LinkButton onClick={() => addModule()}>
                                <Codicon name="plus" />Add Module
                            </LinkButton>
                        </div>
                        <MediatorList />
                        <ModuleSuggestions
                            documentUri={props.documentUri}
                            searchValue={props.searchValue}
                            localConnectors={localConnectors}
                            reloadMediatorPalette={reloadPalette} />
                    </>
                )
            }
        </div >
    );
}
