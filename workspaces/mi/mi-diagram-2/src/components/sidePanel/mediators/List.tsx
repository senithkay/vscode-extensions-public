/**
 * Copyright (c) 2023-2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button, IconLabel } from '@wso2-enterprise/ui-toolkit';
import React, { ReactNode } from 'react';
import styled from '@emotion/styled';
import SidePanelContext from '../SidePanelContexProvider';
import { getAllMediators } from './Values';
import { getSVGIcon } from '../../../resources/icons/mediatorIcons/icons';

const ButtonGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 10px;
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
    setContent: React.Dispatch<React.SetStateAction<ReactNode>>;
    searchValue?: string;
}
export function Mediators(props: MediatorProps) {
    const sidePanelContext = React.useContext(SidePanelContext);
    const allMediators = getAllMediators({
        nodePosition: props.nodePosition,
        documentUri: props.documentUri,
        previousNode: sidePanelContext.previousNode,
        parentNode: sidePanelContext.parentNode,
    });

    const setContent = (content: any) => {
        sidePanelContext.setSidePanelState({
            ...sidePanelContext,
            title: `${sidePanelContext.isEditing ? "Edit" : "Add"} ${content.title}`,
        });
        props.setContent(content.form);
    }

    const searchForm = (value: string, search?: boolean) => {
        return Object.keys(allMediators).reduce((acc: any, key: string) => {
            const filtered = (allMediators as any)[key].filter((mediator: { title: string; }) =>
                search ? mediator.title.toLowerCase().includes(value?.toLowerCase()) : mediator.title.toLowerCase() === value?.toLowerCase());
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
                                // <ButtonContainer key={action.title}>
                                <Button key={action.operationName} appearance='secondary' sx={{
                                    width: "auto",
                                    height: "40px",

                                    '& > vscode-button': {
                                        width: '100%',
                                        '::part(content)': {
                                            width: '-webkit-fill-available',
                                        }
                                    },
                                }} onClick={() => setContent(action)}>
                                    <div style={{
                                        width: "-webkit-fill-available",
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}>
                                        <IconContainer>
                                            {getSVGIcon(action.operationName as string)}
                                        </IconContainer>
                                        <div >
                                            <IconLabel>{action.title.charAt(0).toUpperCase() + action.title.slice(1)}</IconLabel>
                                        </div>
                                    </div>
                                </Button>
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