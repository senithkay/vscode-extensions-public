/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Typography } from '@wso2-enterprise/ui-toolkit';
import { Responses as Rs, Response as R, ReferenceObject as Ro } from '../../../Definitions/ServiceDefinitions';
import { useState } from 'react';
import { Tabs, ViewItem } from '../../Tabs/Tabs';
import { Response } from '../Response/Response';
import { ReferenceObject } from '../ReferenceObject/ReferenceObject';

interface ResponsesProps {
    responses: Rs;
    referenceObjects?: string[];
    onResponsesChange: (contact: Rs) => void;
}

const isRefereceObject = (value: Rs | R): value is R => {
    return value.hasOwnProperty('$ref');
};

// Title, Vesrion are mandatory fields
export function Responses(props: ResponsesProps) {
    const { responses, onResponsesChange } = props;
    const [selectedStatusCode, setSelectedStatusCode] = useState<string | undefined>(responses && Object.keys(responses)[0]);

    const handleResponsesChange = (responses: Rs) => {
        onResponsesChange(responses);
    };

    const handleResponseChange = (response: R) => {
        const newResponses: Rs = {
            ...responses,
            [selectedStatusCode]: response
        };
        handleResponsesChange(newResponses);
    };

    const handleReferenceObjectChange = (referenceObject: Ro) => {
        const newResponses: Rs = {
            ...responses,
            [selectedStatusCode]: referenceObject
        };
        handleResponsesChange(newResponses);
    };

    const statusCodes = responses && Object.keys(responses);
    const statusTabViewItems: ViewItem[] = statusCodes && statusCodes.map(statusCode => ({ id: statusCode, name: statusCode }));
    const referenceObjects: string[] = null; // TODO: Use context to find the reference objects

    return (
        <>
            {statusTabViewItems?.length > 0 ? (
                <Tabs views={statusTabViewItems} currentViewId={selectedStatusCode} onViewChange={setSelectedStatusCode}>
                    {responses && Object.keys(responses)?.map((status) => (
                        <div id={status} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {isRefereceObject(responses[status]) ? (
                                    <ReferenceObject
                                        id={0}
                                        referenceObject={responses[status] as Ro}
                                        referenceObjects={referenceObjects}
                                        onRefernceObjectChange={(referenceObject) => handleReferenceObjectChange(referenceObject)}
                                    />
                            ) : (
                                <Response
                                    response={responses[status] as R}
                                    onResponseChange={(response) => handleResponseChange(response)}
                                />
                            )}
                        </div>
                    ))}
                </Tabs>
            ) : (<Typography sx={{ margin: 0, fontWeight: "lighter" }} variant='body3'>No response statuses.</Typography>)}
        </>
    );
}
