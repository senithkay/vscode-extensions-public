/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Dropdown, FormGroup, SidePanelTitleContainer, TextArea, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import * as yup from "yup";
import { OpenAPI } from '../../Definitions/ServiceDefinitions';
import { OptionPopup } from '../OptionPopup/OptionPopup';

const HorizontalFieldWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

export const PanelBody = styled.div`
    height: calc(100% - 87px);
    overflow-y: auto;
    padding: 16px;
    gap: 15px;
    display: flex;
    flex-direction: column;
`;

interface OverviewProps {
    openAPIDefinition: OpenAPI;
    onOpenApiDefinitionChange: (openAPIDefinition: OpenAPI) => void;
    onViewSwagger?: () => void;
}

const moreOptions = ["Summary", "Description", "Contact", "License"];

const schema = yup.object({
    title: yup.string(),
    version: yup.string(),
    summary: yup.string(),
    description: yup.string(),
    contactName: yup.string(),
    contactURL: yup.string(),
    contactEmail: yup.string(),
    licenceName: yup.string(),
    licenceType: yup.string(),
    licenceURL: yup.string(),
    licenceIdentifier: yup.string(),
});

type InputsFields = {
    title: string;
    version: string;
    summary: string;
    description: string;
    contactName: string;
    contactURL: string;
    contactEmail: string;
    licenceName: string;
    licenceType: string;
    licenceURL: string;
    licenceIdentifier: string;
};

