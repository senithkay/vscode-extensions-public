/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";
import { Button, Dropdown, FormActions, FormGroup, FormView, LocationSelector, OptionProps, TextField } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import styled from "@emotion/styled";


type InputsFields = {
    name?: string;
    directory?: string;
    groupID?: string;
    artifactID?: string;
    version?: string;
    miVersion?: string;
};

const initialEndpoint: InputsFields = {
    name: '',
    directory: '',
    groupID: 'com.microintegrator.projects',
    artifactID: 'Sample1',
    version: '1.0.0',
    miVersion: '',
};

const DownloadLabel = styled.div`
    margin-top: 10px;
    font-size: 12px;
    color: #b3b3b3;
`;

export function ProjectWizard({ cancelView }: { cancelView: MACHINE_VIEW }) {

    const { rpcClient } = useVisualizerContext();

    const [dirContent, setDirContent] = useState([]);

    const [isProjectCreating, setIsProjectCreating] = useState(false);
    const [supportedMIVersions, setSupportedMIVersions] = useState<OptionProps[]>([]);

    const schema = yup.object({
        name: yup.string().required("Project Name is required").matches(/^[a-zA-Z0-9_-]([a-zA-Z0-9_-]*\.?[a-zA-Z0-9_-])*$/, "Project name cannot contain spaces or special characters")
            .test('validateFolderName',
                'A subfolder with same name already exists', value => {
                    return !dirContent.includes(value)
                }),
        directory: yup.string().required("Project Directory is required"),
        groupID: yup.string().notRequired().default("com.microintegrator.projects").matches(/^[a-zA-Z0-9_-]([a-zA-Z0-9_-]*\.?[a-zA-Z0-9_-])*$/, "Group id cannot contain spaces or special characters"),
        artifactID: yup.string().notRequired().matches(/^[a-zA-Z0-9_-]?([a-zA-Z0-9_-]*\.?[a-zA-Z0-9_-])*$/, "Artifact id cannot contain spaces or special characters"),
        version: yup.string().notRequired().default("1.0.0").matches(/^[a-zA-Z0-9.]*$/, "Version cannot contain spaces or special characters"),
        miVersion: yup.string().required("Micro Integrator Runtime version is required").matches(/^[a-zA-Z0-9.]*$/, "Micro Integrator Version cannot contain spaces or special characters"),
    });

    const {
        register,
        formState: { errors, isDirty },
        handleSubmit,
        watch,
        getValues,
        setValue,
    } = useForm({
        defaultValues: initialEndpoint,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    useEffect(() => {
        (async () => {
            const currentDir = await rpcClient.getMiDiagramRpcClient().getWorkspaceRoot();
            setValue("directory", currentDir.path);
            const supportedVersions = await rpcClient.getMiVisualizerRpcClient().getSupportedMIVersions();
            const supportedMIVersions = supportedVersions.map((version: string) => ({ value: version, content: version }));
            setSupportedMIVersions(supportedMIVersions);
            setValue("miVersion", supportedVersions[0]); // Set the first supported version as the default, it is the latest version
        })();
    }, []);

    useEffect(() => {
        setValue("artifactID", getValues("name"));
    }, [watch("name")]);

    const handleProjecDirSelection = async () => {
        const projectDirectory = await rpcClient.getMiDiagramRpcClient().askProjectDirPath();
        setValue("directory", projectDirectory.path);
        const response = await rpcClient.getMiDiagramRpcClient().getSubFolderNames({ path: projectDirectory.path });
        setDirContent(response.folders);
    }

    const handleCreateProject = async (values: any) => {
        setValue("artifactID", getValues("artifactID") ? getValues("artifactID") : getValues("name"))
        const createProjectParams = {
            ...values,
            open: true,
        }
        setIsProjectCreating(true);
        await rpcClient.getMiDiagramRpcClient().createProject(createProjectParams);
        setIsProjectCreating(false);
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: cancelView } });
    };

    return (
        <FormView title="Create New Project" onClose={handleCancel}>
            <TextField
                id='name'
                label="Project Name"
                required
                errorMsg={errors.name?.message.toString()}
                {...register("name")}
            />
            <LocationSelector
                label="Project Directory"
                selectedFile={watch("directory")}
                required
                onSelect={handleProjecDirSelection}
                {...register("directory")}
            />
            <FormGroup title="Advanced Options">
                <React.Fragment>
                    <Dropdown
                        id='miVersion'
                        label="Micro Integrator runtime version"
                        isRequired={true}
                        errorMsg={errors.miVersion?.message.toString()}
                        items={supportedMIVersions}
                        {...register("miVersion")}
                    />
                    <TextField
                        id='groupID'
                        label="Group Id"
                        required
                        errorMsg={errors.groupID?.message.toString()}
                        {...register("groupID")}
                    />
                    <TextField
                        id='artifactID'
                        label="Artifact Id"
                        required
                        errorMsg={errors.artifactID?.message.toString()}
                        {...register("artifactID")}
                    />
                    <TextField
                        id='version'
                        label="Version"
                        required
                        errorMsg={errors.version?.message.toString()}
                        {...register("version")}
                    />
                </React.Fragment>
            </FormGroup>
            <DownloadLabel>If not available Runtime and necessary tools will download upon project creation</DownloadLabel>
            <FormActions>
                <Button
                    appearance="secondary"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
                <Button
                    appearance="primary"
                    onClick={handleSubmit(handleCreateProject)}
                    disabled={!isDirty || isProjectCreating}
                >
                    Create
                </Button>
            </FormActions>
        </FormView>
    );
}
