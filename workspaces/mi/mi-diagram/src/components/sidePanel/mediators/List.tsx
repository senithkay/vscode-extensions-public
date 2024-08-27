/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ComponentCard, IconLabel, Tooltip } from '@wso2-enterprise/ui-toolkit';
import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import SidePanelContext from '../SidePanelContexProvider';
import { getAllMediators } from './Values';
import { getMediatorIconsFromFont } from '../../../resources/icons/mediatorIcons/icons';
import { FirstCharToUpperCase } from '../../../utils/commons';
import { sidepanelAddPage } from '..';

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
    const allMediators = getAllMediators({
        nodePosition: props.nodePosition,
        trailingSpace: props.trailingSpace,
        documentUri: props.documentUri,
        previousNode: sidePanelContext.previousNode,
        nextNode: sidePanelContext.nextNode,
        parentNode: sidePanelContext.operationName?.toLowerCase() != sidePanelContext.parentNode?.toLowerCase() ? sidePanelContext.parentNode : undefined,
    });

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
        let mediators: any;
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
                            {(values as any[]).map((action: { form: ReactNode, operationName: React.Key; tooltip: string; title: string; }) => (
                                <Tooltip content={action.tooltip} position='bottom' sx={{zIndex: 2010}}>
                                    <ComponentCard
                                        id={action.title}
                                        key={action.operationName}
                                        onClick={() => sidepanelAddPage(sidePanelContext, action.form, action.operationName.toString(), getMediatorIconsFromFont(action.operationName as string, key === "most popular"))}
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
                                            {getMediatorIconsFromFont(action.operationName as string, key === "most popular")}
                                        </IconContainer>
                                        <div >
                                            <IconLabel>{FirstCharToUpperCase(action.operationName.toString())}</IconLabel>
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
                    </div>
                ))}
            </>
    }

    return (
        <div>
            <MediatorList />
        </div>
    );
}
