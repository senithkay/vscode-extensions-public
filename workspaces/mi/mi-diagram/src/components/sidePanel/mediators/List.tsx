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
import { ERROR_MESSAGES } from '../../../resources/constants';
import { MediatorPage } from './Mediator';
import { ModuleSuggestions } from './ModuleSuggestions';
import { Modules } from '../modules/ModulesList';
import AddConnector from '../Pages/AddConnector';

interface MediatorProps {
    nodePosition: any;
    trailingSpace: string;
    documentUri: string;
    searchValue?: string;
}
export function Mediators(props: MediatorProps) {
    const sidePanelContext = React.useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const [allMediators, setAllMediators] = React.useState<GetMediatorsResponse>();
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [connectorIcons, setConnectorIcons] = React.useState<any[]>([]);
    const [localConnectors, setLocalConnectors] = React.useState<any>();

    useEffect(() => {
        const fetchConnectorIcons = async () => {
            try {
                const connectorDataResponse = await rpcClient.getMiDiagramRpcClient().getStoreConnectorJSON();
                setConnectorIcons(connectorDataResponse.outboundConnectors);
            } catch (error) {
                console.error("Failed to fetch connector data:", error);
            }
        };

        fetchMediators();
        fetchLocalConnectorData();
        fetchConnectorIcons();
    }, [props.documentUri, props.nodePosition, rpcClient]);

    const fetchMediators = async () => {
        try {
            const mediatorsList = await rpcClient.getMiDiagramRpcClient().getMediators({
                documentUri: props.documentUri,
                position: props.nodePosition.start,
            });
            setAllMediators(mediatorsList);
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

    const getMediator = async (mediator: Mediator, isMostPopular: boolean) => {
        const mediatorDetails = await rpcClient.getMiDiagramRpcClient().getMediator({
            mediatorType: mediator.tag,
        });

        if (mediator.tag.includes('.')) {
            const connecterForm = <AddConnector formData={mediatorDetails}
                nodePosition={props.nodePosition}
                documentUri={props.documentUri}
                connectorName={mediator.tag[0]}
                operationName={mediator.operationName} />;

            sidepanelAddPage(sidePanelContext, connecterForm, `Add ${mediator.operationName} operation`);
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

    function getConnectorIconUrl(connectorName: string) {
        const connector = connectorIcons.find(c => c.name === connectorName);
        return connector?.icon_url ?
            <img src={connector.icon_url} alt="Icon" onError={() => <Icon name="connector" sx={{ color: "#D32F2F" }} />} />
            : <Icon name="connector" sx={{ color: "#D32F2F" }} />;
    }

    const searchForm = (value: string, search?: boolean) => {
        const normalizeString = (str: string) => str.toLowerCase().replace(/\s+/g, '');
        const searchValue = normalizeString(value || '');

        return Object.keys(allMediators).reduce((acc: any, key: string) => {
            const filtered = (allMediators as any)[key].filter((mediator: { title: string; operationName: string }) => {
                if (search) {
                    if (key === "most popular") return null;
                    return normalizeString(mediator.operationName).includes(searchValue);
                } else {
                    return normalizeString(mediator.operationName) === searchValue;
                }
            });

            if (filtered.length > 0) {
                acc[key] = filtered;
            }
            return acc;
        }, {});
    };

    const reloadPalette = () => {
        fetchMediators();
        fetchLocalConnectorData();
    };

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
            <>
                {Object.entries(mediators).map(([key, values]) => (
                    <div key={key} style={{ marginTop: '15px' }}>
                        <ButtonGroup key={key} title={FirstCharToUpperCase(key)} isCollapsed={false}>
                            {values.map((mediator: Mediator) => (
                                <GridButton
                                    title={mediator.title}
                                    description={mediator.description}
                                    icon={
                                        mediator.iconPath ? getConnectorIconUrl(key) : getMediatorIconsFromFont(mediator.tag, key === "most popular")
                                    }
                                    onClick={() => getMediator(mediator, key === "most popular")}
                                />
                            ))}
                        </ButtonGroup >
                    </div>
                ))
                }
            </>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', alignItems: 'center' }}>
                            <Typography variant="h3" sx={{ margin: '0px' }}>Available Modules</Typography>
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
