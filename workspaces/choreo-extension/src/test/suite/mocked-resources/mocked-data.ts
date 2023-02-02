/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { Component, Organization, Owner, Project, UserInfo } from "@wso2-enterprise/choreo-core";

export const FOO_OWNER: Owner = {
    id: "12400",
    idpId: "",
    createdAt: new Date()
};

export const FOO_ORG: Organization = {
    id: 120,
    uuid: "foo-org-120",
    handle: "fooOrg",
    name: "FooOrg",
    owner: FOO_OWNER
};

export const BAR_ORG: Organization = {
    id: 130,
    uuid: "bar-org-130",
    handle: "barOrg",
    name: "BarOrg",
    owner: FOO_OWNER
};

export const FOO_OWNER_ORGS: Organization[] = [FOO_ORG, BAR_ORG];

export const FOO_USER: UserInfo = {
    displayName: "Foo",
    userEmail: "fooUser@example.com",
    userProfilePictureUrl: "",
    idpId: "",
    organizations: FOO_OWNER_ORGS,
    userId: "12400",
    userCreatedAt: new Date()
};

export const FOO_PROJECT_1: Project = {
    createdData: "",
    handler: "",
    id: "0123abb2-7978-1e4d-9a09-d10e3d090d2",
    name: "Foo Project1",
    orgId: "120",
    region: "US",
    version: "1.0.0"
};

export const FOO_PROJECT_2: Project = {
    createdData: "",
    handler: "",
    id: "04a31d22-7098-1c2d-9a09-d13765090d2",
    name: "Foo Project2",
    orgId: "120",
    region: "US",
    version: "1.0.0"
};

export const BAR_PROJECT_1: Project = {
    createdData: "",
    handler: "",
    id: "01b312b2-7978-1e4d-9a09-d6a4d2e090d",
    name: "Bar Project1",
    orgId: "130",
    region: "US",
    version: "1.0.0"
};

export const FOO_P1_COMPONENT: Component = {
    projectId: "0123abb2-7978-1e4d-9a09-d10e3d090d2",
    id: "01670346-7978-1de9-9ca0-d12762490d2",
    description: "Simple HTTP Service",
    name: "HelloWorld",
    handler: "helloWorld",
    displayName: "Hello World",
    displayType: "restAPI",
    version: "1.0.0",
    orgHandler: "fooOrg",
    apiVersions: []
};

export const BAR_P1_COMPONENT: Component = {
    projectId: "01b312b2-7978-1e4d-9a09-d6a4d2e090d",
    id: "01b312b2-7978-1de9-9a09-d12762490d2",
    description: "Simple HTTP Service",
    name: "HelloWorld",
    handler: "helloWorld",
    displayName: "Hello World",
    displayType: "restAPI",
    version: "1.0.0",
    orgHandler: "barOrg",
    apiVersions: []
};

export const ALL_COMPONENTS: Component[] = [FOO_P1_COMPONENT, BAR_P1_COMPONENT];

export const FOO_OWNER_PROJECTS: Project[] = [FOO_PROJECT_1, FOO_PROJECT_2, BAR_PROJECT_1];

export const TOKEN_EXPIRATION_TIME: number = 10000;
