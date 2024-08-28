/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from "react";
import { FormGroup, Button, LocationSelector, CheckBox, FormActions } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";

export interface DatabaseDriverFormProps {
    renderProps: any;
    watch: any;
    setValue: any;
    control: any;
    handleSubmit: any;
    onNext: any;
    onBack: any;
    onSubmit: any;
    isEditDatasource: boolean;
}

export function DatabaseDriverForm(props: DatabaseDriverFormProps) {

    const { rpcClient } = useVisualizerContext();

    const [isDriverValid, setIsDriverValid] = useState(null);
    const [continueWithoutDriver, setContinueWithoutDriver] = useState(false);

    const isFormValid = continueWithoutDriver || isDriverValid;

    useEffect(() => {
        if (props.watch('rdbms.useSecretAlias')) {
            props.setValue('rdbms.password', '');
        } else {
            props.setValue('rdbms.secretAlias', '');
        }
    }, [props.watch('rdbms.useSecretAlias')]);

    const handleAddDriver = async () => {
        const driverPath = await rpcClient.getMiDiagramRpcClient().addDriverToLib({ url: props.watch('driverPath') });
        // Check Driver is valid
        // Assume Driver is valid
        setIsDriverValid(true);
    }

    const handleDriverDirSelection = async () => {
        const projectDirectory = await rpcClient.getMiDiagramRpcClient().askDriverPath();
        props.setValue("driverPath", projectDirectory.path);
    }

    const removeDriver = async () => {
        setIsDriverValid(null);
    }

    return (
        <>
            <FormGroup title="Select Database Driver" isCollapsed={false}>
                {isDriverValid === null ? (
                    <>
                        <LocationSelector
                            label="Select Driver Directory"
                            selectedFile={props.watch("driverPath")}
                            required
                            onSelect={handleDriverDirSelection}
                            {...props.renderProps('driverPath')}
                        />
                        {props.watch('driverPath') &&
                            <Button
                                appearance="secondary"
                                onClick={handleAddDriver}>
                                Add Driver
                            </Button>}
                        <span>Note: </span>
                        <span>These drivers will only be used in the developer environment to enhance
                            the developer experience and therefore make sure to add them to the
                            production environment when deploying the carbon application.</span>
                    </>
                ) : isDriverValid ? <span>Driver added succesfully!</span> :
                    isDriverValid === false && (
                        <>
                            <span>Error!</span>
                            <span>The database driver selected does not contain the relevant driver
                                class of the datasource</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Button
                                    appearance="secondary"
                                    onClick={removeDriver}>
                                    Remove
                                </Button>
                            </div>
                        </>
                    )}
            </FormGroup>
            {!isDriverValid && (
                <CheckBox
                    checked={continueWithoutDriver}
                    label={"Continue without any database driver"}
                    onChange={(checked) => {
                        setContinueWithoutDriver(checked);
                    }}
                />
            )}
            {continueWithoutDriver && (
                <>
                    <span>Note</span>
                    <span>
                        You will not be able to use test database connection and resource
                        generation for data services and such inbuilt features as the relevant drivers
                        does not exist in the developer environment.
                    </span>
                </>
            )}
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={continueWithoutDriver ? props.handleSubmit(props.onSubmit) : props.onNext}
                    disabled={!isFormValid}
                >
                    {continueWithoutDriver ? 'Create' : 'Next'}
                </Button>
                <Button
                    appearance="secondary"
                    onClick={props.onBack}>
                    Back
                </Button>
            </FormActions>
        </>
    );
}
