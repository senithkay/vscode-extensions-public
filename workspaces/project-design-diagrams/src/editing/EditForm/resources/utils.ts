/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BallerinaComponentCreationParams, BallerinaComponentTypes } from '@wso2-enterprise/choreo-core';
import { PackageNameAntiRegex } from './constants';

export function transformComponentName(componentName: string): string {
    // processes the component name to match the package name conventions
    // eg: Test-hello-world -> TestHelloWorld
    return componentName.split(PackageNameAntiRegex).reduce((composedName: string, subname: string) =>
        composedName + subname.charAt(0).toUpperCase() + subname.substring(1).toLowerCase(), '');
}

export function initBallerinaComponent(): BallerinaComponentCreationParams {
    return {
        name: '',
        directory: '',
        package: '',
        org: '',
        version: '0.1.0',
        type: BallerinaComponentTypes.REST_API
    };
}
