/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { debounce } from 'lodash';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Position } from 'vscode-languageserver-types';
import styled from '@emotion/styled';
import { HelperPaneCompletionItem } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Alert, COMPLETION_ITEM_KIND, getIcon, HelperPane, Icon } from '@wso2-enterprise/ui-toolkit';
import { filterHelperPaneCompletionItems, getHelperPaneCompletionItem } from '../FormExpressionField/utils';
import { PAGE, Page } from './index';

const InfoMessage = styled.div`
    margin-top: auto;
    padding-top: 8px;
    padding-inline: 8px;
`;

type PayloadPageProps = {
    position: Position;
    setCurrentPage: (page: Page) => void;
    onClose: () => void;
    onChange: (value: string) => void;
};

export const PayloadPage = ({
    position,
    setCurrentPage,
    onClose,
    onChange
}: PayloadPageProps) => {
    const { rpcClient } = useVisualizerContext();
    const firstRender = useRef<boolean>(true);
    const [searchValue, setSearchValue] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [payloadInfo, setPayloadInfo] = useState<HelperPaneCompletionItem[]>([]);
    const [filteredPayloadInfo, setFilteredPayloadInfo] = useState<HelperPaneCompletionItem[]>([]);
    const [displayPayloadAlert, setDisplayPayloadAlert] = useState<boolean>(false);

    const getPayloadAlertDisplayState = useCallback(() => {
        rpcClient.getMiDiagramRpcClient().shouldDisplayPayloadAlert().then((response) => {
            setDisplayPayloadAlert(response);
        });
    }, [rpcClient]);

    const showPayloadAlert = useCallback(() => {
        rpcClient.getMiDiagramRpcClient().displayPayloadAlert().then(() => {
            setDisplayPayloadAlert(true);
        });
    }, [rpcClient]);

    const closePayloadAlert = useCallback(() => {
        rpcClient.getMiDiagramRpcClient().closePayloadAlert().then(() => {
            setDisplayPayloadAlert(false);
        });
    }, [rpcClient]);

    const getPayloads = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            rpcClient.getVisualizerState().then((machineView) => {
                rpcClient
                    .getMiDiagramRpcClient()
                    .getHelperPaneInfo({
                        documentUri: machineView.documentUri,
                        position: position,
                    })
                    .then((response) => {
                        if (response.payload?.length) {
                            setPayloadInfo(response.payload);
                            setFilteredPayloadInfo(response.payload);
                        }
                    })
                    .finally(() => setIsLoading(false));
            });
        }, 1100);
    }, [rpcClient, position]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            getPayloadAlertDisplayState();
            getPayloads();
        }
    }, [getPayloads, getPayloadAlertDisplayState]);

    const debounceFilterPayloads = useCallback(
        debounce((searchText: string) => {
            setFilteredPayloadInfo(filterHelperPaneCompletionItems(payloadInfo, searchText));
            setIsLoading(false);
        }, 1100),
        [payloadInfo, setFilteredPayloadInfo, setIsLoading, filterHelperPaneCompletionItems]
    );

    const handleSearch = (searchText: string) => {
        setSearchValue(searchText);
        setIsLoading(true);
        debounceFilterPayloads(searchText);
    };

    const getCompletionItemIcon = () => getIcon(COMPLETION_ITEM_KIND.Variable);

    const getHelperTipIcon = () => {
        return (
            <Icon
                name="question"
                isCodicon
                iconSx={{ fontSize: '18px' }}
                sx={{ marginLeft: '5px', cursor: 'help' }}
                onClick={showPayloadAlert}
            />
        );
    };

    return (
        <>
            <HelperPane.Header
                title="Payload"
                endAdornment={getHelperTipIcon()}
                onBack={() => setCurrentPage(PAGE.CATEGORY)}
                onClose={onClose}
                searchValue={searchValue}
                onSearch={handleSearch}
            />
            <HelperPane.Body loading={isLoading}>
                {filteredPayloadInfo?.map((payload) => (
                    getHelperPaneCompletionItem(payload, onChange, getCompletionItemIcon)
                ))}
            </HelperPane.Body>
            {displayPayloadAlert && (
                <InfoMessage>
                    <Alert
                        variant="primary"
                        title="Important!"
                        subTitle="Payload suggestions are generated based on the first request payload defined in the 'Start' node. If no payloads are defined yet, please add one in the 'Start' node of the diagram."
                        onClose={closePayloadAlert}
                        sx={{ marginBottom: '0' }}
                    />
                </InfoMessage>
            )}
        </>
    );
};
