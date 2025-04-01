import type { ChoreoComponentType, DevantScopes } from "../enums";
import type { ComponentKind, ExtensionName, Organization, Project } from "./common.types";

export interface ICloneProjectCmdParams {
	organization: Organization;
	project: Project;
	componentName: string;
	component: ComponentKind;
	technology: string;
	integrationType: string;
	integrationDisplayType: string;
}

export interface ICreateDependencyParams {
	componentFsPath?: string;
	isCodeLens?: boolean;
}

export interface ICreateComponentCmdParams {
	type?: ChoreoComponentType;
	integrationType?: DevantScopes;
	buildPackLang?: string;
	name?: string;
	/** Full path of the component directory */
	componentDir?: string;
}

export interface IDeleteComponentCmdParams {
	organization: Organization;
	project: Project;
	component: ComponentKind;
}

export interface IManageDirContextCmdParams {
	onlyShowSwitchProject?: boolean;
}

export interface IOpenCompSrcCmdParams {
	org: Organization | string;
	project: Project | string;
	component: string;
	technology: string;
	integrationType: string;
	integrationDisplayType: string;
}

export interface IOpenInConsoleCmdParams {
	organization: Organization;
	project: Project;
	component: ComponentKind;
	componentFsPath: string;
	extensionName?: ExtensionName;
}

export interface IViewDependencyCmdParams {
	componentFsPath?: string;
	isCodeLens?: boolean;
	connectionName: string;
}

export interface IViewComponentDetailsCmdParams {
	organization: Organization;
	project: Project;
	component: ComponentKind;
	componentPath: string;
}
