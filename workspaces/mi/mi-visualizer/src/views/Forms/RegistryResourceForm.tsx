/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { Dropdown, Button, TextField, FormView, FormActions, RadioButtonGroup, Icon, Typography } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW, CreateRegistryResourceRequest } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { colors } from "@wso2-enterprise/ui-toolkit";

export interface RegistryWizardProps {
    path: string;
}

const templates = [{ value: "Data Mapper" }, { value: "Javascript File" }, { value: "JSON File" }, { value: "WSDL File" },
{ value: "WS-Policy" }, { value: "XSD File" }, { value: "XSL File" }, { value: "XSLT File" }, { value: "YAML File" }];

type InputsFields = {
    templateType?: string;
    filePath?: string;
    resourceName?: string;
    artifactName?: string;
    registryPath?: string
    createOption?: "new" | "import";
    registryType?: "gov" | "conf";
};

const initialRegistryResource: InputsFields = {
    templateType: "XSLT File",
    filePath: "Please select a file or folder",
    resourceName: "",
    artifactName: "",
    registryPath: "/",
    createOption: "new",
    registryType: "gov"
};

export function RegistryResourceForm(props: RegistryWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [regArtifactNames, setRegArtifactNames] = useState([]);
    const [registryPaths, setRegistryPaths] = useState([]);
    const [artifactNames, setArtifactNames] = useState([]);

    const schema = yup
        .object({
            createOption: yup.mixed<"new" | "import">().oneOf(["new", "import"]),
            artifactName: yup.string().required("Artifact Name is required").test('validateArtifactName',
                'Artifact name already exists', value => {
                    return !regArtifactNames.includes(value);
                }).test('validateArtifactNameInWorkspace',
                    'A file already exists in the workspace with this artifact name', value => {
                        return !artifactNames.includes(value);
                    }),
            registryPath: yup.string().test('validateRegistryPath', 'Resource already exists', value => {
                const formattedPath = formatRegistryPath(value);
                return !(registryPaths.includes(formattedPath) || registryPaths.includes(formattedPath + "/"));
            }),
            registryType: yup.mixed<"gov" | "conf">().oneOf(["gov", "conf"]),
            filePath: yup.string().when('createOption', {
                is: "new",
                then: () =>
                    yup.string().notRequired(),
                otherwise: () =>
                    yup.string().required("File Path is required"),
            }),
            templateType: yup.string().when('createOption', {
                is: "new",
                then: () =>
                    yup.string().required("Template type is required"),
                otherwise: () =>
                    yup.string().notRequired(),
            }),
            resourceName: yup.string().when('createOption', {
                is: "new",
                then: () =>
                    yup.string().required("Resource Name is required"),
                otherwise: () =>
                    yup.string().notRequired(),
            }),
        });

    const {
        register,
        formState: { errors, isDirty, isValid, isSubmitting },
        handleSubmit,
        getValues,
        setValue,
        watch
    } = useForm<InputsFields>({
        defaultValues: initialRegistryResource,
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    const createOptionValue = watch("createOption", "new") === "new";

    useEffect(() => {
        (async () => {
            if (regArtifactNames.length === 0 || registryPaths.length === 0) {
                const request = {
                    path: props.path
                }
                const tempArtifactNames = await rpcClient.getMiDiagramRpcClient().getAvailableRegistryResources(request);
                setRegArtifactNames(tempArtifactNames.artifacts);
                const res = await rpcClient.getMiDiagramRpcClient().getAllRegistryPaths(request);
                setRegistryPaths(res.registryPaths);
                const artifactRes = await rpcClient.getMiDiagramRpcClient().getAllArtifacts(request);
                setArtifactNames(artifactRes.artifacts);
            }
        })();
    }, []);

    const getFileExtension = () => {
        switch (getValues("templateType")) {
            case "Data Mapper":
                return ".dmc";
            case "Javascript File":
                return ".js";
            case "JSON File":
                return ".json";
            case "YAML File":
                return ".yaml";
            case "WSDL File":
                return ".wsdl";
            case "XSD File":
                return ".xsd";
            case "XSL File":
                return ".xsl";
            case "XSLT File":
                return ".xslt";
            default:
                return ".xml";
        }
    }

    const formatRegistryPath = (path: string) => {
        let regPath = '';
        if (getValues("registryType") === 'gov') {
            regPath = 'gov';
        } else {
            regPath = 'conf';
        }
        path.startsWith('/') ? regPath = regPath + path : regPath = regPath + '/' + path;
        if (createOptionValue) {
            regPath.endsWith('/') ? regPath = regPath + getValues("resourceName") + getFileExtension()
                : regPath = regPath + '/' + getValues("resourceName") + getFileExtension();
        } else {
            const filename = getValues("filePath").split('/').pop();
            regPath.endsWith('/') ? regPath = regPath + filename : regPath = regPath + '/' + filename;
        }
        return regPath;
    }

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const openFile = async () => {
        const request = {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            defaultUri: "",
            title: "Select a file to be imported as registry resource"
        }
        await rpcClient.getMiDiagramRpcClient().browseFile(request).then(response => {
            setValue("filePath", response.filePath, { shouldDirty: true });
        }).catch(e => { console.log(e); });
    }

    const openFolder = async () => {
        const request = {
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            defaultUri: "",
            title: "Select a folder to be imported to registry as a collection"
        }
        await rpcClient.getMiDiagramRpcClient().browseFile(request).then(response => {
            setValue("filePath", response.filePath, { shouldDirty: true });
        }).catch(e => { console.log(e); });
    }

    const handleCreateRegResource = async (values: InputsFields) => {
        const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({ path: props.path })).path;
        const regRequest: CreateRegistryResourceRequest = {
            projectDirectory: projectDir,
            templateType: values.templateType,
            filePath: values.filePath,
            resourceName: values.resourceName,
            artifactName: values.artifactName,
            registryPath: values.registryPath,
            registryRoot: values.registryType,
            createOption: values.createOption
        }
        const regfilePath = await rpcClient.getMiDiagramRpcClient().createRegistryResource(regRequest);
        rpcClient.getMiDiagramRpcClient().openFile(regfilePath);
        rpcClient.getMiDiagramRpcClient().closeWebView();
    }

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    };

    return (
        <FormView title="Create New Registry Resource" onClose={handleBackButtonClick}>
            <RadioButtonGroup
                label="Create Options"
                id="createOption"
                options={[{ content: "From existing template", value: "new" }, { content: "Import from file system", value: "import" }]}
                {...register("createOption")}
            />
            {createOptionValue && (<>
                <Dropdown
                    label="Template Type"
                    id="templateType"
                    items={templates}
                    {...register("templateType")}
                ></Dropdown>
                <TextField
                    label="Resource Name"
                    id="resourceName"
                    errorMsg={errors.resourceName?.message.toString()}
                    {...register("resourceName")}
                />
            </>)}
            {!createOptionValue && (<>
                <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
                    <Button appearance="secondary" onClick={openFile}>
                        <div style={{ color: colors.editorForeground }}>Browse file</div>
                    </Button>
                    <Button appearance="secondary" onClick={openFolder}>
                        <div style={{ color: colors.editorForeground }}>Browse folder</div>
                    </Button>
                    <Typography variant="body3" {...register("filePath")}>
                        {(errors && errors.filePath && errors.filePath.message)
                            ? errors.filePath.message.toString() : watch("filePath")}
                    </Typography>
                </div>
            </>)}
            <TextField
                id='artifactName'
                label="Artifact Name"
                errorMsg={errors.artifactName?.message.toString()}
                {...register("artifactName")}
            />
            <RadioButtonGroup
                label="Select registry type"
                id="registryType"
                options={[{ content: "Governance registry (gov)", value: "gov" }, { content: "Configuration registry (conf)", value: "conf" }]}
                {...register("registryType")}
            />
            <TextField
                id='registryPath'
                label="Registry Path"
                errorMsg={errors.registryPath?.message.toString()}
                {...register("registryPath")}
            />
            <br />
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSubmit((values) => {
                        handleCreateRegResource(values);
                    })}
                    disabled={!isDirty || (!createOptionValue
                        && getValues("filePath") === "Please select a file or folder")}
                >
                    Create
                </Button>
                <Button appearance="secondary" onClick={openOverview}>
                    Cancel
                </Button>
            </FormActions>
        </FormView>
    );
}
