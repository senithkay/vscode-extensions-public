/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Tooltip } from '@wso2-enterprise/ui-toolkit';
import React from 'react';
import styled from '@emotion/styled';
import SidePanelContext from '../SidePanelContexProvider';
// import { getAllMediators } from './Values';
import { FirstCharToUpperCase } from '../../../utils/commons';
import { sidepanelAddPage } from '..';
import { DownloadPage } from './DownloadPage';
import { ButtonGroup, GridButton } from '../commons/ButtonGroup';
import { ConnectorOperation } from '@wso2-enterprise/mi-core';

interface ModuleSuggestionProps {
    nodePosition: any;
    trailingSpace: string;
    documentUri: string;
    searchValue?: string;
}

export const OperationsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    color: #808080;
    gap: 5px;
`;

export function ModuleSuggestions(props: ModuleSuggestionProps) {
    const sidePanelContext = React.useContext(SidePanelContext);

    const searchModules = () => {
        try {
            const response = [
                {
                    "connectorName": "Redis",
                    "description": "The Redis connector allows you to access the Redis commands through the WSO2 EI. Redis is an open source (BSD licensed), in-memory data structure store, used as a database, cache and message broker. It supports data structures such as strings, hashes, lists, sets, sorted sets with range queries, bitmaps, hyperloglogs and geospatial indexes with radius queries.\nIn latest version we have added following:\nPreviously we were creating a single pool for each cluster operation and closing it after each operation that's why read/write lock issue occurs (jmxRegister and jmxUnRegister on the same object). This Pr rectifies that and also avoids closing JedisCluster after each operation since It's no need to close the JedisCluster instance as it is handled by the JedisClusterConnectionPool itself.\n\nAlso introduced the \"isJmxEnabled\" property to enable JMX if required.",
                    "mavenGroupId": "org.wso2.carbon.connector",
                    "mavenArtifactId": "org.wso2.carbon.connector.redis",
                    "version": {
                        "tagName": "3.1.3",
                        "releaseId": "176616995",
                        "isLatest": true,
                        "isDeprecated": false,
                        "operations": [
                            {
                                "name": "init",
                                "description": "configure Redis connector",
                                "isHidden": true
                            },
                            {
                                "name": "echo",
                                "description": "echo the given string",
                                "isHidden": false
                            },
                            {
                                "name": "echo2",
                                "description": "echo the given string",
                                "isHidden": false
                            },
                            {
                                "name": "echo333",
                                "description": "echo the given string",
                                "isHidden": false
                            }
                        ],
                        "connections": [
                            {
                                "name": "Redis",
                                "description": "Connection for Redis data operations."
                            }
                        ]
                    },
                    "otherVersions": {
                        "3.0.0": "158539115",
                        "3.1.0": "159113274",
                        "3.1.1": "176263727",
                        "3.1.2": "176288410",
                        "2.1.0": "33548116",
                        "2.2.0": "45003675",
                        "2.3.0": "48791514",
                        "2.4.0": "65373888",
                        "2.5.0": "85390009",
                        "2.6.0": "96810611",
                        "2.7.0": "98802216"
                    },
                    "connectorRank": 5,
                    "iconUrl": "https://mi-connectors.wso2.com/icons/redis.gif"
                }
            ];
            // setModules(response);
            return (response);
        } catch (e) {
            console.error("Error fetching modules", e);
        }
    };

    const downloadModule = (module: any) => {
        const downloadPage = <DownloadPage module={module} />;

        sidepanelAddPage(sidePanelContext, downloadPage, FirstCharToUpperCase(module.connectorName), module.iconUrl);
    };

    const SuggestionList = () => {
        let modules: any;
        if (props.searchValue) {
            modules = searchModules();
        } else {
            modules = [];
        }

        return Object.keys(modules).length > 0 &&
            <>
                <h4>In Store: </h4>
                {Object.entries(modules).map(([key, values]: [string, any]) => (
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
                ))
                }
            </>
    }

    return (
        <div>
            <SuggestionList />
        </div>
    );
}
