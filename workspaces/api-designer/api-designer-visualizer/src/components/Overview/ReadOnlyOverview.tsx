/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, SidePanelTitleContainer, Typography } from '@wso2-enterprise/ui-toolkit';
import { AccordionTable } from '@wso2-enterprise/service-designer';
import styled from "@emotion/styled";
import { OpenAPI } from '../../Definitions/ServiceDefinitions';

export const PanelBody = styled.div`
    height: calc(100% - 87px);
    overflow-y: auto;
    padding: 16px;
    gap: 15px;
    display: flex;
    flex-direction: column;
`;
const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: flex-end;
    flex-grow: 1;
`;

interface OverviewProps {
    openAPIDefinition: OpenAPI;
    onSwitchToEdit?: () => void;
}

// Title, Vesrion are mandatory fields
export function ReadOnlyOverview(props: OverviewProps) {
    const { openAPIDefinition, onSwitchToEdit } = props;

    // Define 2D string array for the accordion table
    const content = [
        [
            "Title",
            openAPIDefinition.info.title,
        ],
        [
            "Version",
            openAPIDefinition.info.version,
        ],
        openAPIDefinition.info.summary ? ["Summary", openAPIDefinition.info.summary] : [],
        openAPIDefinition.info.description ? ["Description", openAPIDefinition.info.description] : [],
    ];
    return (
        <>
            <SidePanelTitleContainer>
                <Typography sx={{ margin: 0 }} variant="h1">Overview</Typography>
                <ButtonWrapper>
                    <Button sx={{ marginTop: 2 }} appearance="icon" onClick={() => onSwitchToEdit()}> 
                        <Codicon name="edit" />
                    </Button>
                </ButtonWrapper>
            </SidePanelTitleContainer>
            <PanelBody>
                <AccordionTable
                    titile='General Information'
                    content={content}
                    headers={["Property", "Value"]}
                />
                {openAPIDefinition.info.contact && (
                    <AccordionTable
                        titile='Contact'
                        content={[
                            ["Name", openAPIDefinition.info.contact.name],
                            ["URL", openAPIDefinition.info.contact.url],
                            ["Email", openAPIDefinition.info.contact.email],
                        ]}
                        headers={["Property", "Value"]}
                    />
                )}
                {openAPIDefinition.info.license && (
                    <AccordionTable
                        titile='License'
                        content={[
                            ["Name", openAPIDefinition.info.license.name],
                            openAPIDefinition.info.license.url ? 
                            [   "URL",
                                openAPIDefinition.info.license.url
                            ] : 
                            [
                                "Identifier",
                                openAPIDefinition.info.license.identifier,
                            ],
                        ]}
                        headers={["Property", "Value"]}
                    />
                )}        
            </PanelBody>
        </>
    )
}
