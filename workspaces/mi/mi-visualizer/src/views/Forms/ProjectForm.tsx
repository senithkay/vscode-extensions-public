/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";
import { Button, FormActions, FormGroup, FormView, LocationSelector, TextField } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";

export interface Region {
    label: string;
    value: string;
}

type InputsFields = {
    name?: string;
    directory?: string;
    groupID?: string;
    artifactID?: string;
    version?: string;
};

const initialEndpoint: InputsFields = {
    name: '',
    directory: '',
    groupID: 'com.microintegrator.projects',
    artifactID: 'Sample1',
    version: '1.0.0',
};

export function ProjectWizard({ cancelView }: { cancelView: MACHINE_VIEW }) {

    const { rpcClient } = useVisualizerContext();

    const [dirContent, setDirContent] = useState([]);

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
        await rpcClient.getMiDiagramRpcClient().createProject(createProjectParams);
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
                label="Select Project Directory"
                selectedFile={watch("directory")}
                required
                onSelect={handleProjecDirSelection}
                {...register("directory")}
            />
            <FormGroup title="Advanced Options">
                <React.Fragment>
                    <TextField
                        id='groupID'
                        label="Group Id"
                        errorMsg={errors.groupID?.message.toString()}
                        {...register("groupID")}
                    />
                    <TextField
                        id='artifactID'
                        label="Artifact Id"
                        errorMsg={errors.artifactID?.message.toString()}
                        {...register("artifactID")}
                    />
                    <TextField
                        id='version'
                        label="Version"
                        errorMsg={errors.version?.message.toString()}
                        {...register("version")}
                    />
                </React.Fragment>
            </FormGroup>
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
                    disabled={!isDirty}
                >
                    Create
                </Button>
            </FormActions>
        </FormView>
    );
}
