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
import { useEffect, useRef, useState } from "react";

import { Button, Dropdown, Banner, FormActions, FormGroup, FormView, OptionProps, ProgressIndicator, TextField, Codicon, SplitView, TreeView, TreeViewItem, Typography } from "@wso2-enterprise/ui-toolkit";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import styled from "@emotion/styled";

interface ProjectInformationFormProps {
    onClose: () => void;
}

const TitleBoxShadow = styled.div`
    box-shadow: var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset;
    height: 3px;
`;

export function ProjectInformationForm(props: ProjectInformationFormProps) {
    const { rpcClient } = useVisualizerContext();
    const [projectDetails, setProjectDetails] = useState<ProjectDetailsResponse>();
    const [runtimeVersions, setRuntimeVersions] = useState<OptionProps[]>([]);
    const [initialRuntimeVersion, setInitialRuntimeVersion] = useState<string>("");

    const [selectedId, setSelectedId] = useState<string | null>("Project Information");

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

    const divRefs: Record<string, React.RefObject<HTMLDivElement>> = {
        "Project Information": useRef<HTMLDivElement | null>(null),
        "Build Details": useRef<HTMLDivElement | null>(null),
        "Unit Test": useRef<HTMLDivElement | null>(null),
    };

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

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setSelectedId(entry.target.id); // Update selectedId based on the visible div
                }
            });
        }, { threshold: 0.8 }); // Adjust threshold as needed

        // Observe each div
        Object.keys(divRefs).forEach(key => {
            if (divRefs[key].current) {
                observer.observe(divRefs[key].current);
            }
        });

        return () => {
            // Cleanup observer on unmount
            observer.disconnect();
        };
    }, [divRefs]);

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

    const handleClick = (id: string) => {
        setSelectedId(id);
        if (divRefs[id].current) {
            divRefs[id].current.scrollIntoView({ behavior: "smooth", block: "start" }); // Scroll to the selected div
        }
    };

    if (!projectDetails) {
        return <ProgressIndicator />;
    }

    console.log("Selected ID: ", selectedId);

    return (
        <SplitView sx={{ width: "auto", height: "auto", padding: 60, maxWidth: 1200 }} defaultWidths={[20, 80]} dynamicContainerSx={{ overflow: "visible" }}>
            {/* Left side view */}
            <div style={{ padding: "50px 0 50px 30px;" }}>
                <TreeView rootTreeView id="Project Information" content={<Typography sx={{ margin: 0 }} variant="h4">Project Information</Typography>} selectedId={selectedId} onSelect={handleClick} />
                <TreeView rootTreeView id="Build Details" content={<Typography sx={{ margin: 0 }} variant="h4">Build Details</Typography>} selectedId={selectedId} onSelect={handleClick} />
                <TreeView rootTreeView id="Unit Test" content={<Typography sx={{ margin: 0 }} variant="h4">Unit Test</Typography>} selectedId={selectedId} onSelect={handleClick} />
            </div>
            {/* Right side view */}
            <div style={{ paddingLeft: 40 }}>
                {/* Title and subtitle */}
                <div style={{ position: "sticky", top: 0, zIndex: 20005, height: 60, color: "var(--vscode-editor-foreground)", backgroundColor: "var(--vscode-editor-background)" }}>
                    <Typography variant="h1" sx={{ marginTop: 0, paddingTop: 8 }} >{selectedId}</Typography>
                    <TitleBoxShadow />
                </div>
                {/* Item 1 */}
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Body 1.1 */}
                    <div ref={divRefs["Project Information"]} id="Project Information" style={{ display: "flex", flexDirection: "column", gap: 40, padding: "0 0 30px", marginTop: "20px" }}>
                        <TextField
                            label="Project Name"
                            required
                            description="The name of the project"
                            descriptionSx={{ margin: "15px 0" }}
                            errorMsg={errors["primaryDetails.projectName"]?.message?.toString()}
                            {...register("primaryDetails.projectName")}
                        />
                        <TextField
                            label="Description"
                            description="The description of the project"
                            descriptionSx={{ margin: "15px 0" }}
                            {...register("primaryDetails.projectDescription")}
                        />
                        <TextField
                            label="Version"
                            required
                            description="The version of the project"
                            descriptionSx={{ margin: "15px 0" }}
                            errorMsg={errors["primaryDetails.projectVersion"]?.message?.toString()}
                            {...register("primaryDetails.projectVersion")}
                        />

                        <Dropdown
                            id='runtimeVersion'
                            label="Runtime Version"
                            required
                            description="The runtime version of the project"
                            descriptionSx={{ margin: "13px 0 15px" }}
                            errorMsg={errors["primaryDetails.runtimeVersion"]?.message?.toString()}
                            items={runtimeVersions}
                            {...register("primaryDetails.runtimeVersion")}
                        />
                        {isRuntimeVersionChanged && (
                            <Banner
                                icon={<Codicon name="warning" sx={{ fontSize: 12 }} />}
                                type="warning"
                                message="Extension will restart when submitting"
                            />
                        )}
                    </div>
                    <Typography variant="h1" sx={{ margin: 0 }} > Build Details </Typography>
                    <div ref={divRefs["Build Details"]} id="Build Details" style={{ display: "flex", flexDirection: "column", gap: 40, padding: "0 0 30px", marginTop: "20px" }}>
                        <TextField
                            label="Base Image"
                            required
                            errorMsg={errors["dockerDetails.dockerFileBaseImage"]?.message?.toString()}
                            description="The base image of the project"
                            descriptionSx={{ margin: "15px 0" }}
                            {...register("dockerDetails.dockerFileBaseImage")}
                        />
                        <TextField
                            label="Docker Name"
                            required
                            errorMsg={errors["dockerDetails.dockerName"]?.message?.toString()}
                            description="The name of the docker"
                            descriptionSx={{ margin: "15px 0" }}
                            {...register("dockerDetails.dockerName")}
                        />
                        <TextField
                            label="Docker Namennnn"
                            required
                            errorMsg={errors["dockerDetails.dockerName"]?.message?.toString()}
                            description="The name of the docker"
                            descriptionSx={{ margin: "15px 0" }}
                            {...register("dockerDetails.dockerName")}
                        />
                        <TextField
                            label="Docker Name"
                            required
                            errorMsg={errors["dockerDetails.dockerName"]?.message?.toString()}
                            description="The name of the docker"
                            descriptionSx={{ margin: "15px 0" }}
                            {...register("dockerDetails.dockerName")}
                        />
                    </div>
                    <Typography variant="h1" sx={{ margin: 0 }} > Unit Test </Typography>
                    <div ref={divRefs["Unit Test"]} id="Unit Test" style={{ display: "flex", flexDirection: "column", gap: 40, padding: "0 0 30px", marginTop: "20px" }}>
                        <TextField
                            label="Server Host"
                            description="The host of the server"
                            descriptionSx={{ margin: "15px 0" }}
                            {...register("unitTest.serverHost")}
                        />
                        <TextField
                            label="Server Port"
                            description="The port of the server"
                            {...register("unitTest.serverPort")}
                        />
                        <TextField
                            label="Server Path"
                            description="The path of the server"
                            {...register("unitTest.serverPath")}
                        />
                        <TextField
                            label="Server Type"
                            description="The type of the server"
                            {...register("unitTest.serverType")}
                        />
                    </div>
                </div>
                <div style={{ position: "sticky", bottom: 0, zIndex: 20005, height: 40, backgroundColor: "var(--vscode-editor-background)"}}>
                    {/* <TitleBoxShadow/> */}
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
                </div>
            </div>
        </SplitView>
    );
}
