/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Dropdown, SidePanelBody, SidePanelTitleContainer, TextArea, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { OpenAPI } from '../../Definitions/ServiceDefinitions';

const HorizontalFieldWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

interface OverviewProps {
    openAPIDefinition: OpenAPI;
}

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

export function Overview(props: OverviewProps) {
    const { openAPIDefinition } = props;
    const defaultValues : InputsFields = {
        title: openAPIDefinition?.info.title,
        version: openAPIDefinition?.info.version,
        summary: openAPIDefinition?.info.summary,
        description: openAPIDefinition?.info.description,
        contactName: openAPIDefinition?.info.contact?.name,
        contactURL: openAPIDefinition?.info.contact?.url,
        contactEmail: openAPIDefinition?.info.contact?.email,
        licenceName: openAPIDefinition?.info.license?.name,
        licenceType: openAPIDefinition?.info.license?.url ? "URL" : "Identifier",
        licenceURL: openAPIDefinition?.info.license?.url,
        licenceIdentifier: openAPIDefinition?.info.license?.identifier,
    };
    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        getValues,
        setValue,
        control,
        watch,
    } = useForm({
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    return (
        <>
            <SidePanelTitleContainer>
                <Typography sx={{ margin: 0 }} variant="h3">Overview</Typography>
            </SidePanelTitleContainer>
            <SidePanelBody>
                <HorizontalFieldWrapper>
                    <TextField
                        label="Name"
                        id="title"
                        sx={{ width: "50%" }}
                        {...register("title")}
                    />
                    <TextField
                        label="API Version"
                        id="API Version"
                        sx={{ width: "50%" }}
                        {...register("version")}
                    />
                </HorizontalFieldWrapper>
                <TextField
                    label="Summary"
                    id="summary"
                    {...register("summary")}
                />
                <TextArea
                    label="Description"
                    id="description"
                    {...register("description")}
                />
                <Typography variant="h4">Contact</Typography>
                <HorizontalFieldWrapper>
                    <TextField
                        placeholder="Name"
                        id="contactName"
                        sx={{ width: "33%" }}
                        {...register("contactName")}
                    />
                    <TextField
                        placeholder='URL'
                        id="contactURL"
                        sx={{ width: "33%" }}
                        {...register("contactURL")}
                    />
                    <TextField
                        placeholder='Email'
                        id="contactEmail"
                        sx={{ width: "33%" }}
                        {...register("contactEmail")}
                    />
                </HorizontalFieldWrapper>
                <Typography variant="h4">Licence</Typography>
                <HorizontalFieldWrapper>
                    <TextField
                        placeholder="Name"
                        id="licenceName"
                        sx={{ width: "33%" }}
                        {...register("licenceName")}
                    />
                    <Dropdown
                        id="licenceType"
                        containerSx={{ width: "33%", gap: 0 }}
                        dropdownContainerSx={{ gap: 0 }}
                        items={[
                            { value: "URL", content: "URL" },
                            { value: "Identifier", content: "Identifier" }
                        ]}
                        {...register("licenceType")}
                    />
                    {/* If licenceType value is URL add licenceURL textField else licenceIdentifier textField */}
                    {/* Fix initial dropdown value */}
                    {watch("licenceType") === "URL" ? (
                        <TextField
                            placeholder='URL'
                            id="licenceURL"
                            sx={{ width: "33%" }}
                            {...register("licenceURL")}
                        />
                    ) : (
                        <TextField
                            placeholder='Identifier'
                            id="licenceIdentifier"
                            sx={{ width: "33%" }}
                            {...register("licenceIdentifier")}
                        />
                    )}
                </HorizontalFieldWrapper>
            </SidePanelBody>
        </>
    )
}
