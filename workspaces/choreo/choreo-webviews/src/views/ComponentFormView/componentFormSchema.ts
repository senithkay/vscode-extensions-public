/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
	type Buildpack,
	ChoreoBuildPackNames,
	ChoreoComponentType,
	ChoreoImplementationType,
	type ComponentKind,
	EndpointType,
	GoogleProviderBuildPackNames,
	WebAppSPATypes,
	capitalizeFirstLetter,
	makeURLSafe,
} from "@wso2-enterprise/choreo-core";
import { z } from "zod";
import { ChoreoWebViewAPI } from "../../utilities/vscode-webview-rpc";

// todo: delete if not used
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

export const componentGeneralDetailsSchema = z.object({
	name: z
		.string()
		.min(1, "Required")
		.max(60, "Max length exceeded")
		.regex(/^[A-Za-z]/, "Needs to start with alphabetic letter")
		.regex(/^[A-Za-z\s\d\-_]+$/, "Cannot have special characters"),
	subPath: z.string(),
	repoUrl: z.string().min(1, "Required"),
	branch: z.string().min(1, "Required"),
});

export const componentBuildDetailsSchema = z.object({
	buildPackLang: z.string().min(1, "Required"),
	langVersion: z.string(),
	dockerFile: z.string(),
	webAppPort: z.number({ coerce: true }),
	spaBuildCommand: z.string(),
	spaNodeVersion: z.string().regex(/^(?=.*\d)\d+(\.\d+)*(?:-[a-zA-Z0-9]+)?$/, "Invalid Node version"),
	spaOutputDir: z.string(),
	useDefaultEndpoints: z.boolean().default(true),
	autoBuildOnCommit: z.boolean().default(true),
});

export const componentEndpointItemSchema = z
	.object({
		name: z.string().min(1, "Required"),
		port: z.number({ coerce: true }).min(1, "Required"),
		type: z.string().min(1, "Required"),
		networkVisibility: z.string().min(1, "Required"),
		context: z.string(),
		// TODO: better to check if this file exists
		schemaFilePath: z.string(),
	})
	.superRefine((data, ctx) => {
		if ((data.type === EndpointType.REST || data.type === EndpointType.GraphQL) && !data.context) {
			ctx.addIssue({ path: ["context"], code: z.ZodIssueCode.custom, message: "Required" });
		}

		if (data.type === EndpointType.REST && !data.schemaFilePath) {
			ctx.addIssue({ path: ["schemaFilePath"], code: z.ZodIssueCode.custom, message: "Required" });
		}
	});

export const componentEndpointsFormSchema = z.object({
	endpoints: z
		.array(componentEndpointItemSchema)
		.min(1, "At least one endpoint required")
		.superRefine((data, ctx) => {
			const epSet = new Set<string>();
			for (const [index, epItem] of data.entries()) {
				if (epSet.has(epItem.name.trim())) {
					ctx.addIssue({ path: [`${[index]}.name`], code: z.ZodIssueCode.custom, message: "Duplicate Name" });
				} else {
					epSet.add(epItem.name.trim());
				}
			}
		}),
});

export const componentGitProxyFormSchema = z.object({
	proxyTargetUrl: z.string().url().min(1, "Required"),
	// todo: check if duplicate exist if its returned from API
	proxyContext: z
		.string()
		.min(1, "Required")
		.regex(/^(?:\/)?[\w-]+(?:\/[\w-]+)*$/, "Invalid Context Path"),
	proxyVersion: z.string().min(1, "Required"),
	componentConfig: z
		.object({
			type: z.string().min(1, "Required"),
			networkVisibility: z.string().min(1, "Required"),
			// TODO: validate path
			schemaFilePath: z.string().min(1, "Required"),
			// TODO: validate path
			thumbnailPath: z.string(),
			// TODO: validate path
			docPath: z.string(),
		})
		.superRefine((data, ctx) => {
			if (data.type === "REST" && !data.schemaFilePath) {
				ctx.addIssue({ path: ["schemaFilePath"], code: z.ZodIssueCode.custom, message: "Required" });
			}
		}),
});

export const getComponentFormSchemaGenDetails = (existingComponents: ComponentKind[]) =>
	componentGeneralDetailsSchema.partial().superRefine(async (data, ctx) => {
		if (existingComponents.some((item) => item.metadata.name === makeURLSafe(data.name))) {
			ctx.addIssue({ path: ["name"], code: z.ZodIssueCode.custom, message: "Name already exists" });
		}
	});

