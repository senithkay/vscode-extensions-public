/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, Dropdown } from '@wso2-enterprise/ui-toolkit';
import { RequestBody as R, MediaType as M } from '../../../Definitions/ServiceDefinitions';
import SectionHeader from '../SectionHeader/SectionHeader';
import { useState } from 'react';
import { useVisualizerContext } from '@wso2-enterprise/api-designer-rpc-client';
import { MediaType } from '../MediaType/MediaType';

interface RequestBodyProps {
    requestBody: R;
    onRequestBodyChange: (mediaType: R) => void;
}

// Title, Vesrion are mandatory fields
export function RequestBody(props: RequestBodyProps) {
    const { requestBody, onRequestBodyChange } = props;
    const { rpcClient } = useVisualizerContext();
    const [selectedMediaType, setSelectedMediaType] = useState<string | undefined>(requestBody?.content && Object.keys(requestBody.content)[0]);

    const handleRequestBodyChange = (requestBody: R) => {
        onRequestBodyChange(requestBody);
    };

    const onSchemaChange = (updatedSchema: any) => {
        if (selectedMediaType) {
            // Update the schema of the selected media type
            const newRequestBody: R = {
                requestBody,
                content: {
                    ...requestBody.content,
                    [selectedMediaType]: {
                        ...requestBody.content[selectedMediaType],
                        schema: updatedSchema
                    }
                }
            };
            handleRequestBodyChange(newRequestBody);
        }
    };

    const handleImportJSON = () => {
        rpcClient.getApiDesignerVisualizerRpcClient().importJSON().then(resp => {
            if (resp) {
                onSchemaChange(resp);
            }
        })
    };

    const handleMediaTypeChange = (mediaType: M) => {
        if (selectedMediaType) {
            // Update the schema of the selected media type
            const newRequestBody: R = {
                requestBody,
                content: {
                    ...requestBody.content,
                    [selectedMediaType]: mediaType
                }
            };
            handleRequestBodyChange(newRequestBody);
        }
    };

    const allMediaTypes = requestBody?.content && Object.keys(requestBody.content);

    return (
        <>
            <SectionHeader
                title="Body"
                variant='h3'
                actionButtons={
                    <>
                        <Button tooltip='Import from JSON' onClick={handleImportJSON} appearance='icon'>
                            <Codicon name='arrow-circle-down' sx={{ marginRight: "4px" }} /> Import JSON
                        </Button>
                        <Dropdown
                            id="media-type-dropdown"
                            value={selectedMediaType || "application/json"}
                            items={allMediaTypes?.map(mediaType => ({ label: mediaType, value: mediaType }))}
                            onValueChange={(value) => setSelectedMediaType(value)}
                        />
                        <Button tooltip='Configure Content Types' onClick={null} appearance='icon'>
                            <Codicon name='gear' sx={{ marginRight: "4px" }} /> Configure
                        </Button>
                    </>
                }
            />
            {selectedMediaType && (
                <MediaType
                    mediaType={requestBody.content[selectedMediaType]}
                    onMediaTypeChange={handleMediaTypeChange}
                    key={selectedMediaType}
                />
            )}
        </>
    )
}
