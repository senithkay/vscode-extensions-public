/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from 'react';
import { DIRECTORY_MAP, EVENT_TYPE, ListenerModel, ListenersResponse, ServiceModel } from '@wso2-enterprise/ballerina-core';
import { Button, Codicon, ComponentCard, Icon, TextField, Typography, Stepper, ProgressRing, View, ViewContent, CheckBox, AutoComplete } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import ListenerConfigForm from '../ListenerConfigForm';
import ServiceConfigForm from '../ServiceConfigForm';
import { BodyText, LoadingContainer } from '../../styles';
import { BIHeader } from '../BIHeader';
import { FormValues } from '@wso2-enterprise/ballerina-side-panel';

const FORM_WIDTH = 600;

const FormContainer = styled.div`
    padding-top: 15px;
    padding-bottom: 15px;
`;


const ContainerX = styled.div`
    padding: 0 20px 20px;
    max-width: 600px;
    > div:last-child {
        padding: 20px 0;
        > div:last-child {
            justify-content: flex-start;
        }
    }
`;

const Container = styled.div`
    display: "flex";
    flex-direction: "column";
    gap: 10;
    margin: 20px;
`;

const BottomMarginTextWrapper = styled.div`
    margin-top: 20px;
    margin-left: 20px;
    font-size: 15px;
    margin-bottom: 10px;
`;

const HorizontalCardContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const IconWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const ButtonWrapper = styled.div`
    max-width: 600px;
    display: flex;
    gap: 10px;
    justify-content: right;
`;


export interface ServiceWizardProps {
    type: string;
}

