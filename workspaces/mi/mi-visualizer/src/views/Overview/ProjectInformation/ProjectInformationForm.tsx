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

import { Button, FormActions, FormGroup, FormView, ProgressIndicator, TextField } from "@wso2-enterprise/ui-toolkit";
import { getParamManagerValues, ParamConfig, ParamManager } from "@wso2-enterprise/mi-diagram";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";

interface ProjectInformationFormProps {
    onClose: () => void;
}
export function ProjectInformationForm(props: ProjectInformationFormProps) {
    const { rpcClient } = useVisualizerContext();
    const [projectDetails, setProjectDetails] = useState<ProjectDetailsResponse>();

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
        "dependenciesDetails.connectorDependencies": yup.object<any>({}),
        "dependenciesDetails.otherDependencies": yup.object<any>({})
    });

    const {
        register,
        formState: { errors, isDirty, dirtyFields, isSubmitting },
        handleSubmit,
        reset,
        getValues,
        control
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await rpcClient?.getMiVisualizerRpcClient().getProjectDetails();
                setProjectDetails(response);

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
                    "dependenciesDetails.connectorDependencies": setDependencies(response.dependencies.connectorDependencies),
                    "dependenciesDetails.otherDependencies": setDependencies(response.dependencies.otherDependencies)
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

            const updateDependencies = async () => {
                const dependencies = [];
                for (const field of Object.keys((dirtyFields as any)?.dependenciesDetails)) {
                    const value = getValues((`dependenciesDetails.${field}` as any).toString());
                    const paramValues = getParamManagerValues(value);
                    const range = (projectDetails as any)?.dependenciesDetails?.[field]?.range;

                    for (const paramValue of paramValues) {
                        dependencies.push({
                            groupId: paramValue[0],
                            artifact: paramValue[1],
                            version: paramValue[2],
                            range,
                            type: field
                        });
                    }
                }
                await rpcClient.getMiVisualizerRpcClient().updateDependencies({
                    dependencies
                });
            }
            await updateDependencies();

            props.onClose();
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
                <TextField
                    label="Runtime Version"
                    required
                    errorMsg={errors["primaryDetails.runtimeVersion"]?.message?.toString()}
                    {...register("primaryDetails.runtimeVersion")}
                />
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

            <FormGroup title="Dependencies" isCollapsed={false}>
                <Controller
                    name="dependenciesDetails.connectorDependencies"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <ParamManager
                            paramConfigs={value}
                            readonly={false}
                            addParamText="Add Connector Dependency"
                            onChange={(values: ParamConfig) => {
                                values.paramValues = values.paramValues.map((param: any) => {
                                    const paramValues = param.paramValues;
                                    param.key = paramValues[0].value;
                                    param.value = paramValues[1].value;
                                    param.icon = 'query';
                                    return param;
                                });
                                onChange(values);
                            }}
                        />
                    )}
                />
                <Controller
                    name="dependenciesDetails.otherDependencies"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <ParamManager
                            paramConfigs={value}
                            readonly={false}
                            addParamText="Add Other Dependency"
                            onChange={(values: ParamConfig) => {
                                values.paramValues = values.paramValues.map((param: any) => {
                                    const paramValues = param.paramValues;
                                    param.key = paramValues[0].value;
                                    param.value = paramValues[1].value;
                                    param.icon = 'query';
                                    return param;
                                });
                                onChange(values);
                            }}
                        />
                    )}
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
