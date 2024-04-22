/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Button, TextField, FormView, FormActions, Dropdown, FormCheckBox } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { FieldGroup } from "../Commons";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { Range } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { getXML } from "../../../utils/template-engine/mustache-templates/templateUtils";
import { SERVICE } from "../../../constants";
import Handler from "./Handler";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";

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
    swaggerdefPath?: string;
    apiRange?: Range;
    handlersRange?: Range;
    handlers?: [];
}

const initialAPI: APIData = {
    apiName: "",
    apiContext: "/",
    hostName: "",
    port: "",
    trace: false,
    statistics: false,
    version: "",
    swaggerdefPath: "",
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
    const [versionType, setVersionType] = useState("none");
    const [handlers, setHandlers] = useState([]);
    const [artifactNames, setArtifactNames] = useState([]);
    const [workspaceFileNames, setWorkspaceFileNames] = useState([]);

    const schema = yup.object({
        apiName: yup.string().required("API Name is required").matches(/^[^@\\^+;:!%&,=*#[\]$?'"<>{}() /]*$/, "Invalid characters in name")
            .test('validateApiName',
                'An artifact with same name already exists', value => {
                    return !(workspaceFileNames.includes(value))
                }).test('validateArtifactName',
                    'A registry resource with this artifact name already exists', value => {
                        return !(artifactNames.includes(value))
                    }),
        apiContext: yup.string().required("API Context is required"),
        hostName: yup.string(),
        port: yup.string(),
        trace: yup.boolean(),
        statistics: yup.boolean(),
        version: yup.string(),
        swaggerdefPath: yup.string(),
        apiRange: yup.object(),
        handlersRange: yup.object(),
        handlers: yup.array()
    });

    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        watch,
        setValue,
        control
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange"
    });

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
            setVersionType(versionType);
            setHandlers(apiData.handlers ?? []);
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

    const handleVersionTypeChange = (type: string) => {
        setVersionType(type);
    };

    const addNewHandler = () => {
        if (handlers.length === 0) {
            setHandlers([{ name: "", properties: [] }]);
            return;
        }

        const lastHandler = handlers[handlers.length - 1];
        if (lastHandler.name === "" || lastHandler.properties.length === 0) return;
        setHandlers([...handlers, { name: "", properties: [] }]);
    }

    const handleCreateAPI = async (values: any) => {
        if (!apiData) {
            // Create API
            const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({ path: path })).path;
            const APIDir = `${projectDir}/src/main/wso2mi/artifacts/apis`;
            const createAPIParams = {
                directory: APIDir,
                name: values.apiName,
                context: values.apiContext,
                swaggerDef: values.swaggerdefPath,
                type: versionType,
                version: values.version
            }
            const file = await rpcClient.getMiDiagramRpcClient().createAPI(createAPIParams);
            console.log("API created");
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.ServiceDesigner, documentUri: file.path } });
        } else {
            // Update API
            const formValues = {
                name: values.apiName,
                context: values.apiContext,
                hostName: values.hostName,
                version: values.version,
                type: versionType,
                version_type: versionType,
                port: values.port === "0" ? undefined : values.port,
                trace: values.trace ? "enable" : undefined,
                statistics: values.statistics ? "enable" : undefined,
            }
            const xml = getXML(SERVICE.EDIT_SERVICE, formValues);
            await rpcClient.getMiDiagramRpcClient().applyEdit({
                text: xml,
                documentUri: path,
                range: apiData.apiRange
            });

            const handlersXML = getXML(SERVICE.EDIT_HANDLERS, { show: handlers.length > 0, handlers });
            await rpcClient.getMiDiagramRpcClient().applyEdit({
                text: handlersXML,
                documentUri: path,
                range: apiData.handlersRange
            });
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.ServiceDesigner, documentUri: path } });
        }
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleSwaggerPathSelection = async () => {
        const projectDirectory = await rpcClient.getMiDiagramRpcClient().askProjectDirPath();
        setValue("swaggerdefPath", projectDirectory.path);
    }

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
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
                    value={versionType}
                    items={versionLabels}
                    onValueChange={handleVersionTypeChange}
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
                    {handlers.map((handler, index) => (
                        <Handler
                            key={index}
                            id={index}
                            last={handlers.length - 1}
                            handler={handler}
                            setHandlers={setHandlers}
                        />
                    ))}
                </FieldGroup>
            </>}
            <FieldGroup>
                <span>Swagger Def Path</span>
                {!!watch('swaggerdefPath') ? <LocationText>{watch('swaggerdefPath')}</LocationText> : <span>Please choose a directory for swagger definition. </span>}
                <Button appearance="secondary" onClick={handleSwaggerPathSelection} id="select-swagger-path-btn">
                    Select Location
                </Button>
            </FieldGroup>
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleCreateAPI)}
                    disabled={!isDirty}
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
