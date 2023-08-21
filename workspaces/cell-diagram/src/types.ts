/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export interface Project {
    id: string
    name: string
    components: Component[]
    modelVersion: string
}

export interface Component {
    id: string
    version: string
    services: Services
    connections: Connection[]
}

export interface Services {
    [key: string]: Service
}

export interface Service {
    id: string
    label: string
    type: string
    dependencyIds: string[]
    isExposedToInternet: boolean
}

export interface Connection {
    id: string
    type: string
}
