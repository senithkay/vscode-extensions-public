/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon } from '@wso2-enterprise/ui-toolkit';
import { Headers as Hs, HeaderDefinition as H, ReferenceObject as R } from '../../../Definitions/ServiceDefinitions';
import SectionHeader from '../SectionHeader/SectionHeader';
import { Header } from '../Header/Header';
import { ReferenceObject } from '../ReferenceObject/ReferenceObject';

interface HeadersProps {
    headers : Hs;
    title?: string;
    onHeadersChange: (headers: Hs) => void;
}

const isReferenceObject = (obj: H | R): obj is R => {
    return obj && typeof obj === 'object' && '$ref' in obj;
}

// Title, Vesrion are mandatory fields
export function Headers(props: HeadersProps) {
    const { headers, title, onHeadersChange } = props;

    const handleHeaderChange = (headers: Hs) => {
        onHeadersChange(headers);
    };

    const addNewHeader = () => {
        const newHeader: H = {
            schema: {
                type: "string"
            }
        };
        const headerName = headers ? `header${Object.keys(headers).length + 1}` : "header1";
        const modiefiedHeaders = { ...headers, [headerName]: newHeader };
        handleHeaderChange(modiefiedHeaders);
    };
    const getAddParamButton = () => (
        <Button appearance="icon" onClick={() => addNewHeader()}>
            <Codicon sx={{ marginRight: 5 }} name="add" />
            Add Parameter
        </Button>
    );
    const addNewReferenceObject = () => {
        const newReferenceObject: R = {
            $ref: "",
            summary: "",
            description: ""
        };
        const referenceObjectName = headers ? `referenceObject${Object.keys(headers).length + 1}` : "referenceObject1";
        const modiefiedHeaders = { ...headers, [referenceObjectName]: newReferenceObject };
        handleHeaderChange(modiefiedHeaders);
    }
    const getAddReferenceObjectButton = () => (
        <Button appearance="icon" onClick={() => addNewReferenceObject()}>
            <Codicon sx={{ marginRight: 5 }} name="add" />
            Add Reference
        </Button>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <SectionHeader title={title} actionButtons={[getAddParamButton(), getAddReferenceObjectButton()]} />
            {headers && Object.entries(headers).map(([headerName, header], index) => (
                <div key={index} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {isReferenceObject(header) ? (
                        <ReferenceObject
                            id={index}
                            referenceObject={header as R}
                            referenceObjects={null} // TODO: Use context to find the reference objects
                            onRefernceObjectChange={(referenceObject) => handleHeaderChange({ ...headers, [headerName]: referenceObject })}
                            onRemoveReferenceObject={(id) => {
                                const headersCopy = { ...headers };
                                delete headersCopy[headerName];
                                handleHeaderChange(headersCopy);
                            }}
                        />
                    ) : (
                        <Header
                            id={index}
                            header={header as H}
                            name={headerName}
                            onHeaderChange={(h) => handleHeaderChange({ ...headers, [headerName]: h })}
                            onRemoveHeader={(id) => {
                                const headersCopy = { ...headers };
                                delete headersCopy[headerName];
                                handleHeaderChange(headersCopy);
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}
