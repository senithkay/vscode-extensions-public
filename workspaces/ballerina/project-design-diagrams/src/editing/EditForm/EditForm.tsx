/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import { BallerinaComponentCreationParams, BallerinaComponentTypes, TriggerDetails } from '@wso2-enterprise/choreo-core';
import { DiagramContext } from '../../components/common';
import { Colors } from '../../resources';
import { AdvancedSettingsWidget, CreateButton, TextInputWidget, TypeSelector } from './components';
import { OrganizationRegex, PackageNameRegex, VersionRegex } from './resources/constants';
import { ControlsContainer, Header, PrimaryContainer, TitleText } from './resources/styles';
import { initBallerinaComponent, transformComponentName } from './resources/utils';

interface EditFormProps {
    visibility: boolean;
    defaultOrg: string;
    updateVisibility: (status: boolean) => void;
}

export function EditForm(props: EditFormProps) {
    const { visibility, defaultOrg, updateVisibility } = props;
    const { editLayerAPI, setNewComponentID } = useContext(DiagramContext);

    const [component, editComponent] = useState<BallerinaComponentCreationParams>(initBallerinaComponent);
    const [generatingComponent, setGenerationStatus] = useState<boolean>(false);
    const [validatedComponentName, setValidatedComponentName] = useState<string>('');

    useEffect(() => {
        if (defaultOrg) {
            editComponent({ ...component, org: defaultOrg });
        }
    }, [defaultOrg])

    const chooseDirectory = () => {
        editLayerAPI?.pickDirectory().then((directoryPath) => {
            if (directoryPath) {
                setDirectory(directoryPath.response);
            }
        });
    };

    const updateName = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        editComponent({ ...component, name: event.target.value });
        setValidatedComponentName(transformComponentName(event.target.value));
    }

    const updateVersion = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        editComponent({ ...component, version: event.target.value });
    }

    const updateOrganization = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        editComponent({ ...component, org: event.target.value });
    }

    const updatePackage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        editComponent({ ...component, package: event.target.value });
    }

    const setDirectory = (path: string) => {
        editComponent({ ...component, directory: path });
    }

    const setComponentType = (type: BallerinaComponentTypes) => {
        editComponent({ ...component, type: type });
    }

    const setTrigger = (trigger: TriggerDetails) => {
        editComponent({ ...component, trigger: trigger });
    }

    const verifyInputs = (): boolean => {
        return Boolean(component && component.name && component.directory && component.type &&
            (component.package ? PackageNameRegex.test(component.package) : validatedComponentName) &&
            (component.org ? OrganizationRegex.test(component.org) : defaultOrg) && VersionRegex.test(component.version) &&
            (component.type === BallerinaComponentTypes.WEBHOOK ? component.trigger?.id && component.trigger.services.length : true));
    }

    const closeForm = () => {
        updateVisibility(false);
        editComponent(initBallerinaComponent);
    }

    const onSubmit = () => {
        setGenerationStatus(true);
        editLayerAPI?.createComponent({ ...component, package: component.package || validatedComponentName, org: component.org || defaultOrg })
            .then((generatedNodeID) => {
                setNewComponentID(generatedNodeID.status as string);
                setGenerationStatus(false);
                closeForm();
            }).catch((e) => {
                console.log(e);
            });
    }

    return ReactDOM.createPortal(
        <Drawer
            anchor='right'
            open={visibility}
            onClose={() => { closeForm() }}
        >
            <PrimaryContainer isLoading={generatingComponent}>
                <Header>
                    <TitleText>Add New Component</TitleText>
                    <IconButton size='small' onClick={() => { closeForm() }}>
                        <CloseIcon />
                    </IconButton>
                </Header>

                <TextInputWidget
                    label={'Component Name'}
                    value={component.name}
                    required={true}
                    testId='component-name-input'
                    onChange={updateName}
                />

                <TypeSelector
                    type={component.type}
                    trigger={component.trigger}
                    setType={setComponentType}
                    setTrigger={setTrigger}
                />

                <AdvancedSettingsWidget
                    component={{ ...component, package: component.package || validatedComponentName, org: component.org || defaultOrg }}
                    updatePackage={updatePackage}
                    updateOrganization={updateOrganization}
                    updateVersion={updateVersion}
                    setDirectory={setDirectory}
                    selectDirectory={chooseDirectory}
                />

                <ControlsContainer>
                    <CreateButton
                        testId='component-create-button'
                        label={'Create'}
                        onClick={onSubmit}
                        color={Colors.PRIMARY}
                        disabled={!verifyInputs()}
                    />
                </ControlsContainer>
            </PrimaryContainer>

            {generatingComponent &&
                <CircularProgress sx={{ top: '30%', left: '45%', position: 'absolute', color: Colors.PRIMARY }} />
            }
        </Drawer>, document.body
    );
}