export function ServiceWizard(props: ServiceWizardProps) {
    const { type } = props;
    const { rpcClient } = useRpcContext();
    const [step, setStep] = useState<number>(0);
    const [listenerModel, setListenerModel] = useState<ListenerModel>(undefined);
    const [serviceModel, setServiceModel] = useState<ServiceModel>(undefined);
    const [listeners, setListeners] = useState<ListenersResponse>(undefined);
    const [existing, setExisting] = useState<boolean>(false);
    const [creatingListener, setCreatingListener] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [existingListener, setExistingListener] = useState<string>(undefined);

    const listenerConfigForm = useRef<{ triggerSave: () => void }>(null);
    const serviceConfigForm = useRef<{ triggerSave: () => void }>(null);

    useEffect(() => {
        rpcClient.getServiceDesignerRpcClient().getListeners({ filePath: "", moduleName: type }).then(res => {
            console.log("Existing Listeners: ", res);
            setExisting(res.hasListeners);
            if (res.hasListeners) {
                rpcClient.getServiceDesignerRpcClient().getServiceModel({ filePath: "", moduleName: type, listenerName: "" }).then(res => {
                    console.log("Service Model: ", res);
                    res.service.properties["listener"].editable = true;
                    setServiceModel(res.service);
                    setStep(1);
                });
            }
            setListeners(res);
        });
        rpcClient.getServiceDesignerRpcClient().getListenerModel({ moduleName: type }).then(res => {
            console.log("Listener Model: ", res);
            setListenerModel(res.listener);
        });
    }, []);

    const handleListenerSubmit = async (value?: ListenerModel) => {
        setSaving(true);
        let listenerName;
        if (value) {
            await rpcClient.getServiceDesignerRpcClient().updateListenerSourceCode({ filePath: "", listener: value });
            if (value.properties['name'].value) {
                listenerName = value.properties['name'].value;
            }
        }
        if (existing) {
            listenerName = existingListener;
        }
        rpcClient.getServiceDesignerRpcClient().getServiceModel({ filePath: "", moduleName: type, listenerName }).then(res => {
            console.log("Service Model: ", res);
            res.service.properties["listener"].editable = true;
            setServiceModel(res.service);
            setSaving(false);
            setStep(1);
        });
    };

    const handleOnNext = () => {
        if (existing && !creatingListener) {
            handleListenerSubmit();
        } else {
            if (listenerConfigForm.current) {
                listenerConfigForm.current.triggerSave();
            }
        }
    }

    const handleOnSave = () => {
        if (serviceConfigForm.current) {
            serviceConfigForm.current.triggerSave();
        }
    }

    const handlServiceSubmit = async (value: ServiceModel) => {
        setSaving(true);
        const res = await rpcClient.getServiceDesignerRpcClient().updateServiceSourceCode({ filePath: "", service: value });
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                documentUri: res.filePath,
                position: res.position
            },
        });
        setSaving(false);
    }

    const onBack = () => {
        setStep(1);
    }

    const openListenerForm = () => {
        setCreatingListener(true);
        setStep(0);
    }

    const onListenerSelect = (value: string) => {
        setExistingListener(value);
    }

    const defaultSteps = ["Listener Configuration", "Service Configuration"];

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                {!listenerModel &&
                    <LoadingContainer>
                        <ProgressRing />
                        <Typography variant="h3" sx={{ marginTop: '16px' }}>Loading...</Typography>
                    </LoadingContainer>
                }
                {listenerModel &&
                    <Container>
                        {/* <Typography variant="h2">Create {listenerModel.moduleName.toLocaleUpperCase()} Service</Typography>
                        <BodyText>
                            Design your {listenerModel.moduleName.toLocaleUpperCase()} Service using the our Service Designer.
                        </BodyText> */}
                        {!listeners.hasListeners && <Stepper alignment='flex-start' steps={defaultSteps} currentStep={step} />}
                        {step === 0 && !saving &&
                            <>
                                {/* {listeners.hasListeners &&
                                    <BottomMarginTextWrapper>
                                        <CheckBox
                                            checked={existing}
                                            label={"Select an already created listener"}
                                            onChange={(checked) => {
                                                setExisting(checked);
                                            }}
                                            value={"1"}
                                        />
                                    </BottomMarginTextWrapper>
                                } */}
                                {/* {existing &&
                                    <ContainerX>
                                        <FormContainer>
                                            <Typography variant="h3" sx={{ marginTop: '16px' }}>Select {listenerModel.displayAnnotation.label}</Typography>
                                            <AutoComplete identifier='listeners' items={listeners.listeners} onValueChange={onListenerSelect} onCreateButtonClick={() => setExisting(false)} />
                                        </FormContainer>
                                    </ContainerX>
                                } */}

                                <ListenerConfigForm formRef={listenerConfigForm} listenerModel={listenerModel} onSubmit={handleListenerSubmit} onBack={onBack} />
                                <ButtonWrapper>
                                    {creatingListener && <Button appearance="secondary" onClick={onBack}>
                                        Cancel
                                    </Button>
                                    }
                                    <Button appearance="primary" onClick={handleOnNext}>
                                        Next
                                    </Button>
                                </ButtonWrapper>

                            </>
                        }
                        {step === 0 && saving &&

                            <LoadingContainer>
                                <ProgressRing />
                                <Typography variant="h3" sx={{ marginTop: '16px' }}>Creating the listener...</Typography>
                            </LoadingContainer>
                        }
                        {step === 1 && !saving &&
                            <>
                                <ServiceConfigForm formRef={serviceConfigForm} serviceModel={serviceModel} onSubmit={handlServiceSubmit} onBack={onBack} openListenerForm={existing && openListenerForm} />
                                <ButtonWrapper>
                                    <Button appearance="primary" onClick={handleOnSave}>
                                        Save
                                    </Button>
                                </ButtonWrapper>
                            </>
                        }
                        {step === 1 && saving &&

                            <LoadingContainer>
                                <ProgressRing />
                                <Typography variant="h3" sx={{ marginTop: '16px' }}>Saving... Please wait</Typography>
                            </LoadingContainer>
                        }
                    </Container>
                }
            </ViewContent>
        </View >


    );
};
