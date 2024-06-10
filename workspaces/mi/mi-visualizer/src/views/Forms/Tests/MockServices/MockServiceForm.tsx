/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { yupResolver } from "@hookform/resolvers/yup";
import { EVENT_TYPE, MACHINE_VIEW, MockService, UpdateTestSuiteResponse } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, ComponentCard, FormActions, FormView, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

export interface MockServiceFormProps {
    filePath?: string;
    mockService?: MockService;
    availableMockServices?: string[];
    onGoBack?: () => void;
    onSubmit?: (values: any) => void;
}

const cardStyle = {
    display: "block",
    margin: "15px 0",
    padding: "0 15px 15px 15px",
    width: "auto",
    cursor: "auto"
};

export function MockServiceForm(props: MockServiceFormProps) {
    const { rpcClient } = useVisualizerContext();
    const [isLoaded, setIsLoaded] = useState(false);
    const isUpdate = !!props.mockService || !!props.filePath;
    const [availableMockServices, setAvailableMockServices] = useState(props.availableMockServices || []);

    // Schema
    const schema = yup.object({
        name: yup.string().required("Test case name is required").notOneOf(availableMockServices, "Mock service name already exists"),
        endpointName: yup.string().required("Endpoint name is required"),
        servicePort: yup.number().required("Service port is required"),
        serviceContext: yup.string().required("Service context is required").matches(/^\//, "Service context should start with '/'")
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty, dirtyFields },
        register,
        watch,
        getValues,
        setValue,
        reset
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        (async () => {
            const mockServices = await rpcClient.getMiDiagramRpcClient().getAllMockServices();
            const mockServicesNames = mockServices.mockServices.map((mockService: any) => mockService.name);
            setAvailableMockServices([...availableMockServices, ...mockServicesNames]);

            if (isUpdate) {
                const mockService = props.mockService;
                reset({
                    name: mockService?.name,
                    endpointName: mockService?.endpointName,
                    servicePort: mockService?.servicePort,
                    serviceContext: mockService?.serviceContext
                });
                setIsLoaded(true);
                return;
            }

            reset({
                name: "",
                endpointName: "",
                servicePort: 0,
                serviceContext: "/"
            });
            setIsLoaded(true);
        })();
    }, []);

    const handleGoBack = () => {
        if (props.onGoBack) {
            props.onGoBack();
            return;
        }
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const submitForm = async (values: any) => {
        if (props.onSubmit) {
            delete values.filePath;
            props.onSubmit(values);
            return;
        }
        rpcClient.getMiDiagramRpcClient().updateMockService({ path: props.filePath, ...values }).then((resp: UpdateTestSuiteResponse) => {
            openOverview();
        });
    }

    if (!isLoaded) {
        return <div>Loading...</div>
    }

    return (
        <FormView title={`${isUpdate ? "Update" : "Create New"} Mock Service`} onClose={handleGoBack}>
            <TextField
                id="name"
                label="Name"
                placeholder="Mock service name"
                required
                errorMsg={errors.name?.message.toString()}
                {...register("name")}
            />

            <ComponentCard sx={cardStyle} disbaleHoverEffect>
                <Typography variant="h3">Mock Service Details</Typography>
                <TextField
                    id="endpointName"
                    label="Endpoint name"
                    placeholder="Mocking endpoint name"
                    required
                    errorMsg={errors.endpointName?.message.toString()}
                    {...register("endpointName")}
                />
                <TextField
                    id="mockServicePort"
                    label="Service port"
                    placeholder="Mock service port"
                    required
                    errorMsg={errors.servicePort?.message.toString()}
                    {...register("servicePort")}
                />
                <TextField
                    id="mockServiceContext"
                    label="Service context"
                    placeholder="Mock service context"
                    required
                    errorMsg={errors.serviceContext?.message.toString()}
                    {...register("serviceContext")}
                />
            </ComponentCard>

            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(submitForm)}
                >
                    {`${isUpdate ? "Update" : "Create"}`}
                </Button>
                <Button appearance="secondary" onClick={handleGoBack}>
                    Cancel
                </Button>
            </FormActions>
        </FormView>
    );
}
