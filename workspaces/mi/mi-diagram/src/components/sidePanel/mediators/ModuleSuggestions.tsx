/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ProgressRing, Tooltip } from '@wso2-enterprise/ui-toolkit';
import React from 'react';
import styled from '@emotion/styled';
import SidePanelContext from '../SidePanelContexProvider';
import { FirstCharToUpperCase } from '../../../utils/commons';
import { sidepanelAddPage } from '..';
import { DownloadPage } from './DownloadPage';
import { ButtonGroup } from '../commons/ButtonGroup';
import { ConnectorOperation } from '@wso2-enterprise/mi-core';
import { debounce } from 'lodash';
import { APIS } from '../../../resources/constants';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

interface ModuleSuggestionProps {
    documentUri: string;
    searchValue?: string;
    localConnectors: any;
    reloadMediatorPalette: (connectorName: string) => void;
}

export const OperationsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    color: #808080;
    gap: 5px;
`;

export function ModuleSuggestions(props: ModuleSuggestionProps) {
    const sidePanelContext = React.useContext(SidePanelContext);
    const { localConnectors, searchValue } = props;
    const [filteredModules, setFilteredModules] = React.useState<any[]>([]);
    const [isSearching, setIsSearching] = React.useState<boolean>(false);

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
                setFilteredModules([]);
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

    const downloadModule = (module: any) => {
        const downloadPage = <DownloadPage
            module={module}
            onDownloadSuccess={props.reloadMediatorPalette}
            documentUri={props.documentUri} />;

        sidepanelAddPage(sidePanelContext, downloadPage, FirstCharToUpperCase(module.connectorName), module.iconUrl);
    };

    const SuggestionList = () => {
        let modules: any;
        if (props.searchValue) {
            modules = filteredModules;
        } else {
            modules = [];
        }

        return Object.keys(modules).length > 0 &&
            <>
                <h4>In Store: </h4>
                {Object.entries(modules).map(([key, values]: [string, any]) => (
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
                                            <Tooltip content={operation.description} position='bottom' sx={{ zIndex: 2010 }}>
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
        <div>
            {
                isSearching ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px' }}>
                        <ProgressRing />
                    </div>
                ) : (
                    <SuggestionList />
                )
            }
        </div>
    );
}
