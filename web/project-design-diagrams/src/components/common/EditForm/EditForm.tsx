/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { TextInputWidget } from './components/TextInput';
import { OrganizationRegex, OrganizationRules, PackageNameRegex, PackageNameRules, VersioningRules, VersionRegex } from './constants';
import { ControlsContainer, Header, HeaderTitle, PrimaryContainer } from './styles';
import { Colors } from '../../../resources';

interface EditFormProps {
    visibility: boolean;
    updateVisibility: (status: boolean) => void;
}

interface PackageDetails {
    name: string;
    version: string;
    organization: string;
}

export function EditForm(props: EditFormProps) {
    const { visibility, updateVisibility } = props;

    const [packageDetails, updatePackageDetails] = useState<PackageDetails>({ name: '', version: '', organization: '' });

    const updateName = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updatePackageDetails({
            ...packageDetails,
            name: event.target.value
        });
    }

    const updateVersion = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updatePackageDetails({
            ...packageDetails,
            version: event.target.value
        });
    }

    const updateOrganization = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updatePackageDetails({
            ...packageDetails,
            organization: event.target.value
        });
    }

    const verifyInputs = (): boolean => {
        if (packageDetails && PackageNameRegex.test(packageDetails.name) &&
            OrganizationRegex.test(packageDetails.organization) && VersionRegex.test(packageDetails.version)) {
            return true;
        }
        return false;
    }

    const closeForm = () => {
        updateVisibility(false);
        clearForm();
    }

    const clearForm = () => {
        updatePackageDetails({ name: '', version: '', organization: '' });
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
                    <IconButton onClick={() => { closeForm() }}>
                        <CloseIcon
                            sx={{
                                color: '#979797',
                                height: '20px',
                                width: '20px'
                            }}
                        />
                    </IconButton>
                </Header>

                <TextInputWidget
                    label={'Package Name'}
                    value={packageDetails.name}
                    error={!PackageNameRegex.test(packageDetails.name)}
                    errorMessage={PackageNameRules}
                    onChange={updateName}
                />
                <TextInputWidget
                    label={'Organization'}
                    value={packageDetails.organization}
                    error={!OrganizationRegex.test(packageDetails.organization)}
                    errorMessage={OrganizationRules}
                    onChange={updateOrganization}
                />
                <TextInputWidget
                    label={'Version'}
                    value={packageDetails.version}
                    error={!VersionRegex.test(packageDetails.version)}
                    errorMessage={VersioningRules}
                    onChange={updateVersion}
                />

                <ControlsContainer>
                    <Button
                        disabled={!verifyInputs()}
                        variant='contained'
                        size='medium'
                        sx={{ backgroundColor: Colors.PRIMARY, '&:hover': { backgroundColor: Colors.PRIMARY } }}
                    >
                        Create
                    </Button>
                </ControlsContainer>
            </PrimaryContainer>
        </Drawer>, document.body
    );
}
