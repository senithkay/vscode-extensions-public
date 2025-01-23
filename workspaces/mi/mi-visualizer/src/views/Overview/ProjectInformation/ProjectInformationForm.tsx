/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DependencyDetails, ProjectDetailsResponse } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { useEffect, useState } from "react";

import { Button, Dropdown, Banner, FormActions, FormGroup, FormView, OptionProps, ProgressIndicator, TextField, Codicon } from "@wso2-enterprise/ui-toolkit";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";

interface ProjectInformationFormProps {
    onClose: () => void;
}
export function ProjectInformationForm(props: ProjectInformationFormProps) {
    const { rpcClient } = useVisualizerContext();
    const [projectDetails, setProjectDetails] = useState<ProjectDetailsResponse>();
    const [runtimeVersions, setRuntimeVersions] = useState<OptionProps[]>([]);
    const [initialRuntimeVersion, setInitialRuntimeVersion] = useState<string>("");

    const schema = yup.object({
        "primaryDetails.projectName": yup.string().required("Project Name is required"),
        "primaryDetails.projectDescription": yup.string(),
        "primaryDetails.projectVersion": yup.string().required("Version is required").matches(/^[a-zA-Z0-9.]*$/, "Version cannot contain spaces or special characters"),
        "primaryDetails.runtimeVersion": yup.string().required("Runtime version is required"),
        "dockerDetails.dockerFileBaseImage": yup.string().required("Base image is required"),
        "dockerDetails.dockerName": yup.string().required("Docker name is required"),
        "unitTest.skipTest": yup.boolean(),
        "unitTest.serverHost": yup.string(),
        "unitTest.serverPort": yup.string(),
        "unitTest.serverPath": yup.string(),
        "unitTest.serverType": yup.string(),
    });

    const {
        register,
        formState: { errors, dirtyFields, isSubmitting },
        handleSubmit,
        reset,
        getValues,
        watch,
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const currentRuntimeVersion = watch("primaryDetails.runtimeVersion");
    const isRuntimeVersionChanged = currentRuntimeVersion && currentRuntimeVersion !== initialRuntimeVersion;
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await rpcClient?.getMiVisualizerRpcClient().getProjectDetails();
                setProjectDetails(response);
                setInitialRuntimeVersion(response.primaryDetails.runtimeVersion.value);
                const supportedVersions = await rpcClient.getMiVisualizerRpcClient().getSupportedMIVersionsHigherThan(response.primaryDetails.runtimeVersion.value);
                const supportedMIVersions = supportedVersions.map((version: string) => ({ value: version, content: version }));
                setRuntimeVersions(supportedMIVersions);

                reset({
                    "primaryDetails.projectName": response.primaryDetails.projectName.value,
                    "primaryDetails.projectDescription": response.primaryDetails.projectDescription.value,
                    "primaryDetails.projectVersion": response.primaryDetails.projectVersion.value,
                    "primaryDetails.runtimeVersion": response.primaryDetails.runtimeVersion.value,
                    "dockerDetails.dockerFileBaseImage": response.buildDetails.dockerDetails.dockerFileBaseImage.value,
                    "dockerDetails.dockerName": response.buildDetails.dockerDetails.dockerName.value,
                    "unitTest.skipTest": Boolean(response.unitTest?.skipTest?.value),
                    "unitTest.serverHost": response.unitTest?.serverHost?.value,
                    "unitTest.serverPort": response.unitTest?.serverPort?.value,
                    "unitTest.serverPath": response.unitTest?.serverPath?.value,
                    "unitTest.serverType": response.unitTest?.serverType?.value,
                });
            } catch (error) {
                console.error("Error fetching project details:", error);
            }
        }
        fetchData();
    }, [rpcClient, reset]);

    const setDependencies = (dependencies: DependencyDetails[]) => {
        return {
            paramValues: dependencies.map((dep, index) => ({
                id: index,
                key: index.toString(),
                value: dep.groupId,
                icon: 'package',
                paramValues: [
                    { value: dep.groupId },
                    { value: dep.artifact },
                ]
            })) || [],
            paramFields: [
                {
                    "type": "TextField" as "TextField",
                    "label": "Group ID",
                    "defaultValue": "",
                    "isRequired": true,
                    "canChange": false
                },
                {
                    "type": "TextField" as "TextField",
                    "label": "Artifact ID",
                    "defaultValue": "",
                    "isRequired": true,
                    "canChange": false
                },
                {
                    "type": "TextField" as "TextField",
                    "label": "Version",
                    "defaultValue": "",
                    "isRequired": true,
                    "canChange": false
                }
            ]
        };
    };

    const handleFormSubmit = async () => {
        try {
            const updatedValues = Object.keys((dirtyFields as any));

            const updatePomValuesForSection = async (section: string) => {
                if (updatedValues.includes(section)) {
                    const changes = [];
                    for (const field of Object.keys((dirtyFields as any)?.[section])) {
                        const value = getValues((`${section}.${field}` as any).toString());
                        const range = (projectDetails as any)?.[section]?.[field]?.range;

                        if (!range) {
                            continue;
                        }
                        changes.push({ value, range });
                    }
                    await rpcClient.getMiVisualizerRpcClient().updatePomValues({
                        pomValues: changes
                    });
                }
            };

            await updatePomValuesForSection("primaryDetails");
            await updatePomValuesForSection("dockerDetails");
            await updatePomValuesForSection("unitTest");
            if (isRuntimeVersionChanged) {
                await rpcClient.getMiVisualizerRpcClient().reloadWindow();
            } else {
                props.onClose();
            }
        } catch (error) {
            console.error("Error updating project details:", error);
        }
    };

    const handleCancel = () => {
        props.onClose();
    };

    if (!projectDetails) {
        return <ProgressIndicator />;
    }

    return (
        <FormView title="Project Settings" onClose={handleCancel}>
            <FormGroup title="Primary Details" isCollapsed={false}>
                <TextField
                    label="Project Name"
                    required
                    errorMsg={errors["primaryDetails.projectName"]?.message?.toString()}
                    {...register("primaryDetails.projectName")}
                />
                <TextField
                    label="Description"
                    {...register("primaryDetails.projectDescription")}
                />
                <TextField
                    label="Version"
                    required
                    errorMsg={errors["primaryDetails.projectVersion"]?.message?.toString()}
                    {...register("primaryDetails.projectVersion")}
                />
                <div>
                    <Dropdown
                        id='runtimeVersion'
                        label="Runtime Version"
                        required
                        errorMsg={errors["primaryDetails.runtimeVersion"]?.message?.toString()}
                        items={runtimeVersions}
                        {...register("primaryDetails.runtimeVersion")}
                    />
                    {isRuntimeVersionChanged && (
                        <Banner 
                        icon={<Codicon name="warning" sx={{fontSize:12}}/>} 
                        type="warning" 
                        message="Extension will restart when submitting" />
                    )}
                </div>
            </FormGroup>

            <FormGroup title="Build Details" isCollapsed={false}>
                <TextField
                    label="Base Image"
                    required
                    errorMsg={errors["dockerDetails.dockerFileBaseImage"]?.message?.toString()}
                    {...register("dockerDetails.dockerFileBaseImage")}
                />
                <TextField
                    label="Docker Name"
                    required
                    errorMsg={errors["dockerDetails.dockerName"]?.message?.toString()}
                    {...register("dockerDetails.dockerName")}
                />
            </FormGroup>

            <FormGroup title="Unit Tests Configuration" isCollapsed={false}>
                <TextField
                    label="Server Host"
                    {...register("unitTest.serverHost")}
                />
                <TextField
                    label="Server Port"
                    {...register("unitTest.serverPort")}
                />
                <TextField
                    label="Server Path"
                    {...register("unitTest.serverPath")}
                />
                <TextField
                    label="Server Type"
                    {...register("unitTest.serverType")}
                />
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
                    onClick={handleSubmit(handleFormSubmit)}
                    disabled={!Object.keys(dirtyFields).length || isSubmitting}
                >
                    Save Changes
                </Button>
            </FormActions>
        </FormView>
    );
}
