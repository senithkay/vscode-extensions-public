/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { MediaType as M, Response as R, Schema } from '../../../Definitions/ServiceDefinitions';
import { useState } from 'react';
import { SubSectionWrapper } from '../Contact/Contact';
import { useVisualizerContext } from '@wso2-enterprise/api-designer-rpc-client';
import { MediaType } from '../MediaType/MediaType';
import { CodeTextArea } from '../../CodeTextArea/CodeTextArea';
import { Headers } from '../Headers/Headers';
import SectionHeader from '../SectionHeader/SectionHeader';
import { Button, Codicon, Dropdown } from '@wso2-enterprise/ui-toolkit';

interface ResponseProps {
    response: R;
    onResponseChange: (response: R) => void;
}

// Title, Vesrion are mandatory fields
export function Response(props: ResponseProps) {
    const { response, onResponseChange } = props;
    const { rpcClient } = useVisualizerContext();
    const [selectedMediaType, setSelectedMediaType] = useState<string | undefined>(Object.keys(response?.content)[0]);
    const [description, setDescription] = useState<string | undefined>(response?.description);

    const handleResponsesChange = (response: R) => {
        onResponseChange(response);
    };

    const handleImportJSON = () => {
        rpcClient.getApiDesignerVisualizerRpcClient().importJSON().then(resp => {
            if (resp) {
                const schema: Schema = resp;
                const newResponse: R = {
                    ...response,
                    [selectedMediaType]: {
                        ...response[selectedMediaType],
                        schema: schema
                    }
                };
                handleResponsesChange(newResponse);
            }
        })
    };
    const handleMediaTypeChange = (mediaType: M) => {
        const newResponse: R = {
            ...response,
            content: {
                ...response.content,
                [selectedMediaType]: mediaType
            }
        };
        handleResponsesChange(newResponse);
    }
    const handleDescriptionChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(evt.target.value);
        handleResponsesChange({ ...response, description: evt.target.value });
    };
    const allMediaTypes = Object.keys(response?.content);

    return (
        <SubSectionWrapper>
            <CodeTextArea
                value={description}
                onChange={handleDescriptionChange}
                resize="vertical"
                growRange={{ start: 2, offset: 10 }}
            />
            <Headers
                headers={response?.headers}
                onHeadersChange={(headers) => handleResponsesChange({ ...response, headers })}
                title='Headers'
            />
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
                            items={allMediaTypes.map(mediaType => ({ label: mediaType, value: mediaType }))}
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
                    mediaType={response?.content[selectedMediaType]}
                    onMediaTypeChange={handleMediaTypeChange}
                    key={selectedMediaType}
                />
            )}
        </SubSectionWrapper>
    )
}