export const getComponentFormSchemaBuildDetails = (type: string, directoryFsPath: string, subPath: string) =>
	componentBuildDetailsSchema.partial().superRefine(async (data, ctx) => {
		const compPath = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, subPath]);
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
			if (type === ChoreoComponentType.WebApplication && !data.webAppPort) {
				ctx.addIssue({ path: ["webAppPort"], code: z.ZodIssueCode.custom, message: "Required" });
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
			if (type === ChoreoComponentType.WebApplication && !data.webAppPort) {
				ctx.addIssue({ path: ["webAppPort"], code: z.ZodIssueCode.custom, message: "Required" });
			}
		}

		if (type && data.buildPackLang) {
			const expectedFiles = getExpectedFilesForBuildPack(data.buildPackLang);
			if (expectedFiles.length > 0) {
				const files = await ChoreoWebViewAPI.getInstance().getDirectoryFileNames(compPath);
				if (!expectedFiles.some((item) => containsMatchingElement(files, item))) {
					ctx.addIssue({
						path: ["buildPackLang"],
						code: z.ZodIssueCode.custom,
						message: capitalizeFirstLetter(`${getExpectedFileNames(expectedFiles)} is required within the selected directory`),
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

// todo: delete if not used
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
			const endpoints = await ChoreoWebViewAPI.getInstance().readLocalEndpointsConfig(compPath);
			if (endpoints?.endpoints?.length === 0) {
				ctx.addIssue({ path: ["port"], code: z.ZodIssueCode.custom, message: "Required" });
			}
		}

		if (data.type && data.buildPackLang) {
			const expectedFiles = getExpectedFilesForBuildPack(data.buildPackLang);
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

const buildPackExpectedFilesMap: { [key: string]: string[] } = {
	[GoogleProviderBuildPackNames.JAVA]: ["build.gradle", "build.gradle.kts", "*.java"],
	[GoogleProviderBuildPackNames.NODEJS]: ["package.json", "*.js"],
	[GoogleProviderBuildPackNames.PYTHON]: ["requirements.txt", "*.py"],
	[GoogleProviderBuildPackNames.GO]: ["go.mod", "*.go"],
	[GoogleProviderBuildPackNames.RUBY]: ["Gemfile", "*.rb"],
	[GoogleProviderBuildPackNames.PHP]: ["composer.json", "*.php"],
	[GoogleProviderBuildPackNames.DOTNET]: ["*.csproj", "*.fsproj", "*.vbproj"],
	[ChoreoImplementationType.Ballerina]: ["Ballerina.toml"],
	[ChoreoImplementationType.MicroIntegrator]: ["pom.xml"],
	[ChoreoImplementationType.React]: ["package.json"],
	[ChoreoImplementationType.Angular]: ["package.json"],
	[ChoreoImplementationType.Vue]: ["package.json"],
	[ChoreoImplementationType.Docker]: ["Dockerfile"],
};

export const getPossibleBuildPack = async (compPath: string, buildPacks: Buildpack[] = []) => {
	const files = await ChoreoWebViewAPI.getInstance().getDirectoryFileNames(compPath);
	for (const bp of Object.keys(buildPackExpectedFilesMap)) {
		if (buildPacks.some((item) => item.language === bp) && buildPackExpectedFilesMap[bp].some((item) => containsMatchingElement(files, item))) {
			return bp;
		}
	}
};

const getExpectedFilesForBuildPack = (buildpackType: string) => {
	switch (buildpackType) {
		case GoogleProviderBuildPackNames.JAVA:
			return ["pom.xml", ...buildPackExpectedFilesMap[GoogleProviderBuildPackNames.JAVA]];
		case GoogleProviderBuildPackNames.NODEJS:
			return buildPackExpectedFilesMap[GoogleProviderBuildPackNames.NODEJS];
		case GoogleProviderBuildPackNames.PYTHON:
			return buildPackExpectedFilesMap[GoogleProviderBuildPackNames.PYTHON];
		case GoogleProviderBuildPackNames.GO:
			return buildPackExpectedFilesMap[GoogleProviderBuildPackNames.GO];
		case GoogleProviderBuildPackNames.RUBY:
			return buildPackExpectedFilesMap[GoogleProviderBuildPackNames.RUBY];
		case GoogleProviderBuildPackNames.PHP:
			return buildPackExpectedFilesMap[GoogleProviderBuildPackNames.PHP];
		case GoogleProviderBuildPackNames.DOTNET:
			return buildPackExpectedFilesMap[GoogleProviderBuildPackNames.DOTNET];
		case ChoreoImplementationType.Ballerina:
			return buildPackExpectedFilesMap[ChoreoImplementationType.Ballerina];
		case ChoreoImplementationType.MicroIntegrator:
			return buildPackExpectedFilesMap[ChoreoImplementationType.MicroIntegrator];
		case ChoreoImplementationType.React:
			return buildPackExpectedFilesMap[ChoreoImplementationType.React];
		case ChoreoImplementationType.Angular:
			return buildPackExpectedFilesMap[ChoreoImplementationType.Angular];
		case ChoreoImplementationType.Vue:
			return buildPackExpectedFilesMap[ChoreoImplementationType.Vue];
		default:
			return [];
	}
};

export const sampleEndpointItem = {
	context: "/",
	port: 8080,
	type: EndpointType.REST,
	schemaFilePath: "",
	networkVisibility: "Public",
};
