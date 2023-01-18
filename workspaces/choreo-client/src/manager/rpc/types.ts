import { ChoreoComponentCreationParams, Project } from "@wso2-enterprise/choreo-core";
import { RequestType } from "vscode-messenger-common";

export const CreateLocalComponentRequest: RequestType<ChoreoComponentCreationParams, boolean> = { method: 'manager/createLocalComponent' };
export const GetProjectRoot: RequestType<string, string | undefined> = { method: 'manager/getProjectRoot' };
export const GetProjectDetails: RequestType<string, Project> = { method: 'manager/getProjectDetails' };
