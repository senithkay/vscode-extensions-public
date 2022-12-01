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
import { DiagramContext } from '../../components/common/';
import { AddComponentDetails, Colors } from '../../resources';
import { AdvancedSettingsWidget, ControlButton, TextInputWidget, } from './components';
import { OrganizationRegex, PackageNameRegex, PackageNameRules, VersionRegex } from './resources/constants';
import { ControlsContainer, Header, HeaderTitle, PrimaryContainer } from './resources/styles';
import { initBallerinaComponent, transformComponentName } from './resources/utils';

interface EditFormProps {
    visibility: boolean;
    defaultOrg: string;
    updateVisibility: (status: boolean) => void;
}

export function EditForm(props: EditFormProps) {
    const { visibility, defaultOrg, updateVisibility } = props;
    const { createService, pickDirectory } = useContext(DiagramContext);

    const [component, editComponent] = useState<AddComponentDetails>(initBallerinaComponent);
    const [advancedVisibility, setAdvancedVisibility] = useState<boolean>(false);
    const [validatedComponentName, setValidatedComponentName] = useState<string>(undefined);

    useEffect(() => {
        if (defaultOrg) {
            editComponent({ ...component, org: defaultOrg });
        }
    }, [defaultOrg])

    const chooseDirectory = () => {
        pickDirectory().then((directoryPath) => {
            setDirectory(directoryPath);
        })
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

    const verifyInputs = (): boolean => {
        if (component && component.name && ((component.package && PackageNameRegex.test(component.package)) || validatedComponentName)
            && (OrganizationRegex.test(component.org) || defaultOrg) && VersionRegex.test(component.version)) {
            return true;
        }
        return false;
    }

    const closeForm = () => {
        updateVisibility(false);
        editComponent(initBallerinaComponent);
    }

    const onSubmit = () => {
        createService({ ...component, package: component.package || validatedComponentName, org: component.org || defaultOrg })
            .then(() => {
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
            <PrimaryContainer>
                <Header>
                    <HeaderTitle>Add HTTP Component</HeaderTitle>
                    <IconButton size='small' onClick={() => { closeForm() }}>
                        <CloseIcon />
                    </IconButton>
                </Header>

                <TextInputWidget
                    label={'Component Name'}
                    value={component.name}
                    required={true}
                    error={component.name.length < 1}
                    errorMessage={PackageNameRules}
                    onChange={updateName}
                />

                <AdvancedSettingsWidget
                    visibility={advancedVisibility}
                    changeVisibility={setAdvancedVisibility}
                    component={{ ...component, package: component.package || validatedComponentName, org: component.org || defaultOrg }}
                    updatePackage={updatePackage}
                    updateOrganization={updateOrganization}
                    updateVersion={updateVersion}
                    setDirectory={setDirectory}
                    selectDirectory={chooseDirectory}
                />

                <ControlsContainer>
                    <ControlButton
                        label={'Create'}
                        onClick={onSubmit}
                        color={Colors.PRIMARY}
                        disabled={!verifyInputs()}
                    />
                </ControlsContainer>
            </PrimaryContainer>
        </Drawer>, document.body
    );
}
