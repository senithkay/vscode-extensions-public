/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";
import {
    Button,
    TextField,
    CheckBoxGroup,
    SidePanel,
    SidePanelTitleContainer,
    SidePanelBody,
    Codicon,
    CheckBox,
    Divider,
    Dropdown,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { SIDE_PANEL_WIDTH } from "../../../constants";

export type Protocol = "http" | "https";

export type Method = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

export type SequenceOption = "inline" | "named";

export type EditAPIForm = {
    urlStyle: string;
    uriTemplate?: string;
    urlMapping?: string;
    protocol: {
        [K in Protocol]: boolean;
    };
    methods: {
        [K in Method]: boolean;
    };
    inSequence?: string;
    outSequence?: string;
    faultSequence?: string;
};

export type SequenceProps = {
    isOpen: boolean;
    resourceData: EditAPIForm;
    documentUri: string;
    onCancel: () => void;
    onSave: (data: EditAPIForm) => void;
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

const SidePanelBodyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
`;

namespace Section {
    export const Container = styled.div`
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;

    export const Title = styled.h4`
        display: flex;
        align-items: center;
        margin: 0;
        padding: 2px;
        width: 100%;
    `;

    export const IconContainer = styled.div`
        margin-left: auto;
    `;
}

export function EditResourceForm({ resourceData, isOpen, documentUri, onCancel, onSave }: SequenceProps) {
    const { rpcClient } = useVisualizerContext();

    // Form options
    const [urlStyle, setUrlStyle] = useState<string>(resourceData.urlStyle);
    const [uriTemplate, setUriTemplate] = useState<string>(resourceData.uriTemplate || "/");
    const [urlMapping, setUrlMapping] = useState<string>(resourceData.urlMapping || "/");
    const [protocol, setProtocol] = useState<{ [K in Protocol]: boolean }>(resourceData.protocol);
    const [methods, setMethods] = useState<{ [K in Method]: boolean }>(resourceData.methods);

    // Advanced form options
    const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
    const [sequences, setSequences] = useState<string[]>([]);
    const [inSequenceType, setInSequenceType] = useState<SequenceOption>("inline");
    const [inSequence, setInSequence] = useState<string>("");
    const [outSequenceType, setOutSequenceType] = useState<SequenceOption>("inline");
    const [outSequence, setOutSequence] = useState<string>("");
    const [faultSequenceType, setFaultSequenceType] = useState<SequenceOption>("inline");
    const [faultSequence, setFaultSequence] = useState<string>("");

    const [validUriTemplate, setValidUriTemplate] = useState<boolean>(true);
    const [validUrlMapping, setValidUrlMapping] = useState<boolean>(true);

    const isValid =
        validUriTemplate &&
        validUrlMapping &&
        Object.values(protocol).some((value) => value) &&
        Object.values(methods).some((value) => value);

    const isUpdated =
        resourceData.urlStyle !== urlStyle ||
        (resourceData?.uriTemplate ? resourceData.uriTemplate !== uriTemplate : false) ||
        (resourceData?.urlMapping ? resourceData.urlMapping !== urlMapping : false) ||
        resourceData.protocol !== protocol ||
        resourceData.methods !== methods ||
        inSequenceType !== "inline" ||
        outSequenceType !== "inline" ||
        faultSequenceType !== "inline";

    React.useEffect(() => {
        async function fetchSequences() {
            const sequences = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: documentUri,
                resourceType: "sequence",
            });
            if (sequences) {
                const sequenceNames = sequences.resources.map((resource) => resource.name);
                setSequences(sequenceNames);
                setInSequence(sequenceNames[0]);
                setOutSequence(sequenceNames[0]);
                setFaultSequence(sequenceNames[0]);
            }
        }

        fetchSequences();
    }, [isOpen, documentUri]);

    return (
        <SidePanel
            isOpen={isOpen}
            alignmanet="right"
            width={SIDE_PANEL_WIDTH}
            overlay={false}
            sx={{ transition: "all 0.3s ease-in-out" }}
        >
            <SidePanelTitleContainer>
                <div>Edit API Resource</div>
                <Button onClick={onCancel} appearance="icon">
                    <Codicon name="close" />
                </Button>
            </SidePanelTitleContainer>
            <SidePanelBody style={{ overflowY: "scroll" }}>
                <SidePanelBodyWrapper>
                    <h3>API Resource</h3>
                    <CheckBoxContainer>
                        <label>URL Style</label>
                        <VSCodeRadioGroup
                            orientation="vertical"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrlStyle(e.target.value)}
                            value={urlStyle}
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
                                setUriTemplate(text);
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
                                setUrlMapping(text);
                                setValidUrlMapping(text.match(/^\//) ? true : false);
                            }}
                            size={150}
                            errorMsg={validUrlMapping ? undefined : "Prepend / to the URL mapping"}
                        />
                    )}
                    <CheckBoxContainer>
                        <label>Methods</label>
                        <CheckBoxGroup columns={2}>
                            <CheckBox
                                label="GET"
                                value="get"
                                checked={methods.get}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, get: isChecked })}
                            />
                            <CheckBox
                                label="PATCH"
                                value="patch"
                                checked={methods.patch}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, patch: isChecked })}
                            />
                            <CheckBox
                                label="POST"
                                value="post"
                                checked={methods.post}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, post: isChecked })}
                            />
                            <CheckBox
                                label="HEAD"
                                value="head"
                                checked={methods.head}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, head: isChecked })}
                            />
                            <CheckBox
                                label="PUT"
                                value="put"
                                checked={methods.put}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, put: isChecked })}
                            />
                            <CheckBox
                                label="OPTIONS"
                                value="options"
                                checked={methods.options}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, options: isChecked })}
                            />
                            <CheckBox
                                label="DELETE"
                                value="delete"
                                checked={methods.delete}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, delete: isChecked })}
                            />
                        </CheckBoxGroup>
                    </CheckBoxContainer>
                    <CheckBoxContainer>
                        <label>Protocol</label>
                        <CheckBoxGroup columns={2}>
                            <CheckBox
                                label="HTTP"
                                value="http"
                                checked={protocol.http}
                                onChange={(isChecked: boolean) => setProtocol({ ...protocol, http: isChecked })}
                            />
                            <CheckBox
                                label="HTTPS"
                                value="https"
                                checked={protocol.https}
                                onChange={(isChecked: boolean) => setProtocol({ ...protocol, https: isChecked })}
                            />
                        </CheckBoxGroup>
                    </CheckBoxContainer>
                    <Divider />
                    <Section.Container>
                        <Section.Title>
                            Advanced Options
                            <Section.IconContainer>
                                <Codicon
                                    name={showAdvancedOptions ? "chrome-minimize" : "add"}
                                    sx={{
                                        padding: "2px",
                                        borderRadius: "4px",
                                        height: "14px",
                                        backgroundColor: "var(--button-icon-hover-background)",
                                    }}
                                    iconSx={{ fontSize: showAdvancedOptions ? "14px" : "15px" }}
                                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                                />
                            </Section.IconContainer>
                        </Section.Title>
                        {showAdvancedOptions && (
                            <React.Fragment>
                                <CheckBoxContainer>
                                    <label>In Sequence</label>
                                    <VSCodeRadioGroup
                                        orientation="horizontal"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setInSequenceType(e.target.value as SequenceOption)
                                        }
                                        value={inSequenceType}
                                    >
                                        <VSCodeRadio value="inline">In-Line</VSCodeRadio>
                                        <VSCodeRadio value="named">Named</VSCodeRadio>
                                    </VSCodeRadioGroup>
                                </CheckBoxContainer>
                                {inSequenceType === "named" && (
                                    <Dropdown
                                        id="in-sequence-dropdown"                                        
                                        items={sequences.map((sequence, index) => ({
                                            id: index.toString(),
                                            content: sequence,
                                            value: sequence,
                                        }))}
                                        value={inSequence}
                                        onChange={setInSequence}
                                    />
                                )}
                                <CheckBoxContainer>
                                    <label>Out Sequence</label>
                                    <VSCodeRadioGroup
                                        orientation="horizontal"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setOutSequenceType(e.target.value as SequenceOption)
                                        }
                                        value={outSequenceType}
                                    >
                                        <VSCodeRadio value="inline">In-Line</VSCodeRadio>
                                        <VSCodeRadio value="named">Named</VSCodeRadio>
                                    </VSCodeRadioGroup>
                                </CheckBoxContainer>
                                {outSequenceType === "named" && (
                                    <Dropdown
                                        id="out-sequence-dropdown"                                        
                                        items={sequences.map((sequence, index) => ({
                                            id: index.toString(),
                                            content: sequence,
                                            value: sequence,
                                        }))}
                                        value={outSequence}
                                        onChange={setOutSequence}
                                    />
                                )}
                                <CheckBoxContainer>
                                    <label>Fault Sequence</label>
                                    <VSCodeRadioGroup
                                        orientation="horizontal"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setFaultSequenceType(e.target.value as SequenceOption)
                                        }
                                        value={faultSequenceType}
                                    >
                                        <VSCodeRadio value="inline">In-Line</VSCodeRadio>
                                        <VSCodeRadio value="named">Named</VSCodeRadio>
                                    </VSCodeRadioGroup>
                                </CheckBoxContainer>
                                {faultSequenceType === "named" && (
                                    <Dropdown
                                        id="fault-sequence-dropdown"                                        
                                        items={sequences.map((sequence, index) => ({
                                            id: index.toString(),
                                            content: sequence,
                                            value: sequence,
                                        }))}
                                        value={faultSequence}
                                        onChange={setFaultSequence}
                                    />
                                )}
                            </React.Fragment>
                        )}
                    </Section.Container>
                    <ActionContainer>
                        <Button appearance="secondary" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={() =>
                                onSave({
                                    urlStyle,
                                    uriTemplate: urlStyle === "uri-template" ? uriTemplate : undefined,
                                    urlMapping: urlStyle === "url-mapping" ? urlMapping : undefined,
                                    methods,
                                    protocol,
                                    inSequence: inSequenceType === "named" ? inSequence : undefined,
                                    outSequence: outSequenceType === "named" ? outSequence : undefined,
                                    faultSequence: faultSequenceType === "named" ? faultSequence : undefined,
                                })
                            }
                            disabled={!isValid || !isUpdated}
                        >
                            Update
                        </Button>
                    </ActionContainer>
                </SidePanelBodyWrapper>
            </SidePanelBody>
        </SidePanel>
    );
}

