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

import React, { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { DiagramContext } from '../../components/common/';
import {
    OrganizationRegex, OrganizationRules, PackageNameAntiRegex, PackageNameRegex, PackageNameRules, VersioningRules, VersionRegex
} from './resources/constants';
import { ControlsContainer, Header, HeaderTitle, PrimaryContainer } from './resources/styles';
import { AdvancedSettingsWidget, ControlButton, TextInputWidget } from './components';
import { AddComponentDetails, Colors } from '../../resources';

interface EditFormProps {
    visibility: boolean;
    updateVisibility: (status: boolean) => void;
}

const emptyInputs = (): AddComponentDetails => {
    return { name: '', version: '', organization: '', package: '', directory: '' };
}

export function EditForm(props: EditFormProps) {
    const { visibility, updateVisibility } = props;
    const { createService, pickDirectory } = useContext(DiagramContext);

    const [component, editComponent] = useState<AddComponentDetails>(emptyInputs);
    const [showAdvancedFeatures, setAdvancedFeatureVisibility] = useState<boolean>(false);

    const chooseDirectory = () => {
        pickDirectory().then((directoryPath) => {
            setDirectory(directoryPath);
        })
    };

    const updateName = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        editComponent({
            ...component,
            name: event.target.value
        });
    }

    const updateVersion = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        editComponent({
            ...component,
            version: event.target.value
        });
    }

    const updateOrganization = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        editComponent({
            ...component,
            organization: event.target.value
        });
    }

    const updatePackage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        editComponent({
            ...component,
            package: event.target.value
        });
    }

    const setDirectory = (path: string) => {
        editComponent({
            ...component,
            directory: path
        });
    }

    const verifyInputs = (): boolean => {
        if (component && component.name && OrganizationRegex.test(component.organization) && VersionRegex.test(component.version)
            && (component.package.length ? PackageNameRegex.test(component.package) : true)
        ) {
            return true;
        }
        return false;
    }

    const closeForm = () => {
        updateVisibility(false);
        editComponent(emptyInputs());
    }

    const onSubmit = () => {
        // processes the component name to match the package name conventions
        // eg: Test-hello-world -> TestHelloWorld
        let validatedName: string = component.name.split(PackageNameAntiRegex).reduce((composedName: string, subname: string) =>
                composedName + subname.charAt(0).toUpperCase() + subname.substring(1).toLowerCase(), '');

        createService({...component, package: component.package || validatedName});
    }

    return ReactDOM.createPortal(
        <Drawer
            anchor='right'
            open={visibility}
            onClose={() => { closeForm() }}
        >
            <PrimaryContainer>
                <Header>
                    <HeaderTitle>HTTP Service</HeaderTitle>
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
                <TextInputWidget
                    label={'Organization'}
                    value={component.organization}
                    required={true}
                    error={!OrganizationRegex.test(component.organization)}
                    errorMessage={OrganizationRules}
                    onChange={updateOrganization}
                />
                <TextInputWidget
                    label={'Version'}
                    value={component.version}
                    required={true}
                    error={!VersionRegex.test(component.version)}
                    errorMessage={VersioningRules}
                    onChange={updateVersion}
                />

                <AdvancedSettingsWidget
                    visibility={showAdvancedFeatures}
                    changeVisibility={setAdvancedFeatureVisibility}
                    component={component}
                    updatePackage={updatePackage}
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
