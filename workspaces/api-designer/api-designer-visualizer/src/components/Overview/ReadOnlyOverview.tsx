/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { OpenAPI } from '../../Definitions/ServiceDefinitions';
import { DataGrid } from '../DataGrid/DataGrid';
import { MarkdownRenderer } from '../Resource/ReadOnlyResource';

export const PanelBody = styled.div`
    height: calc(100% - 87px);
    overflow-y: auto;
    padding: 16px;
    gap: 15px;
    display: flex;
    flex-direction: column;
`;
const DescriptionWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;
const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

interface OverviewProps {
    openAPIDefinition: OpenAPI;
}

// Title, Vesrion are mandatory fields
export function ReadOnlyOverview(props: OverviewProps) {
    const { openAPIDefinition } = props;

    // Define 2D string array for the accordion table
    return (
        <>
            <PanelBody>
                <Typography sx={{ margin: 0, marginTop: 4 }} variant="h2">Overview</Typography>
                {openAPIDefinition?.info?.title && (
                    <>
                        <Typography sx={{ margin: 0 }} variant="h3">Title</Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'>{openAPIDefinition?.info?.title}</Typography>
                    </>
                )}
                {openAPIDefinition?.info?.version && (
                    <>
                        <Typography sx={{ margin: 0 }} variant="h3">Version</Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'>{openAPIDefinition?.info?.version}</Typography>
                    </>
                )}
                {openAPIDefinition?.info?.summary && (
                    <>
                        <Typography sx={{ margin: 0 }} variant="h3">Summary</Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'>{openAPIDefinition?.info?.summary}</Typography>
                    </>
                )}
                {openAPIDefinition?.info?.description && (
                    <DescriptionWrapper>
                        <Typography sx={{ margin: 0 }} variant='h3'> Description </Typography>
                        <Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'>
                            <MarkdownRenderer key="description" markdownContent={openAPIDefinition?.info?.description} />
                        </Typography>
                    </DescriptionWrapper>
                )}
                {openAPIDefinition?.info?.contact && (
                    <ContentWrapper>
                        <Typography sx={{ margin: 0 }} variant="h3">Contact</Typography>
                        <DataGrid
                            headers={["Property", "Value"]}
                            content={[
                                ["Name", openAPIDefinition.info?.contact?.name],
                                ["URL", openAPIDefinition.info?.contact?.url],
                                ["Email", openAPIDefinition.info?.contact?.email],
                            ]}
                        />
                    </ContentWrapper>
                )}
                {openAPIDefinition?.info?.license && (
                    <ContentWrapper>
                        <Typography sx={{ margin: 0 }} variant="h3">License</Typography>
                        <DataGrid
                            headers={["Property", "Value"]}
                            content={[
                                ["Name", openAPIDefinition.info?.license?.name],
                                openAPIDefinition.info?.license?.url ?
                                    ["URL",
                                        openAPIDefinition.info?.license?.url
                                    ] :
                                    [
                                        "Identifier",
                                        openAPIDefinition.info?.license?.identifier,
                                    ],
                            ]}
                        />
                    </ContentWrapper>
                )}
            </PanelBody>
        </>
    )
}
