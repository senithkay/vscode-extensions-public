/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from "react";
import { AutoComplete, Button, FormGroup, TextField, FormView, FormActions, CheckBox } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import AddToRegistry, { getArifactNamesAndPaths, formatRegistryPath, saveToRegistry } from "./AddToRegistry";

export interface SequenceWizardProps {
    path: string;
}

type InputsFields = {
    name?: string;
    endpoint?: string;
    onErrorSequence?: string;
    saveInReg?: boolean;
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
    //reg form
    artifactName: "",
    registryPath: "/",
    registryType: "gov"
};

export function SequenceWizard(props: SequenceWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [endpoints, setEndpoints] = useState([]);
    const [sequences, setSequences] = useState([]);
    const [artifactNames, setArtifactNames] = useState([]);
    const [registryPaths, setRegistryPaths] = useState([]);

    const schema = yup.object({
        name: yup.string().required("Task Name is required").matches(/^[a-zA-Z0-9]*$/, "Invalid characters in sequence name")
            .test('validateSequenceName',
                'Sequence name already exists', value => {
                    return !sequences.includes(value);
                }),
        endpoint: yup.string(),
        onErrorSequence: yup.string(),
        saveInReg: yup.boolean(),
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
                yup.string().test('validateRegistryPath', 'Resource already exists', value => {
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
        formState: { errors, isValid, isDirty },
        setValue } = useForm<InputsFields>({
            defaultValues: initialSequence,
            resolver: yupResolver(schema),
            mode: "onChange",
        });

    useEffect(() => {
        (async () => {
            const data = await rpcClient.getMiDiagramRpcClient().getEndpointsAndSequences();
            setEndpoints(data.data[0]);
            setSequences(data.data[1]);
            const result = await getArifactNamesAndPaths(props.path, rpcClient);
            setArtifactNames(result.artifactNamesArr);
            setRegistryPaths(result.registryPathsArr);
        })();
    }, []);

    const handleCreateSequence = async (values: any) => {
        console.log(getValues("saveInReg"));
        console.log(errors);
        const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({ path: props.path })).path;
        const sequenceDir = `${projectDir}/src/main/wso2mi/artifacts/sequences`;
        const createSequenceParams = {
            ...values,
            getContentOnly: watch("saveInReg"),
            directory: sequenceDir,
        }
        const result = await rpcClient.getMiDiagramRpcClient().createSequence(createSequenceParams);
        if (watch("saveInReg")) {
            console.log("saving to registry");
            await saveToRegistry(rpcClient, props.path, values.registryType, values.name, result.fileContent, values.registryPath, values.artifactName);
        } else {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
        }
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
                <AutoComplete
                    nullable={true}
                    id="endpoint"
                    label="Endpoint"
                    items={endpoints}
                    value={watch("endpoint")}
                    onValueChange={(value) => setValue("endpoint", value)}
                    {...register("endpoint")}>
                </AutoComplete>
                <AutoComplete
                    nullable={true}
                    id="on-error-sequence"
                    label="On Error Sequence"
                    items={sequences}
                    value={watch("onErrorSequence")}
                    onValueChange={(value) => setValue("onErrorSequence", value)}
                    {...register("onErrorSequence")}>
                </AutoComplete>
            </FormGroup>
            <CheckBox
                label="Save the sequence in registry"
                {...register("saveInReg")}
                checked={watch("saveInReg")}
                value="registry"
                onChange={(checked) => setValue("saveInReg", checked, { shouldValidate: true })}
            >
            </CheckBox>
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
                    disabled={!isDirty || !isValid}
                    onClick={handleSubmit(handleCreateSequence)}
                >
                    Create
                </Button>
            </FormActions>
        </FormView>
    );
}
