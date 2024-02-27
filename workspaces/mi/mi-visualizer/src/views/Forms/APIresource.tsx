/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";
import { Button, Codicon, Dropdown, TextField } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { SectionWrapper } from "./Commons";

type CollapsableWrapperProps = React.ComponentPropsWithoutRef<"div"> & {
    title: string;
};

type Methods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export type APIResourceWizardProps = {
    handleCancel: () => void;
    handleCreateAPI: () => void;
};

const WizardContainer = styled.div`
    width: 95%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
`;

const ActionContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 20px;
`;

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;

const SubTitleWrapper = styled.div`
    display: flex;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    padding: 4px 0;
    background-color: var(--background);
`;

const CollapsableContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const CollapsableWrapper = ({ title, children }: CollapsableWrapperProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);

    return (
        <CollapsableContainer>
            <SubTitleWrapper>
                <Codicon name={isOpen ? "chevron-down" : "chevron-right"} onClick={() => setIsOpen(!isOpen)} />
                <React.Fragment>{title}</React.Fragment>
            </SubTitleWrapper>
            {isOpen && children}
        </CollapsableContainer>
    );
};

export function APIResourceWizard({ handleCancel, handleCreateAPI }: APIResourceWizardProps) {
    const [urlStyle, setUrlStyle] = useState<string>("path");
    const [protocol, setProtocol] = useState<string>("http-https");
    const [methods, setMethods] = useState<Methods[]>(["GET"]);
    const [inSequence, setInSequence] = useState<string>("inline");
    const [inSequenceRegistryReference, setInSequenceRegistryReference] = useState<string>();
    const [inSequenceNamedReference, setInSequenceNamedReference] = useState<string>();
    const [outSequence, setOutSequence] = useState<string>("inline");
    const [outSequenceRegistryReference, setOutSequenceRegistryReference] = useState<string>();
    const [outSequenceNamedReference, setOutSequenceNamedReference] = useState<string>();
    const [faultSequence, setFaultSequence] = useState<string>("inline");
    const [faultSequenceRegistryReference, setFaultSequenceRegistryReference] = useState<string>();
    const [faultSequenceNamedReference, setFaultSequenceNamedReference] = useState<string>();

    const isValid =
        urlStyle.length > 0 &&
        protocol.length > 0 &&
        methods.length > 0 &&
        inSequence.length > 0 &&
        outSequence.length > 0 &&
        faultSequence.length > 0;

    return (
        <WizardContainer>
            <TitleWrapper>
                <h2>New API Resource</h2>
            </TitleWrapper>
            <SectionWrapper>
                <h3>API Resource</h3>
                <CollapsableWrapper title="Basic">
                    <Dropdown
                        id="url-style"
                        label="URL Style"
                        items={[
                            { id: "none", value: "none", content: "NONE" },
                            { id: "uri-template", value: "uri-template", content: "URI_TEMPLATE" },
                            { id: "url-mapping", value: "url-mapping", content: "URL_MAPPING" },
                        ]}
                        onChange={(value: string) => setUrlStyle(value)}
                        value={urlStyle}
                    />
                    <Dropdown
                        id="protocol"
                        label="Protocol"
                        items={[
                            { id: "http-https", value: "http-https", content: "http,https" },
                            { id: "http", value: "http", content: "http" },
                            { id: "https", value: "https", content: "https" },
                        ]}
                        onChange={(value: string) => setProtocol(value)}
                        value={protocol}
                    />
                </CollapsableWrapper>
                <CollapsableWrapper title="InSequence">
                    <Dropdown
                        id="in-sequence"
                        label="In Sequence Type"
                        items={[
                            { id: "inline", value: "inline", content: "Inline" },
                            { id: "registry-reference", value: "registry-reference", content: "Registry Reference" },
                            { id: "named-reference", value: "named-reference", content: "Named Reference" },
                        ]}
                        onChange={(value: string) => setInSequence(value)}
                        value={inSequence}
                    />
                    {inSequence === "registry-reference" && (
                        <TextField
                            id="in-sequence-registry-reference"
                            label="In Sequence Key"
                            value={inSequenceRegistryReference}
                            onChange={(text: string) => setInSequenceRegistryReference(text)}
                            size={150}
                        />
                    )}
                    {inSequence === "named-reference" && (
                        <TextField
                            id="in-sequence-named-reference"
                            label="In Sequence Name"
                            value={inSequenceNamedReference}
                            onChange={(text: string) => setInSequenceNamedReference(text)}
                            size={150}
                        />
                    )}
                </CollapsableWrapper>
                <CollapsableWrapper title="OutSequence">
                    <Dropdown
                        id="out-sequence"
                        label="Out Sequence Type"
                        items={[
                            { id: "inline", value: "inline", content: "Inline" },
                            { id: "registry-reference", value: "registry-reference", content: "Registry Reference" },
                            { id: "named-reference", value: "named-reference", content: "Named Reference" },
                        ]}
                        onChange={(value: string) => setOutSequence(value)}
                        value={outSequence}
                    />
                    {outSequence === "registry-reference" && (
                        <TextField
                            id="out-sequence-registry-reference"
                            label="Out Sequence Key"
                            value={outSequenceRegistryReference}
                            onChange={(text: string) => setOutSequenceRegistryReference(text)}
                            size={150}
                        />
                    )}
                    {outSequence === "named-reference" && (
                        <TextField
                            id="out-sequence-named-reference"
                            label="Out Sequence Name"
                            value={outSequenceNamedReference}
                            onChange={(text: string) => setOutSequenceNamedReference(text)}
                            size={150}
                        />
                    )}
                </CollapsableWrapper>
                <CollapsableWrapper title="FaultSequence">
                    <Dropdown
                        id="fault-sequence"
                        label="Fault Sequence Type"
                        items={[
                            { id: "inline", value: "inline", content: "Inline" },
                            { id: "registry-reference", value: "registry-reference", content: "Registry Reference" },
                            { id: "named-reference", value: "named-reference", content: "Named Reference" },
                        ]}
                        onChange={(value: string) => setFaultSequence(value)}
                        value={faultSequence}
                    />
                    {faultSequence === "registry-reference" && (
                        <TextField
                            id="fault-sequence-registry-reference"
                            label="Fault Sequence Key"
                            value={faultSequenceRegistryReference}
                            onChange={(text: string) => setFaultSequenceRegistryReference(text)}
                            size={150}
                        />
                    )}
                    {faultSequence === "named-reference" && (
                        <TextField
                            id="fault-sequence-named-reference"
                            label="Fault Sequence Name"
                            value={faultSequenceNamedReference}
                            onChange={(text: string) => setFaultSequenceNamedReference(text)}
                            size={150}
                        />
                    )}
                </CollapsableWrapper>
            </SectionWrapper>
            <ActionContainer>
                <Button appearance="secondary" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button appearance="primary" onClick={handleCreateAPI} disabled={!isValid}>
                    Create
                </Button>
            </ActionContainer>
        </WizardContainer>
    );
}
