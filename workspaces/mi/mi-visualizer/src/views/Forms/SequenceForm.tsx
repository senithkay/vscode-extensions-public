/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from "react";
import { Button, FormGroup, TextField, FormView, FormActions, FormCheckBox } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import AddToRegistry, { getArtifactNamesAndRegistryPaths, formatRegistryPath, saveToRegistry } from "./AddToRegistry";
import { FormKeylookup } from "@wso2-enterprise/mi-diagram";
import path from "path";

export interface SequenceWizardProps {
    path: string;
}

type InputsFields = {
    name?: string;
    endpoint?: string;
    onErrorSequence?: string;
    saveInReg?: boolean;
    trace?: boolean;
    statistics?: boolean;
    //reg form
    artifactName?: string;
    registryPath?: string
    registryType?: "gov" | "conf";
};

const initialSequence: InputsFields = {
    name: "",
    endpoint: "",
    onErrorSequence: "",
    saveInReg: false,
    trace: false,
    statistics: false,
    //reg form
    artifactName: "",
    registryPath: "/",
    registryType: "gov"
};

export function SequenceWizard(props: SequenceWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [artifactNames, setArtifactNames] = useState([]);
    const [registryPaths, setRegistryPaths] = useState([]);
    const [workspaceFileNames, setWorkspaceFileNames] = useState([]);
    const [prevName, setPrevName] = useState<string | null>(null);

    const isNewTemplate = !props.path.endsWith(".xml");

    const schema = yup.object({
        name: yup.string().required("Sequence name is required").matches(/^[a-zA-Z0-9_-]*$/, "Invalid characters in sequence name")
            .test('validateSequenceName',
                'An artifact with same name already exists', value => {
                    return !workspaceFileNames.includes(value)
                }).test('validateArtifactName',
                    'A registry resource with this artifact name already exists', value => {
                        return !artifactNames.includes(value)
                    }),
        endpoint: yup.string().notRequired(),
        onErrorSequence: yup.string().notRequired(),
        saveInReg: yup.boolean().default(false),
        trace: yup.boolean().default(false),
        statistics: yup.boolean().default(false),
        artifactName: yup.string().when('saveInReg', {
            is: false,
            then: () =>
                yup.string().notRequired(),
            otherwise: () =>
                yup.string().required("Artifact Name is required").test('validateArtifactName',
                    'Artifact name already exists', value => {
                        return !artifactNames.includes(value);
                    }).test('validateFileName',
                        'A file already exists in the workspace with this artifact name', value => {
                            return !workspaceFileNames.includes(value);
                        }),
        }),
        registryPath: yup.string().when('saveInReg', {
            is: false,
            then: () =>
                yup.string().notRequired(),
            otherwise: () =>
                yup.string().required("Registry Path is required")
                    .test('validateRegistryPath', 'Resource already exists in registry', value => {
                    const formattedPath = formatRegistryPath(value, getValues("registryType"), getValues("name"));
                    if (formattedPath === undefined) return true;
                    return !(registryPaths.includes(formattedPath) || registryPaths.includes(formattedPath + "/"));
                }),
        }),
        registryType: yup.mixed<"gov" | "conf">().oneOf(["gov", "conf"]),
    });

    const {
        register,
        watch,
        handleSubmit,
        getValues,
        control,
        setValue,
        formState: { errors, isDirty },
    } = useForm<InputsFields>({
        defaultValues: initialSequence,
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        (async () => {
            const result = await getArtifactNamesAndRegistryPaths(props.path, rpcClient);
            setArtifactNames(result.artifactNamesArr);
            setRegistryPaths(result.registryPaths);
            const artifactRes = await rpcClient.getMiDiagramRpcClient().getAllArtifacts({
                path: props.path,
            });
            setWorkspaceFileNames(artifactRes.artifacts);
        })();
    }, []);

    useEffect(() => {
        setPrevName(watch("name"));
        if (prevName === watch("artifactName")) {
            setValue("artifactName", watch("name"));
        }
    }, [watch("name")]);

    const handleCreateSequence = async (values: any) => {
        const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({ path: props.path })).path;
        const sequenceDir = path.join(projectDir, 'src','main','wso2mi','artifacts', 'sequences').toString();
        const createSequenceParams = {
            ...values,
            getContentOnly: watch("saveInReg"),
            directory: sequenceDir,
        }
        const result = await rpcClient.getMiDiagramRpcClient().createSequence(createSequenceParams);
        if (watch("saveInReg")) {
            await saveToRegistry(rpcClient, props.path, values.registryType, values.name, result.fileContent, values.registryPath, values.artifactName);
        }
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    return (
        <FormView title="Create New Sequence" onClose={handleBackButtonClick}>
            <TextField
                id='name-input'
                label="Name"
                placeholder="Name"
                errorMsg={errors.name?.message.toString()}
                {...register("name")}
            />
            <FormGroup title="Advanced Configuration" isCollapsed={true}>
                <FormKeylookup
                    control={control}
                    label="Endpoint"
                    name="endpoint"
                    filterType="endpoint"
                    path={props.path}
                    errorMsg={errors.endpoint?.message.toString()}
                    {...register("endpoint")}
                />
                <FormKeylookup
                    control={control}
                    label="On Error Sequence"
                    name="onErrorSequence"
                    filterType="sequence"
                    path={props.path}
                    errorMsg={errors.onErrorSequence?.message.toString()}
                    {...register("onErrorSequence")}
                />
                <FormCheckBox
                    label="Enable tracing"
                    {...register("trace")}
                    control={control}
                />
                <FormCheckBox
                    label="Enable statistics"
                    {...register("statistics")}
                    control={control}
                />
            </FormGroup>
            <FormCheckBox
                label="Save the sequence in registry"
                {...register("saveInReg")}
                control={control}
            />
            {watch("saveInReg") && (<>
                <AddToRegistry path={props.path} fileName={watch("name")} register={register} errors={errors} getValues={getValues} />
            </>)}
            <FormActions>
                <Button
                    appearance="secondary"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
                <Button
                    appearance="primary"
                    disabled={!isDirty}
                    onClick={handleSubmit(handleCreateSequence)}
                >
                    {isNewTemplate ? "Create" : "Save Changes"}
                </Button>
            </FormActions>
        </FormView>
    );
}
