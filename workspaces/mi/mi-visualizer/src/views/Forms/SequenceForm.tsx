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
import { EVENT_TYPE, MACHINE_VIEW, POPUP_EVENT_TYPE } from "@wso2-enterprise/mi-core";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { FormKeylookup } from "@wso2-enterprise/mi-diagram";
import path from "path";

export interface SequenceWizardProps {
    path: string;
    isPopup?: boolean;
    handlePopupClose?: () => void;
}

type InputsFields = {
    name?: string;
    endpoint?: string;
    onErrorSequence?: string;
    trace?: boolean;
    statistics?: boolean;
};

const initialSequence: InputsFields = {
    name: "",
    endpoint: "",
    onErrorSequence: "",
    trace: false,
    statistics: false,
};

export function SequenceWizard(props: SequenceWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [workspaceFileNames, setWorkspaceFileNames] = useState([]);
    const [prevName, setPrevName] = useState<string | null>(null);

    const isNewTemplate = !props?.path?.endsWith(".xml");

    const schema = yup.object({
        name: yup.string().required("Sequence name is required").matches(/^[a-zA-Z0-9_-]*$/, "Invalid characters in sequence name")
            .test('validateSequenceName',
                'An artifact with same name already exists', value => {
                    return !workspaceFileNames.includes(value)
                }),
        endpoint: yup.string().notRequired(),
        onErrorSequence: yup.string().notRequired(),
        trace: yup.boolean().default(false),
        statistics: yup.boolean().default(false),
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
            const artifactRes = await rpcClient.getMiDiagramRpcClient().getAllArtifacts({
                path: props.path,
            });
            setWorkspaceFileNames(artifactRes.artifacts);
        })();
    }, []);

    useEffect(() => {
        setPrevName(watch("name"));
    }, [watch("name")]);

    const handleCreateSequence = async (values: any) => {
        const projectDir = props.path ? (await rpcClient.getMiDiagramRpcClient().getProjectRoot({ path: props.path })).path : (await rpcClient.getVisualizerState()).projectUri;
        const sequenceDir = path.join(projectDir, 'src', 'main', 'wso2mi', 'artifacts', 'sequences').toString();
        const createSequenceParams = {
            ...values,
            getContentOnly: false,
            directory: sequenceDir,
        }
        await rpcClient.getMiDiagramRpcClient().createSequence(createSequenceParams);
        if (props.isPopup) {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: POPUP_EVENT_TYPE.CLOSE_VIEW,
                location: { view: null, recentIdentifier: getValues("name") },
                isPopup: true
            });
        } else {
            handleCancel();
        }
    };

    const handleCancel = () => {
        props.handlePopupClose ? props.handlePopupClose() : rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleBackButtonClick = () => {
        props.handlePopupClose ? props.handlePopupClose() : rpcClient.getMiVisualizerRpcClient().goBack();
    }

    return (
        <FormView title="Create New Sequence" onClose={handleBackButtonClick} >
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