// Title, Vesrion are mandatory fields
export function Overview(props: OverviewProps) {
    const { openAPIDefinition, onViewSwagger } = props;
    let selectedOptions: string[] = [];
    if (openAPIDefinition?.info?.summary) {
        selectedOptions.push("Summary");
    }
    if (openAPIDefinition?.info?.description) {
        selectedOptions.push("Description");
    }
    if (openAPIDefinition?.info?.license) {
        selectedOptions.push("License");
    }
    if (openAPIDefinition?.info?.contact) {
        selectedOptions.push("Contact");
    }
    // TODO: Implement the same for other fields
    // if (openAPIDefinition.servers) {
    //     selectedOptions.push("Servers");
    // }
    // if (openAPIDefinition.security) {
    //     selectedOptions.push("Security");
    // }

    const handleOptionChange = (options: string[]) => {
        if (options.includes("Summary") && !openAPIDefinition.info?.summary) {
            openAPIDefinition.info.summary = "";
        } else if (!options.includes("Summary") && openAPIDefinition.info?.summary) {
            delete openAPIDefinition.info.summary;
        }
        if (options.includes("License") && !openAPIDefinition.info?.license) {
            openAPIDefinition.info.license = { name: "", url: "" };
        } else if (!options.includes("License") && openAPIDefinition.info?.license) {
            delete openAPIDefinition.info.license;
        }
        if (options.includes("Contact") && !openAPIDefinition.info?.contact) {
            openAPIDefinition.info.contact = { name: "", url: "", email: "" };
        } else if (!options.includes("Contact") && openAPIDefinition.info?.contact) {
            delete openAPIDefinition.info.contact;
        }
        if (options.includes("Description") && !openAPIDefinition.info?.description) {
            openAPIDefinition.info.description = "";
        } else if (!options.includes("Description") && openAPIDefinition.info?.description) {
            delete openAPIDefinition.info.description;
        }
        // TODO: Implement the same for other fields
        // if (options.includes("Servers") && !openAPIDefinition.servers) {
        //     openAPIDefinition.servers = [];
        // } else if (!options.includes("Servers") && openAPIDefinition.servers) {
        //     delete openAPIDefinition.servers;
        // }
        // if (options.includes("Security") && !openAPIDefinition.security) {
        //     openAPIDefinition.security = [];
        // } else if (!options.includes("Security") && openAPIDefinition.security) {
        //     delete openAPIDefinition.security;
        // }
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };

    const handleTitleChange = (title: string) => {
        openAPIDefinition.info.title = title;
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };
    const handleSummaryChange = (summary: string) => {
        openAPIDefinition.info.summary = summary;
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };
    const handleDescriptionChange = (description: string) => {
        openAPIDefinition.info.description = description;
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };
    const handleContactNameChange = (contactName: string) => {
        openAPIDefinition.info.contact.name = contactName;
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };
    const handleContactURLChange = (contactURL: string) => {
        openAPIDefinition.info.contact.url = contactURL;
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };
    const handleContactEmailChange = (contactEmail: string) => {
        openAPIDefinition.info.contact.email = contactEmail;
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };
    const handleLicenceNameChange = (licenceName: string) => {
        openAPIDefinition.info.license.name = licenceName;
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };
    const handleLicenceTypeChange = (licenceType: string) => {
        if (licenceType === "URL") {
            openAPIDefinition.info.license.url = openAPIDefinition.info.license.identifier;
            delete openAPIDefinition.info.license.identifier;
        } else {
            openAPIDefinition.info.license.identifier = openAPIDefinition.info.license.url;
            delete openAPIDefinition.info.license.url;
        }
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };
    const handleLicenceURLChange = (licenceURL: string) => {
        openAPIDefinition.info.license.url = licenceURL;
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };
    const handleLicenceIdentifierChange = (licenceIdentifier: string) => {
        openAPIDefinition.info.license.identifier = licenceIdentifier;
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };
    const handleApiVersionChange = (version: string) => {
        openAPIDefinition.info.version = version;
        props.onOpenApiDefinitionChange(openAPIDefinition);
    };

    return (
        <>
            <SidePanelTitleContainer>
                <Typography sx={{ margin: 0 }} variant="h1">Overview</Typography>
                <OptionPopup options={moreOptions} selectedOptions={selectedOptions} onViewSwagger={onViewSwagger} onOptionChange={handleOptionChange} hideDelete />
            </SidePanelTitleContainer>
            <PanelBody>
                <HorizontalFieldWrapper>
                    <TextField
                        label="Title"
                        id="title"
                        sx={{ width: "50%" }}
                        value={openAPIDefinition?.info?.title}
                        onTextChange={handleTitleChange}
                    />
                    <TextField
                        label="API Version"
                        id="API Version"
                        sx={{ width: "50%" }}
                        value={openAPIDefinition?.info?.version}
                        onTextChange={handleApiVersionChange}
                    />
                </HorizontalFieldWrapper>
                { selectedOptions.includes("Summary") && (
                    <TextField
                        label="Summary"
                        id="summary"
                        sx={{ width: "100%" }}
                        value={openAPIDefinition?.info?.summary}
                        onTextChange={handleSummaryChange}
                    />
                )}
                { selectedOptions.includes("Description") && (
                    <TextArea
                        label="Description"
                        id="description"
                        rows={4}
                        value={openAPIDefinition?.info?.description}
                        onTextChange={handleDescriptionChange}
                    />
                )}
                {openAPIDefinition?.info?.contact && (
                    <FormGroup title="Contact" isCollapsed={false}>
                        <HorizontalFieldWrapper>
                            <TextField
                                placeholder="Name"
                                id="contactName"
                                sx={{ width: "33%" }}
                                value={openAPIDefinition?.info?.contact.name}
                                onTextChange={handleContactNameChange}
                            />
                            <TextField
                                placeholder='URL'
                                id="contactURL"
                                sx={{ width: "33%" }}
                                value={openAPIDefinition?.info?.contact.url}
                                onTextChange={handleContactURLChange}
                            />
                            <TextField
                                placeholder='Email'
                                id="contactEmail"
                                sx={{ width: "33%" }}
                                value={openAPIDefinition?.info?.contact.email}
                                onTextChange={handleContactEmailChange}
                            />
                        </HorizontalFieldWrapper>
                    </FormGroup>
                )}

                {openAPIDefinition?.info?.license && (
                    <FormGroup title="License" isCollapsed={false}>
                        <HorizontalFieldWrapper>
                            <TextField
                                placeholder="Name"
                                id="licenceName"
                                sx={{ width: "33%" }}
                                value={openAPIDefinition?.info?.license.name}
                                onTextChange={handleLicenceNameChange}
                            />
                            <Dropdown
                                id="licenceType"
                                containerSx={{ width: "33%", gap: 0 }}
                                dropdownContainerSx={{ gap: 0 }}
                                items={[
                                    { value: "URL", content: "URL" },
                                    { value: "Identifier", content: "Identifier" }
                                ]}
                                value={openAPIDefinition?.info?.license.url ? "URL" : "Identifier"}
                                onValueChange={handleLicenceTypeChange}
                            />
                            {openAPIDefinition?.info.license.url ? (
                                <TextField
                                    placeholder='URL'
                                    id="licenceURL"
                                    sx={{ width: "33%" }}
                                    value={openAPIDefinition?.info?.license.url}
                                    onTextChange={handleLicenceURLChange}
                                />
                            ) : (
                                <TextField
                                    placeholder='Identifier'
                                    id="licenceIdentifier"
                                    sx={{ width: "33%" }}
                                    value={openAPIDefinition?.info?.license.identifier}
                                    onTextChange={handleLicenceIdentifierChange}
                                />
                            )}
                        </HorizontalFieldWrapper>
                    </FormGroup>
                )}
                {openAPIDefinition?.info?.license && (
                    <FormGroup title="License" isCollapsed={false}>
                        <HorizontalFieldWrapper>
                            <TextField
                                placeholder="Name"
                                id="licenceName"
                                sx={{ width: "33%" }}
                                value={openAPIDefinition?.info?.license.name}
                                onTextChange={handleLicenceNameChange}
                            />
                            <Dropdown
                                id="licenceType"
                                containerSx={{ width: "33%", gap: 0 }}
                                dropdownContainerSx={{ gap: 0 }}
                                items={[
                                    { value: "URL", content: "URL" },
                                    { value: "Identifier", content: "Identifier" }
                                ]}
                                value={openAPIDefinition?.info?.license.url ? "URL" : "Identifier"}
                                onValueChange={handleLicenceTypeChange}
                            />
                            {openAPIDefinition?.info?.license.url ? (
                                <TextField
                                    placeholder='URL'
                                    id="licenceURL"
                                    sx={{ width: "33%" }}
                                    value={openAPIDefinition?.info.license.url}
                                    onTextChange={handleLicenceURLChange}
                                />
                            ) : (
                                <TextField
                                    placeholder='Identifier'
                                    id="licenceIdentifier"
                                    sx={{ width: "33%" }}
                                    value={openAPIDefinition?.info?.license.identifier}
                                    onTextChange={handleLicenceIdentifierChange}
                                />
                            )}
                        </HorizontalFieldWrapper>
                    </FormGroup>
                )}
            </PanelBody>
        </>
    )
}
