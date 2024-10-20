/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, Dropdown, FormGroup, TextArea, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { OpenAPI } from '../../Definitions/ServiceDefinitions';
import { useState } from 'react';
import { CodeTextArea } from '../CodeTextArea/CodeTextArea';
import { useVisualizerContext } from '@wso2-enterprise/api-designer-rpc-client';

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
export const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export const SubSectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding-top: 5px;
    gap: 5px;
`;

interface OverviewProps {
    openAPIDefinition: OpenAPI;
    isNewFile?: boolean;
    onOpenApiDefinitionChange: (openAPIDefinition: OpenAPI) => void;
}

const moreOptions = ["Summary", "Description", "Contact", "License"];

// Title, Vesrion are mandatory fields
export function Overview(props: OverviewProps) {
    const { openAPIDefinition, isNewFile } = props;
    const { rpcClient } = useVisualizerContext();
    const [description, setDescription] = useState<string>(openAPIDefinition?.info?.description || "");
    let selectedOptions: string[] = [];
    if (openAPIDefinition?.info?.summary || openAPIDefinition?.info?.summary === "") {
        selectedOptions.push("Summary");
    }
    if (openAPIDefinition?.info?.description || openAPIDefinition?.info?.description === "") {
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
        const clonedApiDefinition = { ...openAPIDefinition };
        if (options.includes("Summary") && !openAPIDefinition.info?.summary) {
            clonedApiDefinition.info.summary = "";
        } else if (!options.includes("Summary") && (openAPIDefinition.info?.summary || openAPIDefinition.info?.summary === "")) {
            delete clonedApiDefinition.info.summary;
        }
        if (options.includes("License") && !openAPIDefinition.info?.license) {
            clonedApiDefinition.info.license = { name: "", url: "" };
        } else if (!options.includes("License") && openAPIDefinition.info?.license) {
            delete clonedApiDefinition.info.license;
        }
        if (options.includes("Contact") && !openAPIDefinition.info?.contact) {
            clonedApiDefinition.info.contact = { name: "", url: "", email: "" };
        } else if (!options.includes("Contact") && openAPIDefinition.info?.contact) {
            delete clonedApiDefinition.info.contact;
        }
        if (options.includes("Description") && !openAPIDefinition.info?.description) {
            clonedApiDefinition.info.description = "";
        } else if (!options.includes("Description") && (openAPIDefinition.info?.description || openAPIDefinition.info?.description === "")) {
            delete clonedApiDefinition.info.description;
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
        props.onOpenApiDefinitionChange(clonedApiDefinition);
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
        setDescription(description);
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

    const onConfigureClick=()=>{
        rpcClient.selectQuickPickItems({
            title:"Select sections",
            items: moreOptions.map(item=>({label:item, picked: selectedOptions.includes(item)}))
        }).then(resp=>{
            if(resp){
                handleOptionChange(resp.map(item=>item.label))
            }
        })
    }

    return (
        <>
            <PanelBody>
                <HorizontalFieldWrapper>
                    <Typography sx={{ margin: 0, marginTop: 0, flex: 1 }} variant="h2">Overview</Typography>
                    <Button tooltip='Select sections' onClick={onConfigureClick} appearance='icon'>
                        <Codicon name='gear' sx={{marginRight:"4px"}}/>
                        Configure
                    </Button>
                </HorizontalFieldWrapper>
                <HorizontalFieldWrapper>
                    <TextField
                        label="Title"
                        id="title"
                        sx={{ width: "50%" }}
                        value={openAPIDefinition?.info?.title}
                        onTextChange={handleTitleChange}
                        autoFocus={isNewFile}
                    />
                    <TextField
                        label="API Version"
                        id="API Version"
                        sx={{ width: "50%" }}
                        value={openAPIDefinition?.info?.version}
                        onTextChange={handleApiVersionChange}
                    />
                </HorizontalFieldWrapper>
                {selectedOptions.includes("Summary") && (
                    <TextField
                        label="Summary"
                        id="summary"
                        sx={{ width: "100%" }}
                        value={openAPIDefinition?.info?.summary}
                        onTextChange={handleSummaryChange}
                    />
                )}
                {selectedOptions.includes("Description") && (
                    <CodeTextArea
                        label='Decription'
                        value={description}
                        onChange={(evt) => handleDescriptionChange(evt.target.value)}
                        resize="vertical"
                        growRange={{ start: 5, offset: 10 }}
                    />
                )}
                {openAPIDefinition?.info?.contact && (
                    <>
                        <Typography sx={{ margin: 0 }} variant="h3">Contact</Typography>
                        <ContentWrapper>
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
                        </ContentWrapper>
                    </>
                )}
                {openAPIDefinition?.info?.license && (
                    <ContentWrapper>
                        <Typography sx={{ margin: 0 }} variant="h3">License</Typography>
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
                    </ContentWrapper>
                )}
            </PanelBody>
        </>
    )
}
