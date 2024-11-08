/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ComponentCard, IconLabel, ProgressRing, Tooltip } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import SidePanelContext from '../SidePanelContexProvider';
import { getMediatorIconsFromFont } from '../../../resources/icons/mediatorIcons/icons';
import { FirstCharToUpperCase } from '../../../utils/commons';
import { sidepanelAddPage } from '..';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { GetMediatorsResponse, Mediator } from '@wso2-enterprise/mi-core';
import { MediatorForm } from './Form';

const ButtonGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 5px;
`;

const IconContainer = styled.div`
    width: 30px;

    & img {
        width: 25px;
    }
`;

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

    useEffect(() => {
        const fetchMediators = async () => {
            const mediatorsList = await rpcClient.getMiDiagramRpcClient().getMediators({
                documentUri: props.documentUri,
                position: props.nodePosition,
            });
            setAllMediators(mediatorsList ?? {});
        };
        fetchMediators();
    }, [props.documentUri, props.nodePosition, rpcClient]);

    const getMediator = async (mediator: Mediator, isMostPopular: boolean) => {
        const mediatorDetails = await rpcClient.getMiDiagramRpcClient().getMediator({
            mediatorType: mediator.tag,
        });

        if (!mediatorDetails) {
            return;
        }
        const form =
            <div style={{ padding: '20px' }}>
                <MediatorForm mediatorData={mediatorDetails} mediatorType={mediator.tag} isUpdate={false} documentUri={props.documentUri} range={props.nodePosition} />
            </div>;
        sidepanelAddPage(sidePanelContext, form, `Add ${mediator.title}`, getMediatorIconsFromFont(mediator.icon, isMostPopular));
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

    const MediatorList = () => {
        let mediators: GetMediatorsResponse;
        if (props.searchValue) {
            mediators = searchForm(props.searchValue, true);
        } else {
            mediators = allMediators;
        }

        return Object.keys(mediators).length === 0 ? <h3 style={{ textAlign: "center" }}>No mediators found</h3> :
            <>
                {Object.entries(mediators).map(([key, values]) => (
                    <div key={key}>
                        <h4>{FirstCharToUpperCase(key)}</h4>
                        <ButtonGrid>
                            {values.map((mediator: Mediator) => (
                                <Tooltip content={mediator.description} position='bottom' sx={{ zIndex: 2010 }}>
                                    <ComponentCard
                                        id={mediator.type}
                                        key={mediator.description}
                                        onClick={() => getMediator(mediator, key === "most popular")}
                                        sx={{
                                            '&:hover, &.active': {
                                                '.icon svg g': {
                                                    fill: 'var(--vscode-editor-foreground)'
                                                },
                                                backgroundColor: 'var(--vscode-pickerGroup-border)',
                                                border: '0.5px solid var(--vscode-focusBorder)'
                                            },
                                            alignItems: 'center',
                                            border: '0.5px solid var(--vscode-editor-foreground)',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            height: 20,
                                            justifyContent: 'left',
                                            marginBottom: 10,
                                            padding: 10,
                                            transition: '0.3s',
                                            width: 172
                                        }}
                                    >
                                        <IconContainer>
                                            {getMediatorIconsFromFont(mediator.icon, key === "most popular")}
                                        </IconContainer>
                                        <div >
                                            <IconLabel>{FirstCharToUpperCase(mediator.title)}</IconLabel>
                                        </div>
                                    </ComponentCard>
                                </Tooltip>
                            ))}
                        </ButtonGrid>
                        {/* Avoid adding hr to the last elemet */}
                        {key !== Object.keys(mediators)[Object.keys(mediators).length - 1] &&
                            <hr style={{
                                borderColor: "var(--vscode-panel-border)",
                            }} />
                        }
                    </div >
                ))
                }
            </>
    }

    return (
        <div>
            {!allMediators ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px' }}>
                    <ProgressRing />
                </div>
            ) : (
                <MediatorList />
            )}
        </div>
    );
}
