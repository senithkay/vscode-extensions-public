/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from "react";
import {
    Button,
    Dropdown,
    TextField,
    CheckBoxGroup,
    CheckBox,
    SidePanel,
    SidePanelTitleContainer,
    SidePanelBody,
    Codicon,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { SectionWrapper } from "./Commons";
import { VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react";

export type AddAPIFormProps = {
    methods: string[];
    uri_template?: string;
    url_mapping?: string;
};

export type APIResourceWizardProps = {
    isOpen: boolean;
    handleCancel: () => void;
    handleCreateAPI: (data: AddAPIFormProps) => void;
};

const ActionContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 20px;
`;

const CheckBoxContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

export function AddResourceForm({ isOpen, handleCancel, handleCreateAPI }: APIResourceWizardProps) {
    const initialState = {
        urlStyle: "",
        uriTemplate: "/",
        urlMapping: "/",
        protocol: [] as string[],
        methods: [] as string[],
        inSequence: "inline",
        inSequenceRegistryReference: "",
        inSequenceNamedReference: "",
        outSequence: "inline",
        outSequenceRegistryReference: "",
        outSequenceNamedReference: "",
        faultSequence: "inline",
        faultSequenceRegistryReference: "",
        faultSequenceNamedReference: "",
    };
    const [state, setState] = useState(initialState);
    const [validUriTemplate, setValidUriTemplate] = useState(true);
    const [validUrlMapping, setValidUrlMapping] = useState(true);
    const {
        urlStyle,
        uriTemplate,
        urlMapping,
        protocol,
        methods,
        inSequence,
        inSequenceRegistryReference,
        inSequenceNamedReference,
        outSequence,
        outSequenceRegistryReference,
        outSequenceNamedReference,
        faultSequence,
        faultSequenceRegistryReference,
        faultSequenceNamedReference,
    } = state;

    const resetForm = () => {
        setState(initialState);
    };

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const isValid = urlStyle && validUriTemplate && validUrlMapping && protocol.length > 0 && methods.length > 0;

    return (
        <SidePanel isOpen={isOpen} alignmanet="right" sx={{ transition: "all 0.3s ease-in-out" }}>
            <SidePanelTitleContainer>
                <div>Add API Resource</div>
                <Button onClick={handleCancel} appearance="icon">
                    <Codicon name="close" />
                </Button>
            </SidePanelTitleContainer>
            <SidePanelBody>
                <SectionWrapper>
                    <h3>API Resource</h3>
                    <CheckBoxContainer>
                        <label>URL Style</label>
                        <VSCodeRadioGroup
                            orientation="vertical"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setState({ ...state, urlStyle: e.target.value })
                            }
                        >
                            <VSCodeRadio value="none">NONE</VSCodeRadio>
                            <VSCodeRadio value="uri-template">URI_TEMPLATE</VSCodeRadio>
                            <VSCodeRadio value="url-mapping">URL_MAPPING</VSCodeRadio>
                        </VSCodeRadioGroup>
                    </CheckBoxContainer>
                    {urlStyle === "uri-template" && (
                        <TextField
                            id="url-style-uri-template"
                            label="URI Template"
                            value={uriTemplate}
                            onChange={(text: string) => {
                                setState({ ...state, uriTemplate: text });
                                setValidUriTemplate(text.match(/^\//) ? true : false);
                            }}
                            size={150}
                            errorMsg={validUriTemplate ? undefined : "Prepend / to the URI template"}
                        />
                    )}
                    {urlStyle === "url-mapping" && (
                        <TextField
                            id="url-style-url-mapping"
                            label="URL Mapping"
                            value={urlMapping}
                            onChange={(text: string) => {
                                setState({ ...state, urlMapping: text });
                                setValidUrlMapping(text.match(/^\//) ? true : false);
                            }}
                            size={150}
                            errorMsg={validUrlMapping ? undefined : "Prepend / to the URL mapping"}
                        />
                    )}
                    <CheckBoxContainer>
                        <label>Methods</label>
                        <CheckBoxGroup onLabelChange={(labels: string[]) => setState({ ...state, methods: labels })}>
                            <CheckBox label="GET" value="get" />
                            <CheckBox label="POST" value="post" />
                            <CheckBox label="PUT" value="put" />
                            <CheckBox label="DELETE" value="delete" />
                            <CheckBox label="PATCH" value="patch" />
                            <CheckBox label="HEAD" value="head" />
                            <CheckBox label="OPTIONS" value="options" />
                        </CheckBoxGroup>
                    </CheckBoxContainer>
                    <CheckBoxContainer>
                        <label>Protocol</label>
                        <CheckBoxGroup onLabelChange={(labels: string[]) => setState({ ...state, protocol: labels })}>
                            <CheckBox label="http" value="http" />
                            <CheckBox label="https" value="https" />
                        </CheckBoxGroup>
                    </CheckBoxContainer>
                    <Dropdown
                        id="in-sequence"
                        label="In Sequence Type"
                        items={[
                            { id: "inline", value: "inline", content: "Inline" },
                            { id: "registry-reference", value: "registry-reference", content: "Registry Reference" },
                            { id: "named-reference", value: "named-reference", content: "Named Reference" },
                        ]}
                        onChange={(text: string) => setState({ ...state, inSequence: text })}
                        value={inSequence}
                    />
                    {inSequence === "registry-reference" && (
                        <TextField
                            id="in-sequence-registry-reference"
                            label="In Sequence Key"
                            value={inSequenceRegistryReference}
                            onChange={(text: string) => setState({ ...state, inSequenceRegistryReference: text })}
                            size={150}
                        />
                    )}
                    {inSequence === "named-reference" && (
                        <TextField
                            id="in-sequence-named-reference"
                            label="In Sequence Name"
                            value={inSequenceNamedReference}
                            onChange={(text: string) => setState({ ...state, inSequenceNamedReference: text })}
                            size={150}
                        />
                    )}
                    <Dropdown
                        id="out-sequence"
                        label="Out Sequence Type"
                        items={[
                            { id: "inline", value: "inline", content: "Inline" },
                            { id: "registry-reference", value: "registry-reference", content: "Registry Reference" },
                            { id: "named-reference", value: "named-reference", content: "Named Reference" },
                        ]}
                        onChange={(text: string) => setState({ ...state, outSequence: text })}
                        value={outSequence}
                    />
                    {outSequence === "registry-reference" && (
                        <TextField
                            id="out-sequence-registry-reference"
                            label="Out Sequence Key"
                            value={outSequenceRegistryReference}
                            onChange={(text: string) => setState({ ...state, outSequenceRegistryReference: text })}
                            size={150}
                        />
                    )}
                    {outSequence === "named-reference" && (
                        <TextField
                            id="out-sequence-named-reference"
                            label="Out Sequence Name"
                            value={outSequenceNamedReference}
                            onChange={(text: string) => setState({ ...state, outSequenceNamedReference: text })}
                            size={150}
                        />
                    )}
                    <Dropdown
                        id="fault-sequence"
                        label="Fault Sequence Type"
                        items={[
                            { id: "inline", value: "inline", content: "Inline" },
                            { id: "registry-reference", value: "registry-reference", content: "Registry Reference" },
                            { id: "named-reference", value: "named-reference", content: "Named Reference" },
                        ]}
                        onChange={(text: string) => setState({ ...state, faultSequence: text })}
                        value={faultSequence}
                    />
                    {faultSequence === "registry-reference" && (
                        <TextField
                            id="fault-sequence-registry-reference"
                            label="Fault Sequence Key"
                            value={faultSequenceRegistryReference}
                            onChange={(text: string) => setState({ ...state, faultSequenceRegistryReference: text })}
                            size={150}
                        />
                    )}
                    {faultSequence === "named-reference" && (
                        <TextField
                            id="fault-sequence-named-reference"
                            label="Fault Sequence Name"
                            value={faultSequenceNamedReference}
                            onChange={(text: string) => setState({ ...state, faultSequenceNamedReference: text })}
                            size={150}
                        />
                    )}
                    <ActionContainer>
                        <Button appearance="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={() =>
                                handleCreateAPI({
                                    methods,
                                    uri_template: urlStyle === "uri-template" ? uriTemplate : "",
                                    url_mapping: urlStyle === "url-mapping" ? urlMapping : "",
                                })
                            }
                            disabled={!isValid}
                        >
                            Create
                        </Button>
                    </ActionContainer>
                </SectionWrapper>
            </SidePanelBody>
        </SidePanel>
    );
}
