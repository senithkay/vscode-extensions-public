/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ComponentCard, IconLabel } from '@wso2-enterprise/ui-toolkit';
import React from 'react';
import styled from '@emotion/styled';
import SidePanelContext from '../SidePanelContexProvider';
import { getAllMediators } from './Values';
import { getSVGIcon } from '../../../resources/icons/mediatorIcons/icons';

const ButtonGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 5px;
`;

const IconContainer = styled.div`
    width: 40px;

    & img {
        width: 25px;
    }
`;

interface MediatorProps {
    nodePosition: any;
    documentUri: string;
    setContent: any;
    searchValue?: string;
}
export function Mediators(props: MediatorProps) {
    const sidePanelContext = React.useContext(SidePanelContext);
    const allMediators = getAllMediators({
        nodePosition: props.nodePosition,
        documentUri: props.documentUri,
        previousNode: sidePanelContext.previousNode,
        parentNode: sidePanelContext.operationName?.toLowerCase() != sidePanelContext.parentNode?.toLowerCase() ? sidePanelContext.parentNode : undefined,
    });

    const setContent = (content: any) => {
        props.setContent(content.form, `${sidePanelContext.isEditing ? "Edit" : "Add"} ${content.title}`);
    }

    const searchForm = (value: string, search?: boolean) => {
        return Object.keys(allMediators).reduce((acc: any, key: string) => {
            const filtered = (allMediators as any)[key].filter((mediator: { title: string; operationName: string }) =>
                search ? mediator.title.toLowerCase().includes(value?.toLowerCase()) : mediator.operationName.toLowerCase() === value?.toLowerCase());
            if (filtered.length > 0) {
                acc[key] = filtered;
            }
            return acc;
        }
            , {});
    }

    const MediatorList = () => {
        let mediators;
        if (sidePanelContext.isEditing && sidePanelContext.operationName) {
            const form = searchForm(sidePanelContext.operationName, false);

            if (form) {
                setContent(Object.keys(form).length > 0 ? form[Object.keys(form)[0]][0] : {});
                return <></>;
            }
        }
        if (props.searchValue) {
            mediators = searchForm(props.searchValue, true);
        } else {
            mediators = allMediators;
        }

        return Object.keys(mediators).length === 0 ? <h3 style={{ textAlign: "center" }}>No mediators found</h3> :
            <>
                {Object.entries(mediators).map(([key, values]) => (
                    <div key={key}>
                        <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                        <ButtonGrid>
                            {(values as any[]).map((action: { operationName: React.Key; title: string; }) => (
                                <ComponentCard
                                    key={action.operationName}
                                    onClick={() => setContent(action)}
                                    sx={{
                                        '&:hover, &.active': {
                                            '.icon svg g': {
                                                fill: 'var(--vscode-editor-foreground)'
                                            },
                                            backgroundColor: 'var(--vscode-pickerGroup-border)',
                                            border: '1px solid var(--vscode-focusBorder)'
                                        },
                                        alignItems: 'center',
                                        border: '1px solid var(--vscode-editor-foreground)',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        height: 20,
                                        justifyContent: 'left',
                                        marginBottom: 10,
                                        padding: 10,
                                        transition: '0.3s',
                                        width: 170
                                    }}
                                >
                                    <IconContainer>
                                        {getSVGIcon(action.operationName as string)}
                                    </IconContainer>
                                    <div >
                                        <IconLabel>{action.title.charAt(0).toUpperCase() + action.title.slice(1)}</IconLabel>
                                    </div>
                                </ComponentCard>
                            ))}
                        </ButtonGrid>
                        <hr style={{
                            borderColor: "var(--vscode-panel-border)",
                        }} />
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