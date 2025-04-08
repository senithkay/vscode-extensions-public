/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Codicon, ErrorBanner, LinkButton, ProgressRing, Tooltip } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect } from 'react';
import SidePanelContext from '../SidePanelContexProvider';
import { getMediatorIconsFromFont } from '../../../resources/icons/mediatorIcons/icons';
import { FirstCharToUpperCase } from '../../../utils/commons';
import { sidepanelAddPage } from '..';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { GetMediatorsResponse, Mediator, MediatorCategory } from '@wso2-enterprise/mi-core';
import { ButtonGrid, ButtonGroup, GridButton } from '../commons/ButtonGroup';
import { Colors, DEFAULT_ICON, ERROR_MESSAGES } from '../../../resources/constants';
import { MediatorPage } from './Mediator';
import { ModuleSuggestions } from './ModuleSuggestions';
import { Modules } from '../modules/ModulesList';
import { RemoveConnectorPage } from './RemoveConnectorPage';
import { DiagramService } from '@wso2-enterprise/mi-syntax-tree/lib/src';

interface MediatorProps {
    nodePosition: any;
    trailingSpace: string;
    documentUri: string;
    searchValue?: string;
    clearSearch?: () => void;
    artifactModel: DiagramService;
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
                    if (values.isSupportCategories) {
                        const items = values.items as unknown as MediatorCategory;

                        Object.entries(items).forEach(([key, group]) => {
                            const iconPath = (group[0] as Mediator).iconPath; // Get the iconPath from the first item
                            rpcClient.getMiDiagramRpcClient().getIconPathUri({ path: iconPath, name: "icon-small" }).then(iconPathUri => {
                                group.forEach((mediator: Mediator) => {
                                    mediator.iconPath = iconPathUri.uri; // Set the iconPath for each mediator
                                });
                            });
                        });

                    } else {
                        const iconPath = (values.items[0] as Mediator).iconPath;
                        const iconPathUri = await rpcClient.getMiDiagramRpcClient().getIconPathUri({ path: iconPath, name: "icon-small" });

                        values.items.forEach((value) => {
                            value.iconPath = iconPathUri.uri;
                        });
                    }
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
            documentUri: props.documentUri,
            range: props.nodePosition
        });

        let title, page;
        if (mediator.tag.includes('.')) {
            title = mediator.operationName;

            const connectotData = {
                form: mediatorDetails,
                name: mediator.tag.split('.')[0],
                operationName: mediator.operationName
            }

            page =
                <div style={{ padding: '20px' }}>
                    <MediatorPage
                        connectorData={connectotData}
                        mediatorType={mediator.tag}
                        isUpdate={false}
                        documentUri={props.documentUri}
                        nodeRange={props.nodePosition}
                        showForm={true}
                        artifactModel={props.artifactModel}
                    />
                </div>;
        } else {
            title = mediatorDetails.title;
            icon = getMediatorIconsFromFont(mediator.tag, isMostPopular);
            page =
                <div style={{ padding: '20px' }}>
                    <MediatorPage
                        mediatorData={mediatorDetails}
                        mediatorType={mediator.tag}
                        isUpdate={false}
                        documentUri={props.documentUri}
                        nodeRange={props.nodePosition}
                        showForm={true}
                        artifactModel={props.artifactModel}
                    />
                </div>;
        }
        sidepanelAddPage(sidePanelContext, page, `Add ${FirstCharToUpperCase(title)}`, icon);
    }

    const initializeExpandedModules = (mediatorList: GetMediatorsResponse) => {
        if (mediatorList) {
            const modulesToExpand = Object.keys(mediatorList).filter(key => key !== 'other');
            setExpandedModules(modulesToExpand);
        }
    };

    const searchForm = (value: string, search?: boolean): GetMediatorsResponse => {
        const normalizeString = (str: string) => str.toLowerCase().replace(/\s+/g, '');
        const searchValue = normalizeString(value || '');

        const searchedMediators: GetMediatorsResponse = { ...allMediators };

        Object.entries(allMediators).forEach(([key, values]) => {
            const containsCategories = allMediators[key].isSupportCategories;
            if (containsCategories) {
                const items = values.items as unknown as MediatorCategory[];

                const searchedCategories: any = { ...items }

                Object.entries(items).forEach(([categoryKey, category]) => {
                    const filtered = (category as any).filter((mediator: { title: string; operationName: string }) => {
                        if (search) {
                            return normalizeString(mediator.operationName).includes(searchValue)
                                || normalizeString(mediator.title).includes(searchValue)
                                || normalizeString(key).includes(searchValue)
                                || normalizeString(categoryKey).includes(searchValue);
                        } else {
                            return normalizeString(mediator.operationName) === searchValue;
                        }
                    });

                    if (filtered.length > 0) {
                        searchedCategories[categoryKey] = filtered ;
                    } else {
                        delete searchedCategories[categoryKey];
                    }
                });

                if (Object.keys(searchedCategories).length > 0) {
                    searchedMediators[key] = { ...searchedMediators[key], items: searchedCategories };
                } else {
                    delete searchedMediators[key];
                }
            } else {
                const filtered = (allMediators as any)[key].items.filter((mediator: { title: string; operationName: string }) => {
                    if (search) {
                        return normalizeString(mediator.operationName).includes(searchValue)
                            || normalizeString(mediator.title).includes(searchValue)
                            || normalizeString(key).includes(searchValue);
                    } else {
                        return normalizeString(mediator.operationName) === searchValue;
                    }
                });

                if (filtered.length > 0) {
                    searchedMediators[key] = { "items": filtered };
                } else {
                    delete searchedMediators[key];
                }
            }
        });

        return searchedMediators;
    };

    const reloadPalette = async (connectorName?: string) => {
        props.clearSearch();
        await fetchMediators();
        await fetchLocalConnectorData();
        connectorName ? setExpandedModules([connectorName]) : initializeExpandedModules(allMediators);
    };

    const deleteConnector = async (connectorName: string, artifactId: string, version: string, iconUrl: string, connectorPath: string) => {
        const removePage = <RemoveConnectorPage
                        connectorName={connectorName}
                        artifactId={artifactId}
                        version={version}
                        connectorPath={connectorPath}
                        onRemoveSuccess={reloadPalette} />;

        sidepanelAddPage(sidePanelContext, removePage, FirstCharToUpperCase(connectorName), iconUrl);
    }

    const refreshConnector = async (connectorName: string, ballerinaModulePath: string) => {
        setIsLoading(true);
        await rpcClient.getMiDiagramRpcClient().buildBallerinaModule(ballerinaModulePath);
        const response = await rpcClient.getMiVisualizerRpcClient().updateConnectorDependencies();
        if (response === "Success") {
            await reloadPalette(connectorName);
        }
        setIsLoading(false);
    }

    const firstCharToUpperCaseForDefault = (name: string) => {
        if (INBUILT_MODULES.includes(name)) {
            return FirstCharToUpperCase(name);
        } else {
            return name;
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

    const MediatorGrid = ({ mediator, key }: { mediator: Mediator; key: string }) => {
        return <Tooltip content={mediator?.tooltip} position='bottom' key={mediator.title}>
            <GridButton
                key={mediator.title}
                title={mediator.title}
                description={mediator.description}
                icon={
                    mediator.iconPath ?
                        <img
                            src={mediator.iconPath}
                            alt="Icon"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_ICON;
                            }}
                        /> :
                        getMediatorIconsFromFont(mediator.tag, key === "most popular")
                }
                onClick={() => getMediator(mediator, key === "most popular",
                    <img
                        src={mediator.iconPath}
                        alt="Icon"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = DEFAULT_ICON;
                        }}
                    />
                )}
            />
        </Tooltip>
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
                            title={firstCharToUpperCaseForDefault(key)}
                            isCollapsed={props.searchValue ? false : !expandedModules.includes(key)}
                            connectorDetails={values["isConnector"] ?
                                { artifactId: values["artifactId"], version: values["version"], connectorPath: values["connectorPath"],
                                    isBallerinaModule: values["isBallerinaModule"], ballerinaModulePath: values["ballerinaModulePath"] } : undefined}
                            onDelete={deleteConnector}
                            onRefresh={refreshConnector}
                            versionTag={values.version}
                            disableGrid={values.isSupportCategories}>
                            {!values.isSupportCategories ? (
                                <>
                                    {(values.items as Mediator[]).map((mediator: Mediator) => (
                                        <MediatorGrid mediator={mediator} key={key} />
                                    ))}
                                </>
                            ) : (
                                <>
                                    {Object.entries(values.items as unknown as MediatorCategory).map(([key, group]) => {
                                        return (
                                            <>
                                                <div style={{
                                                    padding: "10px 0px 0px 10px",
                                                    color: Colors.SECONDARY_TEXT,
                                                    fontSize: "11px"
                                                }}>
                                                    {key}
                                                </div>
                                                <ButtonGrid>
                                                    {(group as Mediator[]).map((mediator: Mediator) => (
                                                        <MediatorGrid mediator={mediator} key={key} />
                                                    ))}
                                                </ButtonGrid>
                                            </>
                                        )
                                    })}
                                </>
                            )}
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
