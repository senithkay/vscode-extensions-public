/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useState } from 'react';
import { BallerinaComponentCreationParams } from '@wso2-enterprise/choreo-core';
import { TextInputWidget } from '../InputWidget/TextInput';
import { DirectoryPicker } from './DirectoryPicker';
import { VisibilityButton } from '../Controls/VisibilityButton';
import {
    OrganizationRegex, OrganizationRules, PackageNameRegex, PackageNameRules, VersioningRules, VersionRegex
} from '../../resources/constants';
import { AdvancedSettings, AdvancedControlsHeader, TitleText } from '../../resources/styles';
import { DiagramContext } from '../../../../components/common';

interface AdvancedSettingsProps {
    component: BallerinaComponentCreationParams;
    updatePackage: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    updateOrganization: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    updateVersion: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setDirectory: (path: string) => void;
    selectDirectory: () => void;
}

export function AdvancedSettingsWidget(props: AdvancedSettingsProps) {
    const [visibility, changeVisibility] = useState<boolean>(false);
    const { editLayerAPI } = useContext(DiagramContext);
    const { component, updatePackage, updateOrganization, updateVersion, setDirectory, selectDirectory } = props;

    useEffect(() => {
        editLayerAPI?.getProjectRoot().then((response) => {
            if (response) {
                setDirectory(response);
            }
        });
    }, [])

    return (
        <AdvancedSettings>
            <AdvancedControlsHeader>
                <TitleText>More</TitleText>

                <VisibilityButton
                    onClick={changeVisibility}
                    visibility={visibility}
                />
            </AdvancedControlsHeader>

            {visibility &&
                <>
                    <TextInputWidget
                        label={'Package Name'}
                        value={component.package}
                        required={true}
                        error={!PackageNameRegex.test(component.package)}
                        errorMessage={PackageNameRules}
                        onChange={updatePackage}
                    />

                    <TextInputWidget
                        label={'Organization'}
                        value={component.org}
                        required={true}
                        error={!OrganizationRegex.test(component.org)}
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

                    <DirectoryPicker
                        component={component}
                        selectDirectory={selectDirectory}
                    />
                </>
            }
        </AdvancedSettings>
    );
}
