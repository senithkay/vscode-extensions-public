/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from "react";
import { FormAutoComplete, Button, FormGroup, TextField, FormView, FormActions, FormCheckBox } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import AddToRegistry, { getRegistryArifactNames, formatRegistryPath, saveToRegistry } from "./AddToRegistry";

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
    const [endpoints, setEndpoints] = useState([]);
    // sequence file names
    const [sequences, setSequences] = useState([]);
    // sequence artifact names
    const [seqArtifactNames, setSeqArtifactNames] = useState([]);
    const [artifactNames, setArtifactNames] = useState([]);
    const [registryPaths, setRegistryPaths] = useState([]);

    const schema = yup.object({
        name: yup.string().required("Sequence name is required").matches(/^[a-zA-Z0-9]*$/, "Invalid characters in sequence name")
            .test('validateSequenceName',
                'Sequence file name already exists', value => {
                    return !sequences.includes(value)
                }).test('validateSequenceName',
                    'Sequence artifact name already exists', value => {
                        return !seqArtifactNames.includes(value)
                    }),
        endpoint: yup.string(),
        onErrorSequence: yup.string(),
        saveInReg: yup.boolean(),
        trace: yup.boolean(),
        statistics: yup.boolean(),
        artifactName: yup.string().when('saveInReg', {
            is: false,
            then: () =>
                yup.string().notRequired(),
            otherwise: () =>
                yup.string().required("Artifact Name is required").test('validateArtifactName',
                    'Artifact name already exists', value => {
                        return !artifactNames.includes(value);
                    }),
        }),
        registryPath: yup.string().when('saveInReg', {
            is: false,
            then: () =>
                yup.string().notRequired(),
            otherwise: () =>
                yup.string().test('validateRegistryPath', 'Resource already exists in registry', value => {
                    const formattedPath = formatRegistryPath(value, getValues("registryType"), getValues("name"));
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
        formState: { errors, isDirty },
    } = useForm<InputsFields>({
        defaultValues: initialSequence,
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        (async () => {
            const response = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: props.path,
                resourceType: "sequence",
            });
            if (response.resources) {
                const sequenceNames = response.resources.map((resource) => resource.name);
                setSeqArtifactNames(sequenceNames);
                const seqPaths = response.resources.map((resource) => resource.artifactPath.replace(".xml", ""));
                setSequences(seqPaths);
            }
            const endpointResponse = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: props.path,
                resourceType: "endpoint",
            });
            // get endpoints from registry and workspace
            let endpointNames = [];
            if (endpointResponse.registryResources) {
                const registryKeys = endpointResponse.registryResources.map((resource) => resource.registryKey);
                endpointNames.push(...registryKeys);
            }
            if (endpointResponse.resources) {
                const resources = endpointResponse.resources.map((resource) => resource.name);
                endpointNames.push(...resources);
            }
            setEndpoints(endpointNames);
            const result = await getRegistryArifactNames(props.path, rpcClient);
            setArtifactNames(result.artifactNamesArr);
            const res = await rpcClient.getMiVisualizerRpcClient().getAllRegistryPaths({
                path: props.path,
            });
            setRegistryPaths(res.registryPaths);
        })();
    }, []);

    const handleCreateSequence = async (values: any) => {
        const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({ path: props.path })).path;
        const sequenceDir = `${projectDir}/src/main/wso2mi/artifacts/sequences`;
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
                <FormAutoComplete
                    label="Endpoint"
                    required={false}
                    isNullable={true}
                    items={endpoints}
                    control={control}
                    {...register("endpoint")}
                />
                <FormAutoComplete
                    label="On Error Sequence"
                    required={false}
                    isNullable={true}
                    items={sequences}
                    control={control}
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
                    Create
                </Button>
            </FormActions>
        </FormView>
    );
}
