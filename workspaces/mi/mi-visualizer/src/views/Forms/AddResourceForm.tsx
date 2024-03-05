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
    TextField,
    CheckBoxGroup,
    SidePanel,
    SidePanelTitleContainer,
    SidePanelBody,
    Codicon,
    CheckBox,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react";

export type Protocol = "http" | "https";

export type Method = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

export type AddAPIFormProps = {
    position?: any;
    urlStyle: string;
    uriTemplate?: string;
    urlMapping?: string;
    protocol: {
        [K in Protocol]: boolean;
    };
    methods: {
        [K in Method]: boolean;
    };
};

export type APIResourceWizardProps = {
    resourceData?: AddAPIFormProps;
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

const SidePanelBodyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
`;

export function AddResourceForm({ resourceData, isOpen, handleCancel, handleCreateAPI }: APIResourceWizardProps) {
    const defaultProtocol = {
        http: true,
        https: true,
    };
    const defaultMethods = {
        get: false,
        post: false,
        put: false,
        delete: false,
        patch: false,
        head: false,
        options: false,
    };

    const [urlStyle, setUrlStyle] = useState<string>("none");
    const [uriTemplate, setUriTemplate] = useState<string>("/");
    const [urlMapping, setUrlMapping] = useState<string>("/");
    const [protocol, setProtocol] = useState<{ [K in Protocol]: boolean }>(defaultProtocol);
    const [methods, setMethods] = useState<{ [K in Method]: boolean }>(defaultMethods);
    const [validUriTemplate, setValidUriTemplate] = useState<boolean>(true);
    const [validUrlMapping, setValidUrlMapping] = useState<boolean>(true);

    useEffect(() => {
        if (resourceData) {
            setUrlStyle(resourceData.urlStyle);
            setUriTemplate(resourceData.uriTemplate || "/");
            setUrlMapping(resourceData.urlMapping || "/");
            setProtocol(resourceData.protocol);
            setMethods(resourceData.methods);
        }
        return () => {
            setUrlStyle("none");
            setUriTemplate("/");
            setUrlMapping("/");
            setProtocol(defaultProtocol);
            setMethods(defaultMethods);
        };
    }, [isOpen]);

    const isValid =
        validUriTemplate &&
        validUrlMapping &&
        Object.values(protocol).some((value) => value) &&
        Object.values(methods).some((value) => value);
    return (
        <SidePanel isOpen={isOpen} alignmanet="right" sx={{ transition: "all 0.3s ease-in-out" }}>
            <SidePanelTitleContainer>
                <div>Add API Resource</div>
                <Button onClick={handleCancel} appearance="icon">
                    <Codicon name="close" />
                </Button>
            </SidePanelTitleContainer>
            <SidePanelBody>
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
                        <CheckBoxGroup>
                            <CheckBox
                                label="GET"
                                value="get"
                                checked={methods.get}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, get: isChecked })}
                            />
                            <CheckBox
                                label="POST"
                                value="post"
                                checked={methods.post}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, post: isChecked })}
                            />
                            <CheckBox
                                label="PUT"
                                value="put"
                                checked={methods.put}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, put: isChecked })}
                            />
                            <CheckBox
                                label="DELETE"
                                value="delete"
                                checked={methods.delete}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, delete: isChecked })}
                            />
                            <CheckBox
                                label="PATCH"
                                value="patch"
                                checked={methods.patch}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, patch: isChecked })}
                            />
                            <CheckBox
                                label="HEAD"
                                value="head"
                                checked={methods.head}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, head: isChecked })}
                            />
                            <CheckBox
                                label="OPTIONS"
                                value="options"
                                checked={methods.options}
                                onChange={(isChecked: boolean) => setMethods({ ...methods, options: isChecked })}
                            />
                        </CheckBoxGroup>
                    </CheckBoxContainer>
                    <CheckBoxContainer>
                        <label>Protocol</label>
                        <CheckBoxGroup>
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
                    <ActionContainer>
                        <Button appearance="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={() =>
                                handleCreateAPI({
                                    position: resourceData?.position,
                                    urlStyle,
                                    uriTemplate: urlStyle === "uri-template" ? uriTemplate : "",
                                    urlMapping: urlStyle === "url-mapping" ? urlMapping : "",
                                    methods,
                                    protocol,
                                })
                            }
                            disabled={!isValid}
                        >
                            Create
                        </Button>
                    </ActionContainer>
                </SidePanelBodyWrapper>
            </SidePanelBody>
        </SidePanel>
    );
}
