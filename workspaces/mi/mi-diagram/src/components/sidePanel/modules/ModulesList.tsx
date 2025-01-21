/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Codicon, ErrorBanner, ProgressRing, TextField, Tooltip, Typography } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect } from 'react';
import SidePanelContext from '../SidePanelContexProvider';
import { FirstCharToUpperCase } from '../../../utils/commons';
import { sidepanelAddPage } from '..';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { ConnectorOperation } from '@wso2-enterprise/mi-core';
import { ButtonGroup } from '../commons/ButtonGroup';
import { APIS, ERROR_MESSAGES } from '../../../resources/constants';
import { OperationsWrapper } from '../mediators/ModuleSuggestions';
import { DownloadPage } from '../mediators/DownloadPage';
import { debounce } from 'lodash';
import styled from '@emotion/styled';
import { VSCodeLink } from '@vscode/webview-ui-toolkit/react';

const SearchStyle = {
    width: 'auto',

    '& > vscode-text-field': {
        width: '100%',
        height: '50px',
        borderRadius: '5px',
    },
};

const LoaderWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 15px;
    height: 100px;
    width: 100%;
`;

const searchIcon = (<Codicon name="search" sx={{ cursor: "auto" }} />);

interface ModuleProps {
    nodePosition: any;
    trailingSpace: string;
    documentUri: string;
    localConnectors: any;
    reloadMediatorPalette: (connectorName: string) => void;
}
export function Modules(props: ModuleProps) {
    const sidePanelContext = React.useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const { localConnectors } = props;
    const [allModules, setAllModules] = React.useState([] as any);
    const [filteredModules, setFilteredModules] = React.useState<[]>(undefined);
    const [searchValue, setSearchValue] = React.useState<string>('');

    useEffect(() => {
        fetchModules();
    }, [props.documentUri, props.nodePosition, rpcClient]);

    const fetchModules = async () => {
        try {
            if (navigator.onLine) {
                const response = await rpcClient.getMiDiagramRpcClient().getStoreConnectorJSON();
                const data = response.connectors;
                setAllModules(data);
            } else {
                console.error('No internet connection. Unable to fetch modules.');
                setAllModules(undefined);
            }
        } catch (error) {
            console.error('Error fetching mediators:', error);
            setAllModules(undefined);
        }
    };

    const debouncedSearchModules = React.useMemo(
        () => debounce(async (value: string) => {
            if (value) {
                try {
                    const response = await fetch(`${APIS.CONNECTOR_SEARCH.replace('${searchValue}', value)}`);
                    const data = await response.json();
                    setFilteredModules(data);
                } catch (e) {
                    console.error("Error fetching modules", e);
                    setFilteredModules(undefined);
                }
            } else {
                setFilteredModules(undefined);
            }
        }, 300),
        []
    );

    React.useEffect(() => {
        debouncedSearchModules(searchValue);

        return () => {
            debouncedSearchModules.cancel();
        };
    }, [searchValue, debouncedSearchModules]);

    const handleSearch = (e: string) => {
        setFilteredModules(undefined);
        setSearchValue(e);
    }

    const downloadModule = (module: any) => {
        const downloadPage = <DownloadPage
            module={module}
            onDownloadSuccess={props.reloadMediatorPalette}
            documentUri={props.documentUri}
            backCount={2} />;

        sidepanelAddPage(sidePanelContext, downloadPage, FirstCharToUpperCase(module.connectorName), module.iconUrl);
    };

    const isSearching = searchValue && !filteredModules;

    const ModuleList = () => {
        let modules: any[];
        if (searchValue) {
            modules = filteredModules;
        } else {
            modules = allModules;
        }

        if (!modules || !Array.isArray(modules)) {
            return (
                <LoaderWrapper>
                    <span>Failed to fetch store connectors. Please <VSCodeLink onClick={fetchModules}>retry</VSCodeLink></span>
                </LoaderWrapper>
            );
        }

        return Object.keys(modules).length === 0 ? <h3 style={{ textAlign: "center" }}>No modules found</h3> :
            <>
                {Object.entries(modules).sort(([, a], [, b]) => a.connectorRank - b.connectorRank).map(([key, values]: [string, any]) => (
                    localConnectors && localConnectors.some((c: any) =>
                        ((c.displayName ? c.displayName === values.connectorName : c.name.toLowerCase() === values.connectorName.toLowerCase())) &&
                        (c.version === values.version.tagName)) ? null : (
                        <div key={key}>
                            <ButtonGroup
                                key={key}
                                title={FirstCharToUpperCase(values.connectorName)}
                                isCollapsed={true}
                                iconUri={values.iconUrl}
                                versionTag={values.version.tagName}
                                onDownload={() => downloadModule(values)}>
                                <OperationsWrapper>
                                    Available Operations
                                    <hr style={{ border: '1px solid #ccc', margin: '5px 0', width: '350px' }} />
                                    {values.version.operations.map((operation: ConnectorOperation) => (
                                        !operation.isHidden && (
                                            <Tooltip key={key} content={operation.description} position='bottom' sx={{ zIndex: 2010 }}>
                                                {FirstCharToUpperCase(operation.name)}
                                            </Tooltip>
                                        )
                                    ))}
                                </OperationsWrapper>
                            </ButtonGroup >
                        </div >
                    )))
                }
            </>
    }

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ padding: "10px", marginBottom: "20px", borderBottom: "1px solid var(--vscode-editorWidget-border)" }}>
                <Typography variant="body3">A collection of reusable modules for efficient software development.</Typography>
            </div>
            {/* Search bar */}
            <TextField
                sx={SearchStyle}
                placeholder="Search"
                value={searchValue}
                onTextChange={handleSearch}
                icon={{
                    iconComponent: searchIcon,
                    position: 'start',
                }}
                autoFocus={true}
            />
            {

                isSearching ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px' }}>
                        <ProgressRing />
                    </div>
                ) : (
                    <ModuleList />
                )
            }
        </div >
    );
}
