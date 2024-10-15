/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
	ChoreoBuildPackNames,
	ChoreoComponentType,
	ChoreoImplementationType,
	type ComponentKind,
	GoogleProviderBuildPackNames,
	WebAppSPATypes,
	makeURLSafe,
} from "@wso2-enterprise/choreo-core";
import { z } from "zod";
import { ChoreoWebViewAPI } from "../../utilities/vscode-webview-rpc";

export const componentFormSchema = z.object({
	name: z
		.string()
		.min(1, "Required")
		.max(60, "Max length exceeded")
		.regex(/^[A-Za-z]/, "Needs to start with alphabetic letter")
		.regex(/^[A-Za-z\s\d\-_]+$/, "Cannot have special characters"),
	type: z.string().min(1, "Required"),
	buildPackLang: z.string().min(1, "Required"),
	subPath: z.string(),
	repoUrl: z.string().min(1, "Required"),
	branch: z.string().min(1, "Required"),
	langVersion: z.string(),
	dockerFile: z.string(),
	port: z.number({ coerce: true }),
	outboundVisibility: z.string(),
	// TODO // required if its REST or GQL types
	// outboundType: z.string(),
	// outboundContext: z.string(),
	// outboundSchemaPath: z.string(),
	spaBuildCommand: z.string(),
	spaNodeVersion: z.string().regex(/^(?=.*\d)\d+(\.\d+)*(?:-[a-zA-Z0-9]+)?$/, "Invalid Node version"),
	spaOutputDir: z.string(),
});

export const getComponentFormSchema = (existingComponents: ComponentKind[], directoryFsPath: string) =>
	componentFormSchema.partial().superRefine(async (data, ctx) => {
		const compPath = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, data.subPath]);
		if (
			[ChoreoBuildPackNames.Ballerina, ChoreoBuildPackNames.MicroIntegrator, ChoreoBuildPackNames.StaticFiles].includes(
				data.buildPackLang as ChoreoBuildPackNames,
			)
		) {
			// do nothing
		} else if (data.buildPackLang === ChoreoBuildPackNames.Docker) {
			if (data?.dockerFile?.length === 0) {
				ctx.addIssue({ path: ["dockerFile"], code: z.ZodIssueCode.custom, message: "Required" });
			}
			if (data.type === ChoreoComponentType.WebApplication && !data.port) {
				ctx.addIssue({ path: ["port"], code: z.ZodIssueCode.custom, message: "Required" });
			}
		} else if (WebAppSPATypes.includes(data.buildPackLang as ChoreoBuildPackNames)) {
			if (!data.spaBuildCommand) {
				ctx.addIssue({ path: ["spaBuildCommand"], code: z.ZodIssueCode.custom, message: "Required" });
			}
			if (!data.spaNodeVersion) {
				ctx.addIssue({ path: ["spaNodeVersion"], code: z.ZodIssueCode.custom, message: "Required" });
			}
			if (!data.spaOutputDir) {
				ctx.addIssue({ path: ["spaOutputDir"], code: z.ZodIssueCode.custom, message: "Required" });
			}
		} else {
			// Build pack type
			if (!data.langVersion) {
				ctx.addIssue({ path: ["langVersion"], code: z.ZodIssueCode.custom, message: "Required" });
			}
			if (data.type === ChoreoComponentType.WebApplication && !data.port) {
				ctx.addIssue({ path: ["port"], code: z.ZodIssueCode.custom, message: "Required" });
			}
		}

		if (existingComponents.some((item) => item.metadata.name === makeURLSafe(data.name))) {
			ctx.addIssue({ path: ["name"], code: z.ZodIssueCode.custom, message: "Name already exists" });
		}

		if (data.type === ChoreoComponentType.Service && !data.port) {
			const endpoints = await ChoreoWebViewAPI.getInstance().readServiceEndpoints(compPath);
			if (endpoints?.endpoints?.length === 0) {
				ctx.addIssue({ path: ["port"], code: z.ZodIssueCode.custom, message: "Required" });
			}
		}

		if (data.type && data.buildPackLang) {
			const expectedFiles = getExpectedFiles(data.buildPackLang);
			if (expectedFiles.length > 0) {
				const files = await ChoreoWebViewAPI.getInstance().getDirectoryFileNames(compPath);
				if (!expectedFiles.some((item) => containsMatchingElement(files, item))) {
					ctx.addIssue({
						path: ["subPath"],
						code: z.ZodIssueCode.custom,
						message: `Expected ${getExpectedFileNames(expectedFiles)} within the directory`,
					});
				}
			}

			if (data.buildPackLang === ChoreoImplementationType.Docker) {
				const dockerFilePath = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, data.dockerFile]);
				const isDockerFileExist = await ChoreoWebViewAPI.getInstance().fileExist(dockerFilePath);
				if (!isDockerFileExist) {
					ctx.addIssue({ path: ["dockerFile"], code: z.ZodIssueCode.custom, message: "Invalid Path" });
				}
			}
		}
	});

const containsMatchingElement = (strings: string[], pattern: string): boolean => {
	const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
	const regex = new RegExp(`^${regexPattern}$`);
	return strings.some((str) => regex.test(str));
};

const getExpectedFileNames = (fileNames: string[]) => {
	if (fileNames.length > 2) {
		return `one of ${fileNames.join(",")}`;
	}
	if (fileNames.length === 2) {
		return `${fileNames[0]} or ${fileNames[1]}`;
	}
	if (fileNames.length === 1) {
		return fileNames[0];
	}
};

const getExpectedFiles = (buildpackType: string) => {
	const javaBuildpackTypes = ["pom.xml", "build.gradle", "build.gradle.kts", "*.java"];
	const pythonBuildpackTypes = ["requirements.txt", "*.py"];
	const goBuildpackTypes = ["go.mod", "*.go"];
	const rubyBuildpackTypes = ["Gemfile", "*.rb"];
	const phpBuildpackTypes = ["composer.json", "*.php"];
	const nodejsBuildpackTypes = ["package.json", "*.js"];
	const spaBuildpackTypes = ["package.json"];
	const dotnetBuildpackTypes = ["*.csproj", "*.fsproj", "*.vbproj"];
	const ballerinaBuildpackTypes = ["Ballerina.toml"];
	const miBuildpackTypes = ["pom.xml"];

	switch (buildpackType) {
		case GoogleProviderBuildPackNames.JAVA:
			return javaBuildpackTypes;
		case GoogleProviderBuildPackNames.NODEJS:
			return nodejsBuildpackTypes;
		case GoogleProviderBuildPackNames.PYTHON:
			return pythonBuildpackTypes;
		case GoogleProviderBuildPackNames.GO:
			return goBuildpackTypes;
		case GoogleProviderBuildPackNames.RUBY:
			return rubyBuildpackTypes;
		case GoogleProviderBuildPackNames.PHP:
			return phpBuildpackTypes;
		case GoogleProviderBuildPackNames.DOTNET:
			return dotnetBuildpackTypes;
		case ChoreoImplementationType.Ballerina:
			return ballerinaBuildpackTypes;
		case ChoreoImplementationType.MicroIntegrator:
			return miBuildpackTypes;
		case ChoreoImplementationType.React:
		case ChoreoImplementationType.Angular:
		case ChoreoImplementationType.Vue:
			return spaBuildpackTypes;
		default:
			return [];
	}
};
