/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, FormGroup, SidePanelTitleContainer, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { OpenAPI } from '../../Definitions/ServiceDefinitions';
import { DataGrid } from '../DataGrid/DataGrid';
import { MarkdownRenderer } from '../Resource/ReadOnlyResource1';

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
const DescriptionWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

interface OverviewProps {
    openAPIDefinition: OpenAPI;
    onSwitchToEdit?: () => void;
}

// Title, Vesrion are mandatory fields
export function ReadOnlyOverview(props: OverviewProps) {
    const { openAPIDefinition, onSwitchToEdit } = props;

    // Define 2D string array for the accordion table
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
                {openAPIDefinition?.info?.title && (
                    <>
                        <Typography sx={{ margin: 0 }} variant="h3">Title</Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'>{openAPIDefinition?.info?.title}</Typography>
                    </>
                )}
                {openAPIDefinition?.info?.version && (
                    <>
                        <Typography sx={{ margin: 0 }} variant="h3">Version</Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'>{openAPIDefinition?.info?.version}</Typography>
                    </>
                )}
                {openAPIDefinition?.info?.summary && (
                    <>
                        <Typography sx={{ margin: 0 }} variant="h3">Summary</Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'>{openAPIDefinition?.info?.summary}</Typography>
                    </>
                )}
                {openAPIDefinition?.info?.description && (
                    <DescriptionWrapper>
                        <Typography sx={{ margin: 0 }} variant='h3'> Description </Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body2'>
                            <MarkdownRenderer key="description" markdownContent={openAPIDefinition?.info?.description} /> 
                        </Typography>
                    </DescriptionWrapper>
                )}
                {openAPIDefinition?.info?.contact && (
                    <FormGroup title="Contact" isCollapsed={!openAPIDefinition?.info?.contact}>
                        <DataGrid
                            headers={["Property", "Value"]}
                            content={[
                                ["Name", openAPIDefinition.info?.contact?.name],
                                ["URL", openAPIDefinition.info?.contact?.url],
                                ["Email", openAPIDefinition.info?.contact?.email],
                            ]}
                        />
                    </FormGroup>
                )}
                {openAPIDefinition?.info?.license && (
                    <FormGroup title="License" isCollapsed={!openAPIDefinition?.info?.license}>
                        <DataGrid
                            headers={["Property", "Value"]}
                            content={[
                                ["Name", openAPIDefinition.info?.license?.name],
                                openAPIDefinition.info?.license?.url ? 
                                [   "URL",
                                    openAPIDefinition.info?.license?.url
                                ] : 
                                [
                                    "Identifier",
                                    openAPIDefinition.info?.license?.identifier,
                                ],
                            ]}
                        /> 
                    </FormGroup>
                )}        
            </PanelBody>
        </>
    )
}
