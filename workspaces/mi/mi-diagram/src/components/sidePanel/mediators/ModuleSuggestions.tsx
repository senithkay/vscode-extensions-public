/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Codicon, ComponentCard, Icon, IconLabel, Tooltip } from '@wso2-enterprise/ui-toolkit';
import React, { ReactNode, useState } from 'react';
import styled from '@emotion/styled';
import SidePanelContext from '../SidePanelContexProvider';
import { getAllMediators } from './Values';
import { getMediatorIconsFromFont } from '../../../resources/icons/mediatorIcons/icons';
import { FirstCharToUpperCase } from '../../../utils/commons';
import { sidepanelAddPage } from '..';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { DownloadPage } from './DownloadPage';

const IconContainer = styled.div`
    width: 30px;
    & img {
        width: 25px;
    }
`;

const DownloadIconContainer = styled.div`
    width: 35px;
    height: 25px;
    cursor: pointer;
    border-radius: 2px;
    align-content: center;
    padding: 5px 5px 15px 12px;
    &:hover, &.active {
        background-color: var(--vscode-pickerGroup-border);
    }
    & img {
        width: 25px;
    }
`;

const VersionTag = styled.div`
    color: #808080;
    font-size: 10px;
    padding-left: 2px;
`;

const CardContent = styled.div`
    display: flex;
    flex-direction: column;
    width: 90%;
`;

const CardLabel = styled.div`
    display: flex;
    flex-direction: row;
    align-self: flex-start;
    width: 100%;
    justify-content: space-between;
    gap: 10px;
`;

interface ModuleSuggestionProps {
    nodePosition: any;
    trailingSpace: string;
    documentUri: string;
    searchValue?: string;
}
export function ModuleSuggestions(props: ModuleSuggestionProps) {
    const sidePanelContext = React.useContext(SidePanelContext);
    const { rpcClient } = useVisualizerContext();
    const [modules, setModules] = useState<any[]>(undefined);

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
                                "isHidden": false
                            },
                            {
                                "name": "echo",
                                "description": "echo the given string",
                                "isHidden": false
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


    const allMediators = getAllMediators({
        nodePosition: props.nodePosition,
        trailingSpace: props.trailingSpace,
        documentUri: props.documentUri,
        previousNode: sidePanelContext.previousNode,
        nextNode: sidePanelContext.nextNode,
        parentNode: sidePanelContext.operationName?.toLowerCase() != sidePanelContext.parentNode?.toLowerCase() ? sidePanelContext.parentNode : undefined,
    });

    const selectModule = (module: any) => {
        const downloadPage = <DownloadPage module={module} />;

        sidepanelAddPage(sidePanelContext, downloadPage, FirstCharToUpperCase(module.connectorName), module.iconUrl);
    };

    const ModuleList = () => {
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
                        <ComponentCard
                            id={values.connectorName}
                            key={`${values.connectorName}-${values.version.tagName}`}
                            sx={{
                                border: '0px',
                                borderRadius: 2,
                                padding: '6px 0px 6px 10px',
                                width: 'auto',
                                height: '32px',
                                '&:hover, &.active': {
                                    backgroundColor: 'var(--vscode-editorWidget-background)'
                                },
                                backgroundColor: 'var(--vscode-editorWidget-background)',
                                display: 'flex',
                                justifyContent: 'left',
                                transition: '0.3s',
                                flexDirection: 'row',
                                marginBottom: '10px',
                                cursor: 'default'
                            }}
                        >
                            <CardContent>
                                <CardLabel>
                                    <IconContainer>
                                        <img
                                            src={values.iconUrl}
                                            alt="Icon"
                                        />
                                    </IconContainer>
                                    <div style={{
                                        width: '100%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        textAlign: 'left',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}>
                                        <IconLabel>
                                            {FirstCharToUpperCase(values.connectorName)}
                                        </IconLabel>
                                        <VersionTag>
                                            {values.version.tagName}
                                        </VersionTag>
                                    </div>
                                </CardLabel>
                            </CardContent>
                            <DownloadIconContainer onClick={() => selectModule(values)}>
                                <Codicon name="desktop-download" iconSx={{ fontSize: 25 }} />
                            </DownloadIconContainer>
                        </ComponentCard>
                    </div>
                ))}
            </>
    }

    return (
        <div>
            <ModuleList />
        </div>
    );
}
