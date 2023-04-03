/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import { BallerinaComponentCreationParams, BallerinaComponentTypes } from '@wso2-enterprise/choreo-core';
import { DiagramContext } from '../../components/common/';
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
                setDirectory(directoryPath);
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

    const setTriggerId = (triggerId: string) => {
        editComponent({ ...component, triggerId: triggerId });
    }

    const verifyInputs = (): boolean => {
        return Boolean(component && component.name && component.directory && component.type &&
            (component.package ? PackageNameRegex.test(component.package) : validatedComponentName) &&
            (component.org ? OrganizationRegex.test(component.org) : defaultOrg) && VersionRegex.test(component.version) &&
            (component.type === BallerinaComponentTypes.WEBHOOK ? component.triggerId : true));
    }

    const closeForm = () => {
        updateVisibility(false);
        editComponent(initBallerinaComponent);
    }

    const onSubmit = () => {
        setGenerationStatus(true);
        editLayerAPI?.createComponent({ ...component, package: component.package || validatedComponentName, org: component.org || defaultOrg })
            .then((generatedNodeID) => {
                setNewComponentID(generatedNodeID);
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
                    onChange={updateName}
                />

                <TypeSelector
                    type={component.type}
                    triggerId={component.triggerId}
                    setType={setComponentType}
                    setTriggerId={setTriggerId}
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
