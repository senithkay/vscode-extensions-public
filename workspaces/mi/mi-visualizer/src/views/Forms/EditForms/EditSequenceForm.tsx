/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { Button, FormActions, FormView } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import ControllerField, { FieldType } from "../Commons/ControllerField";

export type EditSequenceFields = {
    name?: string;
    onError?: string;
    trace?: boolean;
    statistics?: boolean;
};

export type ResourceProps = {
    isOpen: boolean;
    sequenceData: EditSequenceFields;
    onCancel: () => void;
    onSave: (data: EditSequenceFields) => void;
    documentUri: string;
};

export function EditSequenceForm({ sequenceData, isOpen, onCancel, onSave, documentUri }: ResourceProps) {

    const { rpcClient } = useVisualizerContext();
    // sequence file names
    const [sequences, setSequences] = useState([]);
    // sequence artifact names
    const [seqArtifactNames, setSeqArtifactNames] = useState([]);

    const initialSequence: EditSequenceFields = {
        name: sequenceData.name,
        onError: sequenceData.onError,
        trace: sequenceData.trace,
        statistics: sequenceData.statistics,
    };

    const schema = yup.object({
        name: yup.string().required("Sequence name is required").matches(/^[a-zA-Z0-9]*$/, "Invalid characters in sequence name")
            .test('validateSequenceName',
                'Sequence file name already exists', value => {
                    return !(sequences.includes(value) && sequenceData.name !== value)
                }).test('validateSequenceName',
                    'Sequence artifact name already exists', value => {
                        return !(seqArtifactNames.includes(value) && sequenceData.name !== value)
                    }),
        endpoint: yup.string(),
        onError: yup.string(),
        trace: yup.boolean(),
        statistics: yup.boolean()
    });

    const {
        handleSubmit,
        control,
        formState: { errors, isDirty },
    } = useForm<EditSequenceFields>({
        defaultValues: initialSequence,
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        (async () => {
            const response = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: documentUri,
                resourceType: "sequence",
            });
            let sequenceNamesArr = [];
            if (response.resources) {
                const sequenceNames = response.resources.map((resource) => resource.name);
                setSeqArtifactNames(sequenceNames);
                const seqPaths = response.resources.map((resource) => resource.artifactPath.replace(".xml", ""));
                sequenceNamesArr.push(...seqPaths);
            }
            if (response.registryResources) {
                const registryKeys = response.registryResources.map((resource) => resource.registryKey);
                sequenceNamesArr.push(...registryKeys);
            }
            setSequences(sequenceNamesArr);
            const endpointResponse = await rpcClient.getMiDiagramRpcClient().getAvailableResources({
                documentIdentifier: documentUri,
                resourceType: "endpoint",
            });
        })();
    }, []);

    return (
        <FormView title={`Edit Sequence : ${sequenceData.name}`} onClose={onCancel}>
            <ControllerField
                required
                autoFocus
                id="name"
                label="Name"
                control={control}
                errors={errors}
            />
            <ControllerField
                id="trace"
                label="Enable tracing"
                fieldType={FieldType.CHECKBOX}
                control={control}
                errors={errors}
            />
            <ControllerField
                id="statistics"
                label="Enable statistics"
                fieldType={FieldType.CHECKBOX}
                control={control}
                errors={errors}
            />
            <ControllerField
                required
                autoFocus
                id="onError"
                label="On-error sequence"
                control={control}
                errors={errors}
                fieldType={FieldType.AUTOCOMPLETE}
                items={sequences.filter(seq => seq !== sequenceData.name)}
            />
            <FormActions>
                <Button
                    appearance="secondary"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    appearance="primary"
                    disabled={!isDirty}
                    onClick={handleSubmit((values) => onSave(values))}
                >
                    Update
                </Button>
            </FormActions>
        </FormView>
    );
}

