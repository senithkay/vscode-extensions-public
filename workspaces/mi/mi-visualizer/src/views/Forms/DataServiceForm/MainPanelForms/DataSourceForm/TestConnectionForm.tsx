/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from "react";
import { TextField, FormCheckBox, FormGroup, Button, FormActions } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";

export interface TestConnectionFormProps {
    renderProps: any;
    watch: any;
    setValue: any;
    control: any;
    handleSubmit: any;
    onBack: any;
    onSubmit: any;
    isEditDatasource: boolean;
    fromDatasourceForm?: boolean;
}

export function TestConnectionForm(props: TestConnectionFormProps) {

    const { rpcClient } = useVisualizerContext();

    const [connectionSuccess, setConnectionSuccess] = useState(null);
    const [isEnableURLEdit, setIsEnableURLEdit] = useState(false);

    useEffect(() => {
        if (props.watch('rdbms.useSecretAlias')) {
            props.setValue('rdbms.password', '');
        } else {
            props.setValue('rdbms.secretAlias', '');
        }
    }, [props.watch('rdbms.useSecretAlias')]);

    const testConnection = async (values: any) => {
        // const response = await rpcClient.getMiDiagramRpcClient().testDBConnection({
        //     className: props.watch('rdbms.driverClassName') ?? props.watch('driverClassName'),
        //     driverPath: props.watch('rdbms.driverPath') ?? props.watch('driverPath'),
        //     dbUrl: props.watch('rdbms.url') ?? props.watch('url'),
        //     username: props.watch('rdbms.username') ?? props.watch('username'),
        //     password: props.watch('rdbms.password') ?? props.watch('password'),

        // });
        setConnectionSuccess(true);
    }

    const handleModifyURL = () => {
        setIsEnableURLEdit(!isEnableURLEdit);
    }

    return (
        <>
            <FormGroup title="Test Connection" isCollapsed={false}>
                <TextField
                    label="URL"
                    required
                    size={100}
                    disabled={!isEnableURLEdit}
                    {...(props.fromDatasourceForm ? props.renderProps('url') : props.renderProps('rdbms.url'))}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Button
                        appearance="secondary"
                        onClick={handleModifyURL}>
                        Modify URL
                    </Button>
                </div>
                <TextField
                    label="Username"
                    size={100}
                    {...(props.fromDatasourceForm ? props.renderProps('username') : props.renderProps('rdbms.username'))}
                />
                {/* <FormCheckBox
                    label="Use Secret Alias"
                    {...props.renderProps("rdbms.useSecretAlias")}
                    control={props.control}
                />
                {props.watch('rdbms.useSecretAlias') ?
                    <TextField
                        label="Secret Alias"
                        size={100}
                        {...props.renderProps('rdbms.secretAlias')}
                    />
                    :
                    <TextField
                        label="Password"
                        size={100}
                        {...(props.fromDatasourceForm ? props.renderProps('password') : props.renderProps('rdbms.password'))}
                    />
                } */}
                <TextField
                    label="Password"
                    size={100}
                    type="password"
                    {...(props.fromDatasourceForm ? props.renderProps('password') : props.renderProps('rdbms.password'))}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
                    <Button
                        appearance="secondary"
                        onClick={testConnection}>
                        Test Connection
                    </Button>
                    {connectionSuccess !== null && (
                        connectionSuccess ? (
                            <span style={{ color: 'green' }}>Connection Success!</span>
                        ) : (
                            <span style={{ color: 'red' }}>Connection Failed</span>
                        )
                    )}
                </div>
            </FormGroup>
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={props.handleSubmit(props.onSubmit)}
                >
                    {props.isEditDatasource ? "Update" : "Create"}
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
