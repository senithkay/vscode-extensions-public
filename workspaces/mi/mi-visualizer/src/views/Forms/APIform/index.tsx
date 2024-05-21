/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { Button, TextField, FormView, FormActions, Dropdown, FormCheckBox, RadioButtonGroup } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { FieldGroup } from "../Commons";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { Range } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { getXML } from "../../../utils/template-engine/mustache-templates/templateUtils";
import { ARTIFACT_TEMPLATES } from "../../../constants";
import { FormHandler } from "./Handler";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import * as pathLib from "path";
import { FormKeylookup } from "@wso2-enterprise/mi-diagram";

const TitleBar = styled.div({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
});

const LocationText = styled.div`
    max-width: 60vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export interface Region {
    label: string;
    value: string;
}

export interface APIData {
    apiName: string;
    apiContext: string;
    hostName?: string;
    port?: string;
    trace?: boolean;
    statistics?: boolean;
    version?: string;
    versionType?: "none" | "context" | "url";
    apiCreateOption?: "create-api" | "swagger-to-api" | "wsdl-to-api";
    swaggerDefPath?: string;
    saveSwaggerDef?: boolean;
    wsdlDefPath?: string;
    apiRange?: Range;
    handlersRange?: Range;
    handlers?: any[];
}

const initialAPI: APIData = {
    apiName: "",
    apiContext: "/",
    hostName: "",
    port: "",
    trace: false,
    statistics: false,
    version: "",
    versionType: "none",
    apiCreateOption: "create-api",
    swaggerDefPath: "",
    saveSwaggerDef: false,
    wsdlDefPath: "",
    apiRange: undefined,
    handlersRange: undefined,
    handlers: []
};

export interface APIWizardProps {
    apiData?: APIData;
    path: string;
}

type VersionType = "none" | "context" | "url";

export function APIWizard({ apiData, path }: APIWizardProps) {
    const { rpcClient } = useVisualizerContext();
    const [artifactNames, setArtifactNames] = useState([]);
    const [workspaceFileNames, setWorkspaceFileNames] = useState([]);

    const schema = yup.object({
        apiName: yup.string().required("API Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in name")
            .test('validateApiName',
                'An artifact with same name already exists', value => {
                    return (value === apiData?.apiName) || !(workspaceFileNames.includes(value))
                }).test('validateArtifactName',
                    'A registry resource with this artifact name already exists', value => {
                        return (value === apiData?.apiName) || !(artifactNames.includes(value))
                    }),
        apiContext: yup.string().required("API Context is required"),
        hostName: yup.string(),
        port: yup.string(),
        trace: yup.boolean(),
        statistics: yup.boolean(),
        versionType: yup.string().oneOf(["none", "url", "context"]).required(),
        version: yup.string()
            .when("versionType", {
                is: "none",
                then: schema => schema.transform(() => undefined),
            })
            .when("versionType", {
                is: "context",
                then: schema => schema.matches(/^(\d+\.\d+\.\d+)$/, "Invalid version format"),
            })
            .when("versionType", {
                is: "url",
                then: schema => schema.matches(/^https?:\/\/.*/, "Invalid URL format"),
            }),
        apiCreateOption: yup.string().oneOf(["create-api", "swagger-to-api", "wsdl-to-api"] as const).defined(),
        swaggerDefPath: yup.string().when('apiCreateOption', {
            is: "swagger-to-api",
            then: schema => schema.required("Swagger definition is required"),
        }),
        saveSwaggerDef: yup.boolean(),
        wsdlDefPath: yup.string().when('apiCreateOption', {
            is: "wsdl-to-api",
            then: schema => schema.required("WSDL definition is required"),
        }),
        apiRange: yup.object(),
        handlersRange: yup.object(),
        handlers: yup.array()
    });

    const {
        reset,
        register,
        formState: { errors, isValid, isDirty },
        handleSubmit,
        watch,
        setValue,
        control
    } = useForm({
        defaultValues: initialAPI,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    // Watchers
    const handlers = watch("handlers");
    const versionType = watch("versionType");
    const apiCreateOption = watch("apiCreateOption");
    const swaggerDefPath = watch("swaggerDefPath");
    const wsdlDefPath = watch("wsdlDefPath");

    const identifyVersionType = (version: string): VersionType => {
        if (!version) {
            return "none";
        } else if (version.startsWith("http")) {
            return "url";
        } else {
            return "context";
        }
    }

    useEffect(() => {
        if (apiData) {
            const versionType = identifyVersionType(apiData.version);

            reset(apiData);
            setValue("versionType", versionType);
            setValue("handlers", apiData.handlers ?? []);
        } else {
            reset(initialAPI);
        }
    }, [apiData]);

    useEffect(() => {
        (async () => {
            const artifactRes = await rpcClient.getMiDiagramRpcClient().getAllArtifacts({
                path: path,
            });
            setWorkspaceFileNames(artifactRes.artifacts);
            const regArtifactRes = await rpcClient.getMiDiagramRpcClient().getAvailableRegistryResources({
                path: path,
            });
            setArtifactNames(regArtifactRes.artifacts);
        })();
    }, []);

    const versionLabels = [
        { content: "None", value: "none" },
        { content: "Context", value: "context" },
        { content: "URL", value: "url" }
    ];

    const renderProps = (fieldName: keyof APIData) => {
        return {
            id: fieldName,
            ...register(fieldName),
            errorMsg: errors[fieldName] && errors[fieldName].message.toString()
        }
    };

    const addNewHandler = () => {
        if (handlers.length === 0) {
            setValue("handlers", [{ name: "", properties: [] }]);
            return;
        }

        const lastHandler = handlers[handlers.length - 1];
        if (lastHandler.name === "" || lastHandler.properties.length === 0) return;
        setValue("handlers", [...handlers, { name: "", properties: [] }]);
    }

    const handleCreateAPI = async (values: any) => {
        if (!apiData) {
            // Create API
            const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({ path: path })).path;
            const APIDir =  pathLib.join(projectDir,'src','main','wso2mi','artifacts', 'apis');
            const formValues = {
                name: values.apiName,
                context: values.apiContext,
                swaggerDef: values.saveSwagger && values.swaggerdefPath,
                version: (values.versionType !== "none" && values.version) && values.version,
                versionType: (values.versionType !== "none" && values.version) && values.versionType,
            }
            const xml = getXML(ARTIFACT_TEMPLATES.ADD_API, formValues);
            const createAPIParams = {
                directory: APIDir,
                xmlData: xml,
                name: values.apiName,
                swaggerDef: values.saveSwagger && values.swaggerdefPath,
            };
            const file = await rpcClient.getMiDiagramRpcClient().createAPI(createAPIParams);
            console.log("API created");
            rpcClient.getMiVisualizerRpcClient().log({ message: "API created successfully." });
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: { view: MACHINE_VIEW.ServiceDesigner, documentUri: file.path }
            });
        } else {
            // Update API
            const formValues = {
                name: values.apiName,
                context: values.apiContext,
                swaggerDef: values.swaggerdefPath,
                hostName: values.hostName,
                version: values.version,
                type: values.versionType,
                version_type: values.versionType,
                port: values.port === "0" ? undefined : values.port,
                trace: values.trace ? "enable" : undefined,
                statistics: values.statistics ? "enable" : undefined,
            }
            const xml = getXML(ARTIFACT_TEMPLATES.EDIT_API, formValues);
            const handlersXML = getXML(ARTIFACT_TEMPLATES.EDIT_HANDLERS, { show: handlers.length > 0, handlers });
            const editAPIParams = {
                documentUri: path,
                xmlData: xml,
                handlersXmlData: handlersXML,
                apiRange: apiData.apiRange,
                handlersRange: apiData.handlersRange
            };
            await rpcClient.getMiDiagramRpcClient().editAPI(editAPIParams);
            rpcClient.getMiVisualizerRpcClient().log({ message: `Updated API: ${apiData.apiName}.` });
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: { view: MACHINE_VIEW.ServiceDesigner, documentUri: path }
            });
        }
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleSwaggerPathSelection = async () => {
        const browseParams = {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            defaultUri: "",
            title: "Select a swagger file"
        }
        const projectDirectory = await rpcClient.getMiDiagramRpcClient().browseFile(browseParams);
        setValue("swaggerDefPath", projectDirectory.filePath, {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    const handleWsdlPathSelection = async () => {
        const browseParams = {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            defaultUri: "",
            title: "Select a wsdl file"
        }
        const projectDirectory = await rpcClient.getMiDiagramRpcClient().browseFile(browseParams);
        setValue("wsdlDefPath", projectDirectory.filePath, {
            shouldValidate: true,
            shouldDirty: true
        });
    }

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const getAdvanceAPICreationOptions = () => {
        switch (apiCreateOption) {
            case "swagger-to-api":
                return (
                    <React.Fragment>
                        <FieldGroup>
                            <span>Swagger File</span>
                            {!!swaggerDefPath && <LocationText>{swaggerDefPath}</LocationText>}
                            {!swaggerDefPath && <span>Please choose a file for OpenAPI definition.</span>}
                            <Button appearance="secondary" onClick={handleSwaggerPathSelection} id="select-swagger-path-btn">
                                Select Location
                            </Button>
                        </FieldGroup>
                        <FormCheckBox
                            name="saveSwaggerDef"
                            label="Save Swagger Definition to Registry"
                            control={control}
                        />
                    </React.Fragment>
                );
            case "wsdl-to-api":
                return (
                    <React.Fragment>
                        <FieldGroup>
                            <span>WSDL File</span>
                            {!!wsdlDefPath && <LocationText>{wsdlDefPath}</LocationText>}
                            {!wsdlDefPath && <span>Please choose a file for WSDL definition.</span>}
                            <Button appearance="secondary" onClick={handleWsdlPathSelection} id="select-wsdl-path-btn">
                                Select Location
                            </Button>
                        </FieldGroup>
                    </React.Fragment>
                );
            default:
                return null;
        }
    }

    return (
        <FormView title={`${apiData ? "Edit " : ""}Synapse API Artifact`} onClose={handleOnClose}>
            <TextField
                required
                label="Name"
                placeholder="Name"
                {...renderProps("apiName")}
            />
            <TextField
                required
                label="Context"
                placeholder="Context"
                {...renderProps("apiContext")}
            />
            {apiData && <>
                <TextField
                    label="Host Name"
                    placeholder="Host Name"
                    {...renderProps("hostName")}
                />
                <TextField
                    label="Port"
                    placeholder="Port"
                    {...renderProps("port")}
                />
            </>}
            <FieldGroup>
                <Dropdown
                    id="version-type"
                    label="Version Type"
                    items={versionLabels}
                    {...register("versionType")}
                />
                {versionType !== "none" && (
                    <TextField
                        label="Version"
                        placeholder={versionType === "context" ? "0.0.1" : "https://example.com"}
                        {...renderProps("version")}
                    />
                )}
            </FieldGroup>
            {apiData && <>
                <FormCheckBox
                    name="trace"
                    label="Trace Enabled"
                    control={control}
                />
                <FormCheckBox
                    name="statistics"
                    label="Statistics Enabled"
                    control={control}
                />
                <FieldGroup>
                    <TitleBar>
                        <span>Handlers</span>
                        <Button
                            appearance="primary"
                            onClick={addNewHandler}
                        >
                            Add Handler
                        </Button>
                    </TitleBar>
                    {handlers?.map((handler, index) => (
                        <FormHandler
                            key={index}
                            handlerId={index}
                            last={handlers.length - 1}
                            handler={handler}
                            name="handlers"
                            control={control}
                        />
                    ))}
                </FieldGroup>
            </>}
            {apiData ? (
                <FieldGroup>
                    <span>Swagger File</span>
                    {!!swaggerDefPath && <LocationText>{swaggerDefPath}</LocationText>}
                    {!swaggerDefPath && <span>Please choose an Open API Definition.</span>}
                    <FormKeylookup
                        control={control}
                        name="swaggerDefPath"
                        filterType="swagger"
                    />
                </FieldGroup>
            ) : (
                <>
                    <RadioButtonGroup
                        orientation="vertical"
                        label="Provide API Definition"
                        options={[
                            { content: "I don't have one", value: "create-api" },
                            { content: "Provide OpenAPI definition", value: "swagger-to-api" },
                            { content: "Provide WSDL definition", value: "wsdl-to-api" }
                        ]}
                        {...register("apiCreateOption")}
                    />
                    {getAdvanceAPICreationOptions()}
                </>
            )}
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleCreateAPI)}
                    disabled={!isValid || !isDirty}
                >
                    {apiData ? "Save changes" : "Create"}
                </Button>
                <Button
                    appearance="secondary"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
            </FormActions>
        </FormView>
    );
}
