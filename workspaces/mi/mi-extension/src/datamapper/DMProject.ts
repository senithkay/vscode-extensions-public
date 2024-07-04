/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Project, ProjectOptions } from "ts-morph";

export class DMProject {
    private project: Project;
    private static instance: DMProject;

    private constructor(filePath: string, options?: ProjectOptions) {
        this.project = new Project(options);
        this.project.addSourceFileAtPath(filePath);
    }

    public static getInstance(filePath: string, options?: ProjectOptions): DMProject {
        if (!DMProject.instance?.project?.getSourceFile(filePath)) {
            DMProject.instance = new DMProject(filePath, options);
        }
        return DMProject.instance;
    }

    public getProject(): Project {
        return this.project;
    }
}

