/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { yupResolver } from "@hookform/resolvers/yup";
import { EVENT_TYPE, MACHINE_VIEW, UpdateTestSuiteResponse } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, ComponentCard, FormActions, FormView, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { getMockServiceXML } from "../../../../utils/template-engine/mustache-templates/TestSuite";
import path from "path";
import { MockService } from "@wso2-enterprise/mi-syntax-tree/lib/src";

export interface MockServiceFormProps {
    filePath?: string;
    stNode?: MockService;
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
    const [availableMockServices, setAvailableMockServices] = useState(props.availableMockServices || []);
    const isUpdate = !!props.stNode;
    const mockService = props.stNode;
    const filePath = props.filePath;

    const isWindows = navigator.platform.toLowerCase().includes("win");
    const fileName = filePath ? filePath.split(isWindows ? path.win32.sep : path.sep).pop().split(".xml")[0] : "";

    // Schema
    const schema = yup.object({
        name: yup.string().required("Test case name is required").notOneOf(availableMockServices, "Mock service name already exists"),
        endpointName: yup.string().required("Endpoint name is required"),
        servicePort: yup.number().required("Service port is required"),
        serviceContext: yup.string().required("Service context is required").matches(/^\//, "Service context should start with '/'")
    });

    const {
        handleSubmit,
        formState: { errors },
        register,
        reset
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        (async () => {
            const mockServices = await rpcClient.getMiDiagramRpcClient().getAllMockServices();
            const mockServicesNames = mockServices.mockServices.map((mockService: any) => mockService.name);
            const allMockServices = mockServicesNames.concat(availableMockServices).filter((value) => value !== fileName);
            setAvailableMockServices(allMockServices);

            if (mockService) {

                reset({
                    name: fileName,
                    endpointName: mockService.serviceName?.textNode,
                    servicePort: parseInt(mockService?.port?.textNode || '0'),
                    serviceContext: mockService?.context?.textNode
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
        const xml = getMockServiceXML(values);
        rpcClient.getMiDiagramRpcClient().updateMockService({ path: props.filePath, content: xml, name: values.name }).then((resp: UpdateTestSuiteResponse) => {
            if (props.onSubmit) {
                values.filePath = resp.path;
                props.onSubmit(values);
                return;
            }
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
                <Button appearance="secondary" onClick={openOverview}>
                    Cancel
                </Button>
            </FormActions>
        </FormView>
    );
}
