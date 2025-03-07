/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";
import { Button, Dropdown, FormActions, FormGroup, FormView, LocationSelector, OptionProps, TextField, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import styled from "@emotion/styled";
import { Range } from '../../../../syntax-tree/lib/src';


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

    const [supportedMIVersions, setSupportedMIVersions] = useState<OptionProps[]>([]);
    const [formSaved, setFormSaved] = useState(false);

    const loweCasedDirContent = dirContent.map((folder: string) => folder.toLowerCase());
    const schema = yup.object({
        name: yup.string().required("Project Name is required").matches(/^[a-zA-Z0-9_-]([a-zA-Z0-9_-]*\.?[a-zA-Z0-9_-])*$/i, "Project name cannot contain spaces or special characters")
            .test('validateFolderName',
                'A subfolder with same name already exists', value => {
                    return !loweCasedDirContent.includes(value.toLowerCase())
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
            const supportedVersions = await rpcClient.getMiVisualizerRpcClient().getSupportedMIVersionsHigherThan('');
            const supportedMIVersions = supportedVersions.map((version: string) => ({ value: version, content: version }));
            setSupportedMIVersions(supportedMIVersions);
            setValue("miVersion", supportedVersions[0]); // Set the first supported version as the default, it is the latest version
            const response = await rpcClient.getMiDiagramRpcClient().getSubFolderNames({ path: currentDir.path });
            setDirContent(response.folders);
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
        setFormSaved(true);
        await rpcClient.getMiDiagramRpcClient().createProject(createProjectParams);
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: cancelView } });
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (isDirty) {
                handleSubmit(handleCreateProject)();
            }
        }
    };

    return (
        <FormView title="Create New Project" onClose={handleCancel}>
            <TextField
                id='name'
                label="Project Name"
                required
                errorMsg={errors.name?.message.toString()}
                {...register("name")}
                onKeyDown={onKeyDown}
            />
            <Dropdown
                id='miVersion'
                label="Micro Integrator runtime version"
                isRequired={true}
                errorMsg={errors.miVersion?.message.toString()}
                items={supportedMIVersions}
                {...register("miVersion")}
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
            <DownloadLabel>If the necessary Micro Integrator runtime and tools are not available, you will be prompted to download them after project creation.</DownloadLabel>
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
                    disabled={(!isDirty) || Object.keys(errors).length > 0 || formSaved}
                >
                    {formSaved ? (
                        <>
                            <ProgressRing sx={{height: 16, marginLeft: -5, marginRight: 2}} color="white"/>
                            Creating
                        </>
                    ) : "Create"}
                </Button>
            </FormActions>
        </FormView>
    );
}
