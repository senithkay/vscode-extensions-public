/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DIRECTORY_MAP } from "@wso2-enterprise/ballerina-core";
import {
    Button,
    LocationSelector,
    TextField,
    Typography,
    View,
    ViewContent,
    ErrorBanner,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { BIHeader } from "../BIHeader";
import ButtonCard from "../../../components/ButtonCard";
import { BodyText } from "../../styles";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ServiceWizard } from "../ServiceWizard";

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 600px;
`;

const Container = styled.div`
    display: "flex";
    flex-direction: "column";
    gap: 10;
    margin: 20px;
`;

const ButtonWrapper = styled.div`
    margin-top: 20px;
    width: 130px;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 20px;
    width: 100%;
`;

const schema = yup.object({
    name: yup.string().when("$selectedModule", {
        is: "Scratch",
        then: () =>
            yup
                .string()
                .required("Service name is required")
                .matches(/^\S*$/, "Service name cannot contain spaces")
                .matches(/^[a-zA-Z]/, "Service name must start with a letter")
                .matches(/^[a-zA-Z0-9]*$/, "Service name cannot contain special characters"),
        otherwise: () => yup.string().optional(),
    }),
    path: yup
        .string()
        .required("Path is required")
        .matches(/^\//, "Path must start with /")
        .matches(
            /^[\/a-zA-Z0-9\-_\/]*$/,
            "Path can only contain letters, numbers, hyphens, underscores and forward slashes"
        ),
    port: yup
        .string()
        .required("Port is required")
        .matches(/^\d+$/, "Port must be a number")
        .test(
            "port-range",
            "Port must be between 0 and 65535",
            (value) => !value || (parseInt(value) >= 0 && parseInt(value) <= 65535)
        ),
});

type ServiceType = "Scratch" | "OAS";

export interface HttpFormProps {
}

export function ServiceHttpOASForm(props: HttpFormProps) {
    const { rpcClient } = useRpcContext();
    const [specPath, setSpecPath] = useState("");
    const [selectedModule, setSelectedModule] = useState<ServiceType>("OAS");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            path: "/",
            port: "9090",
        },
        mode: "onChange",
        context: { selectedModule },
    });

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        const res = await rpcClient.getBIDiagramRpcClient().createComponent({
            type: DIRECTORY_MAP.SERVICES,
            serviceType: {
                name: data.name,
                path: data.path,
                port: data.port,
                specPath: specPath,
            },
        });
        setIsLoading(false);
        setError(res.error);
    };

    const handleFileSelect = async () => {
        const projectDirectory = await rpcClient.getCommonRpcClient().selectFileOrDirPath({ isFile: true });
        setSpecPath(projectDirectory.path);
    };

    const formHasError = () => {
        if (isLoading) {
            return true;
        }
        if (selectedModule === "Scratch") {
            return Object.keys(errors).length > 0;
        }
        if (selectedModule === "OAS") {
            return !specPath || !!errors.port?.message;
        }
        return false;
    };

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Container>
                    <FormContainer>
                        <Typography variant="h2">Create an HTTP Service</Typography>
                        <BodyText>
                            Import an OpenAPI Specification(OAS) file to set it up quickly.
                        </BodyText>
                        <>
                            <LocationSelector
                                sx={{ marginTop: 20 }}
                                label="Select Open API Spec File"
                                btnText="Select File"
                                selectedFile={specPath}
                                onSelect={handleFileSelect}
                            />
                            <TextField
                                {...register("port")}
                                sx={{ marginTop: 20 }}
                                label="Port"
                                placeholder="Enter service port"
                                errorMsg={errors.port?.message}
                            />
                            <ButtonWrapper>
                                <Button disabled={formHasError()} onClick={handleSubmit(onSubmit)} appearance="primary">
                                    Create Service
                                </Button>
                            </ButtonWrapper>
                        </>
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}
