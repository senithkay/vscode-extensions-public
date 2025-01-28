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

import { Button, Dropdown, Banner, FormActions, FormGroup, FormView, OptionProps, ProgressIndicator, TextField, Codicon, SplitView, TreeView, TreeViewItem, Typography, FormCheckBox } from "@wso2-enterprise/ui-toolkit";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import styled from "@emotion/styled";

interface ProjectInformationFormProps {
    selectedComponent?: string;
    onClose: () => void;
}

const TitleBoxShadow = styled.div`
    box-shadow: var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset;
    height: 3px;
`;

const fieldGroupStyle = { display: "flex", flexDirection: "column", gap: 24, padding: "0 0 30px", marginTop: "20px", paddingLeft: "10px" };
const fieldStyle = { 
    padding: "10px",
    "&:hover": { backgroundColor: "var(--vscode-settings-rowHoverBackground)" },
};
const treeViewStyle = { margin: "0px 0px 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const sectionTitleStyle = { margin: 0, paddingLeft: 20 };

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
        "dockerDetails.enableCipherTool": yup.boolean(),
        "buildDetails.dockerDetails.keyStoreName": yup.string(),
        "buildDetails.dockerDetails.keyStoreAlias": yup.string(),
        "buildDetails.dockerDetails.keyStoreType": yup.string(),
        "buildDetails.dockerDetails.keyStorePassword": yup.string(),
        "advanced.mavenArtifactId": yup.string(),
        "advanced.mavenGroupId": yup.string(),
        "advanced.carPluginVersion": yup.string(),
        "advanced.unitTestPluginVersion": yup.string(),
        "advanced.miConfigMapperPluginVersion": yup.string(),
        "unitTest.skipTest": yup.boolean(),
        "unitTest.serverHost": yup.string(),
        "unitTest.serverPort": yup.string(),
        "unitTest.serverPath": yup.string(),
        "unitTest.serverType": yup.string(),
        "unitTest.serverVersion": yup.string(),
        "unitTest.serverDownloadLink": yup.string(),
    });

    const {
        control,
        register,
        formState: { errors, dirtyFields, isSubmitting },
        handleSubmit,
        reset,
        getValues,
        control,
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
    const contentRef = useRef<HTMLDivElement | null>(null); // Ref for the content div

    console.log("Project Log", props.selectedComponent);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await rpcClient?.getMiVisualizerRpcClient().getProjectDetails();
                console.log("Maven Artifact Id:", response.buildDetails?.advanceDetails?.projectArtifactId?.value);
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
                    "dockerDetails.enableCipherTool": Boolean(response.buildDetails?.dockerDetails?.cipherToolEnable?.value),
                    "buildDetails.dockerDetails.keyStoreName": response.buildDetails?.dockerDetails?.keyStoreName?.value,
                    "buildDetails.dockerDetails.keyStoreAlias": response.buildDetails?.dockerDetails?.keyStoreAlias?.value,
                    "buildDetails.dockerDetails.keyStoreType": response.buildDetails?.dockerDetails?.keyStoreType?.value,
                    "buildDetails.dockerDetails.keyStorePassword": response.buildDetails?.dockerDetails?.keyStorePassword?.value,
                    "advanced.mavenArtifactId": response.buildDetails?.advanceDetails?.projectArtifactId?.value,
                    "advanced.mavenGroupId": response.buildDetails?.advanceDetails?.projectGroupId?.value,
                    "advanced.carPluginVersion": response.buildDetails?.advanceDetails?.pluginDetatils?.projectBuildPluginVersion?.value,
                    "advanced.unitTestPluginVersion": response.buildDetails?.advanceDetails?.pluginDetatils?.unitTestPluginVersion?.value,
                    "advanced.miConfigMapperPluginVersion": response.buildDetails?.advanceDetails?.pluginDetatils?.miContainerPluginVersion?.value,
                    "unitTest.skipTest": Boolean(response.unitTest?.skipTest?.value),
                    "unitTest.serverHost": response.unitTest?.serverHost?.value,
                    "unitTest.serverPort": response.unitTest?.serverPort?.value,
                    "unitTest.serverPath": response.unitTest?.serverPath?.value,
                    "unitTest.serverType": response.unitTest?.serverType?.value,
                    "unitTest.serverVersion": response.unitTest?.serverVersion?.value,
                    "unitTest.serverDownloadLink": response.unitTest?.serverDownloadLink?.value,
                });
            } catch (error) {
                console.error("Error fetching project details:", error);
            }
        }
        fetchData();
    }, [rpcClient, reset]);

    const scrollTo = (id: string, behavior?: ScrollBehavior) => {
        const targetDiv = divRefs[id].current;
        const contentDiv = contentRef.current;
        const targetPosition = targetDiv.getBoundingClientRect().top - contentDiv.getBoundingClientRect().top;
        contentDiv.scrollTo({
            top: targetPosition + contentDiv.scrollTop, // Add current scroll position
            behavior: behavior // Optional: for smooth scrolling
        });
    };

    useEffect(() => {
        const navigatorObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setSelectedId(entry.target.id); // Update selectedId based on the visible div
                }
            });
        }, { threshold: 0.2 }); // Adjust threshold as needed

        // Observe each div
        Object.keys(divRefs).forEach(key => {
            if (divRefs[key].current) {
                navigatorObserver.observe(divRefs[key].current);
            }
        });
        return () => {
            // Cleanup observer on unmount
            navigatorObserver.disconnect();
        };
    }, [divRefs]);

    const handleFormSubmit = async () => {
        try {
            const changes: any[] = [];
            const processFields = (fields: any, path: string = '') => {
                Object.entries(fields).forEach(([key, value]) => {
                    const newPath = path ? `${path}.${key}` : key;
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        processFields(value, newPath);
                    } else {
                        const fieldValue = getValues(newPath as any);
                        const range = newPath.split('.').reduce((acc, key) => acc?.[key], projectDetails as any)?.range;
                        if (range) {
                            changes.push({ value: fieldValue, range });
                        }
                    }
                });
            };

            Object.entries(dirtyFields).forEach(([section, fields]) => {
                processFields(fields, section);
            });

            // sort changes by range
            const sortedChanges = changes.sort((a, b) => b.range.start - a.range.start);

            await rpcClient.getMiVisualizerRpcClient().updatePomValues({ pomValues: sortedChanges });

            const updatedValues = Object.keys(dirtyFields);

            // if (updatedValues.includes("advanced")) {
            //     let isLegacyExpressionSupportEnabled = getValues("advanced.legacyExpressionSupport");
            //     await rpcClient.getMiVisualizerRpcClient().updateLegacyExpressionSupport(isLegacyExpressionSupportEnabled);
            // }
            if (isRuntimeVersionChanged) {
                await rpcClient.getMiVisualizerRpcClient().reloadWindow();
            } else {
                props.onClose();
            }
        } catch (error) {
            console.error("Error updating project details:", error);
        }
    };

    useEffect(() => {
        if (!divRefs["Unit Test"].current) {
            setTimeout(() => {
                if (divRefs["Unit Test"].current) {
                    setSelectedId(props.selectedComponent);
                    scrollTo(props.selectedComponent);
                }
            }, 100);
        }
    }, []);

    const handleCancel = () => {
        props.onClose();
    };

    const handleClick = (id: string) => {
        setSelectedId(id);
        scrollTo(id);
    };

    if (!projectDetails) {
        return <ProgressIndicator />;
    }

    return (
        <SplitView sx={{ width: "auto", maxWidth: 1200, padding: 60 }} defaultWidths={[25, 75]} dynamicContainerSx={{ overflow: "visible" }}>
            {/* Left side tree view */}
            <div style={{ padding: "10px 0 50px 0" }}>
                <TreeView 
                    rootTreeView 
                    id="Project Information"
                    sx={ selectedId === "Project Information" ? { cursor: "pointer", border: "1px solid var(--vscode-focusBorder)" } : { cursor: "pointer" }}
                    content={
                        <Typography sx={treeViewStyle} variant="h4">Project Information</Typography>
                    } 
                    selectedId={selectedId}
                    onSelect={handleClick}
                />
                <TreeView 
                    rootTreeView 
                    id="Build Details"
                    sx={selectedId === "Build Details" ? { cursor: "pointer", border: "1px solid var(--vscode-focusBorder)" } : { cursor: "pointer" }}
                    content={
                        <Typography sx={treeViewStyle} variant="h4">
                            Build Details
                        </Typography>
                    }
                    selectedId={selectedId} 
                    onSelect={handleClick}
                />
                <TreeView 
                    rootTreeView
                    id="Unit Test"
                    sx={selectedId === "Unit Test" ? { cursor: "pointer", border: "1px solid var(--vscode-focusBorder)" } : { cursor: "pointer" }}
                    content={
                        <Typography sx={treeViewStyle} variant="h4">
                            Unit Test
                        </Typography>
                    }
                    selectedId={selectedId}
                    onSelect={handleClick} 
                />
            </div>
            {/* Right side view */}
            <div>
                {/* Title and subtitle */}
                <div id="TitleDiv" style={{ position: "sticky", top: 0, zIndex: 20005, height: 60, color: "var(--vscode-editor-foreground)", backgroundColor: "var(--vscode-editor-background)" }}>
                    <Typography variant="h1" sx={{ marginTop: 0, padding: "8px 0 0 40px" }} >{selectedId}</Typography>
                    <TitleBoxShadow />
                </div>
                {/* Item 1 */}
                <div id={"content"} ref={contentRef} style={{ maxHeight: '65vh', overflowY: 'auto', paddingLeft: 20 }}>
                    {/* Body 1.1 */}
                    <div ref={divRefs["Project Information"]} id="Project Information" style={fieldGroupStyle}>
                        <TextField
                            label="Project Name"
                            required
                            description="The name of the project"
                            descriptionSx={{ margin: "8px 0" }}
                            errorMsg={errors["primaryDetails.projectName"]?.message?.toString()}
                            sx={fieldStyle}
                            {...register("primaryDetails.projectName")}
                        />
                        <TextField
                            label="Description"
                            description="The description of the project"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("primaryDetails.projectDescription")}
                        />
                        <TextField
                            label="Version"
                            required
                            description="The version of the project"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            errorMsg={errors["primaryDetails.projectVersion"]?.message?.toString()}
                            {...register("primaryDetails.projectVersion")}
                        />

                        <Dropdown
                            id='runtimeVersion'
                            label="Runtime Version"
                            required
                            description="The runtime version of the project"
                            descriptionSx={{ margin: "6px 0 8px" }}
                            containerSx={fieldStyle}
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
                    <Typography variant="h1" sx={sectionTitleStyle} > Build Details </Typography>
                    <div ref={divRefs["Build Details"]} id="Build Details" style={fieldGroupStyle}>
                        <TextField
                            label="Base Image"
                            required
                            errorMsg={errors["dockerDetails.dockerFileBaseImage"]?.message?.toString()}
                            description="The base image of the project"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("dockerDetails.dockerFileBaseImage")}
                        />
                        <TextField
                            label="Docker Name"
                            required
                            errorMsg={errors["dockerDetails.dockerName"]?.message?.toString()}
                            description="The name of the docker"
                            descriptionSx={{ margin: "10px 0" }}
                            sx={fieldStyle}
                            {...register("dockerDetails.dockerName")}
                        />
                        <FormCheckBox
                            label="Enable Cipher Tool"
                            description="Enables the cipher tool"
                            descriptionSx={{ margin: "10px 0" }}
                            control={control}
                            sx={fieldStyle}
                            {...register("dockerDetails.enableCipherTool")}
                        />
                        <TextField
                            label="Keystore Name"
                            description="The name of the keystore"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("buildDetails.dockerDetails.keyStoreName")}
                        />
                        <TextField
                            label="Keystore Alias"
                            description="The alias of the keystore"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("buildDetails.dockerDetails.keyStoreAlias")}
                        />
                        <TextField
                            label="Keystore Type"
                            description="The type of the keystore"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("buildDetails.dockerDetails.keyStoreType")}
                        />
                        <TextField
                            label="Keystore Password"
                            type="password"
                            description="The password of the keystore"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("buildDetails.dockerDetails.keyStorePassword")}
                        />
                        <TextField
                            label="Maven Artifact Id"
                            description="The artifact id of the maven"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("advanced.mavenArtifactId")}
                        />
                        <TextField
                            label="Maven Group Id"
                            description="The group id of the maven"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("advanced.mavenGroupId")}
                        />
                        <TextField
                            label="CAR Plugin Version"
                            description="The version of the car plugin"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("advanced.carPluginVersion")}
                        />
                        <TextField
                            label="Unit Test Plugin Version"
                            description="The version of the unit test plugin"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("advanced.unitTestPluginVersion")}
                        />
                        <TextField
                            label="MI Config Mapper Plugin Version"
                            description="The version of the mi config mapper plugin"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("advanced.miConfigMapperPluginVersion")}
                        />
                    </div>
                    <Typography variant="h1" sx={sectionTitleStyle} > Unit Test </Typography>
                    <div ref={divRefs["Unit Test"]} id="Unit Test" style={{...fieldGroupStyle, paddingBottom: 0}}>
                        <TextField
                            label="Server Host"
                            description="The host of the server"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("unitTest.serverHost")}
                        />
                        <TextField
                            label="Server Port"
                            description="The port of the server"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("unitTest.serverPort")}
                        />
                        <TextField
                            label="Server Path"
                            description="The path of the server"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("unitTest.serverPath")}
                        />
                        <TextField
                            label="Server Type"
                            description="The type of the server"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("unitTest.serverType")}
                        />
                        <TextField
                            label="Server Version"
                            description="The version of the server"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("unitTest.serverVersion")}
                        />
                        <TextField
                            label="Server Download Link"
                            description="The download link of the server"
                            descriptionSx={{ margin: "8px 0" }}
                            sx={fieldStyle}
                            {...register("unitTest.serverDownloadLink")}
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
