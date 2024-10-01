/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ChoreoBuildPackNames,
	ChoreoComponentType,
	type Endpoint,
	type NewComponentWebviewProps,
	type SubmitComponentCreateReq,
	getRandomNumber,
	makeURLSafe,
} from "@wso2-enterprise/choreo-core";
import React, { type FC, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { HeaderSection } from "../../components/HeaderSection";
import { type StepItem, VerticalStepper } from "../../components/VerticalStepper";
import { ChoreoWebViewAPI } from "../../utilities/vscode-webview-rpc";
import {
	type componentBuildDetailsSchema,
	componentEndpointsFormSchema,
	type componentGeneralDetailsSchema,
	componentGitProxyFormSchema,
	getComponentFormSchemaBuildDetails,
	getComponentFormSchemaGenDetails,
	sampleEndpointItem,
} from "./componentFormSchema";
import { ComponentFormBuildSection } from "./sections/ComponentFormBuildSection";
import { ComponentFormEndpointsSection } from "./sections/ComponentFormEndpointsSection";
import { ComponentFormGenDetailsSection } from "./sections/ComponentFormGenDetailsSection";
import { ComponentFormGitProxySection } from "./sections/ComponentFormGitProxySection";
import { ComponentFormSummarySection } from "./sections/ComponentFormSummarySection";

type ComponentFormGenDetailsType = z.infer<typeof componentGeneralDetailsSchema>;
type ComponentFormBuildDetailsType = z.infer<typeof componentBuildDetailsSchema>;
type ComponentFormEndpointsType = z.infer<typeof componentEndpointsFormSchema>;
type ComponentFormGitProxyType = z.infer<typeof componentGitProxyFormSchema>;

export const ComponentFormView: FC<NewComponentWebviewProps> = (props) => {
	const { project, organization, directoryFsPath, initialValues, existingComponents } = props;
	const type = initialValues?.type;
	const [formSections] = useAutoAnimate();

	const [stepIndex, setStepIndex] = useState(0);

	const genDetailsForm = useForm<ComponentFormGenDetailsType>({
		resolver: zodResolver(getComponentFormSchemaGenDetails(existingComponents), { async: true }, { mode: "async" }),
		mode: "all",
		defaultValues: {
			name: "",
			subPath: initialValues?.subPath || "",
			repoUrl: "",
			branch: "",
		},
	});

	const subPath = genDetailsForm.watch("subPath");
	const name = genDetailsForm.watch("name");

	const buildDetailsForm = useForm<ComponentFormBuildDetailsType>({
		resolver: zodResolver(getComponentFormSchemaBuildDetails(type, directoryFsPath, subPath), { async: true }, { mode: "async" }),
		mode: "all",
		defaultValues: {
			buildPackLang: initialValues?.buildPackLang ?? "",
			dockerFile: "",
			langVersion: "",
			spaBuildCommand: "npm run build",
			spaNodeVersion: "20.0.0",
			spaOutputDir: "build",
			webAppPort: 8080,
			autoBuildOnCommit: true,
			useDefaultEndpoints: true,
		},
	});

	const useDefaultEndpoints = buildDetailsForm.watch("useDefaultEndpoints");
	const buildPackLang = buildDetailsForm.watch("buildPackLang");

	const endpointDetailsForm = useForm<ComponentFormEndpointsType>({
		resolver: zodResolver(componentEndpointsFormSchema),
		mode: "all",
		defaultValues: { endpoints: [] },
	});

	const gitProxyForm = useForm<ComponentFormGitProxyType>({
		resolver: zodResolver(componentGitProxyFormSchema),
		mode: "all",
		defaultValues: {
			proxyTargetUrl: "",
			proxyVersion: "1.0",
			componentConfig: { type: "REST", schemaFilePath: "", docPath: "", thumbnailPath: "", networkVisibility: "Public" },
		},
	});

	const { data: compPath = directoryFsPath } = useQuery({
		queryKey: ["comp-create-path", { directoryFsPath, subPath }],
		queryFn: () => ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, subPath]),
	});

	useQuery({
		queryKey: ["service-dir-endpoints", { compPath, type }],
		queryFn: () => ChoreoWebViewAPI.getInstance().readLocalEndpointsConfig(compPath),
		select: (resp) => resp?.endpoints,
		refetchOnWindowFocus: false,
		enabled: type === ChoreoComponentType.Service,
		onSuccess: (resp) => {
			endpointDetailsForm.setValue("endpoints", resp?.length > 0 ? resp : [{ ...sampleEndpointItem, name: name || "endpoint-1" }]);
		},
	});

	useQuery({
		queryKey: ["read-local-proxy-config", { compPath, type }],
		queryFn: () => ChoreoWebViewAPI.getInstance().readLocalProxyConfig(compPath),
		select: (resp) => resp?.proxy,
		refetchOnWindowFocus: false,
		enabled: type === ChoreoComponentType.ApiProxy,
		onSuccess: (resp) => {
			gitProxyForm.setValue("componentConfig.type", resp?.type ?? "REST");
			gitProxyForm.setValue("componentConfig.schemaFilePath", resp?.schemaFilePath ?? "");
			gitProxyForm.setValue("componentConfig.thumbnailPath", resp?.thumbnailPath ?? "");
			gitProxyForm.setValue("componentConfig.docPath", resp?.docPath ?? "");
			gitProxyForm.setValue("componentConfig.networkVisibility", resp?.networkVisibilities?.[0] ?? "Public");
		},
	});

	const { mutate: createComponent, isLoading: isCreatingComponent } = useMutation({
		mutationFn: async () => {
			const genDetails = genDetailsForm.getValues();
			const buildDetails = buildDetailsForm.getValues();
			const gitProxyDetails = gitProxyForm.getValues();

			const componentName = makeURLSafe(genDetails.name);

			const componentDir = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, subPath]);

			const createCompCommandParams: SubmitComponentCreateReq = {
				org: organization,
				project: project,
				autoBuildOnCommit: type === ChoreoComponentType.ApiProxy ? false : buildDetails?.autoBuildOnCommit,
				type,
				createParams: {
					orgId: organization.id.toString(),
					orgUUID: organization.uuid,
					projectId: project.id,
					projectHandle: project.handler,
					name: componentName,
					displayName: genDetails.name,
					type,
					buildPackLang: buildDetails.buildPackLang,
					componentDir,
					repoUrl: genDetails.repoUrl,
					branch: genDetails.branch,
					langVersion: buildDetails.langVersion,
					dockerFile: buildDetails.dockerFile,
					port: buildDetails.webAppPort,
					spaBuildCommand: buildDetails.spaBuildCommand,
					spaNodeVersion: buildDetails.spaNodeVersion,
					spaOutputDir: buildDetails.spaOutputDir,
					proxyAccessibility: "external", // TODO: remove after CLI change
					proxyApiContext: gitProxyDetails.proxyContext?.charAt(0) === "/" ? gitProxyDetails.proxyContext.substring(1) : gitProxyDetails.proxyContext,
					proxyApiVersion: gitProxyDetails.proxyVersion,
					proxyEndpointUrl: gitProxyDetails.proxyTargetUrl,
				},
			};

			const created = await ChoreoWebViewAPI.getInstance().submitComponentCreate(createCompCommandParams);

			if (created) {
				ChoreoWebViewAPI.getInstance().closeWebView();
			}
		},
	});

	const { mutate: submitEndpoints, isLoading: isSubmittingEndpoints } = useMutation({
		mutationFn: (endpoints: Endpoint[] = []) => {
			return ChoreoWebViewAPI.getInstance().createLocalEndpointsConfig({ componentDir: compPath, endpoints });
		},
		onSuccess: () => setStepIndex(stepIndex + 1),
	});

	const { mutate: submitProxyConfig, isLoading: isSubmittingProxyConfig } = useMutation({
		mutationFn: (data: ComponentFormGitProxyType) => {
			return ChoreoWebViewAPI.getInstance().createLocalProxyConfig({
				componentDir: compPath,
				proxy: {
					type: data.componentConfig?.type,
					schemaFilePath: data.componentConfig?.schemaFilePath,
					docPath: data.componentConfig?.docPath,
					thumbnailPath: data.componentConfig?.thumbnailPath,
					networkVisibilities: data.componentConfig?.networkVisibility ? [data.componentConfig?.networkVisibility] : undefined,
				},
			});
		},
		onSuccess: () => setStepIndex(stepIndex + 1),
	});

	const steps: StepItem[] = [
		{
			label: "General Details",
			content: (
				<ComponentFormGenDetailsSection
					{...props}
					key="gen-details-step"
					form={genDetailsForm}
					onNextClick={() => {
						gitProxyForm.setValue(
							"proxyContext",
							genDetailsForm.getValues()?.name ? `/${makeURLSafe(genDetailsForm.getValues()?.name)}` : `/path-${getRandomNumber()}`,
						);
						setStepIndex(stepIndex + 1);
					}}
				/>
			),
		},
	];

	if (type !== ChoreoComponentType.ApiProxy) {
		steps.push({
			label: "Build Details",
			content: (
				<ComponentFormBuildSection
					{...props}
					key="build-details-step"
					onNextClick={() => setStepIndex(stepIndex + 1)}
					onBackClick={() => setStepIndex(stepIndex - 1)}
					form={buildDetailsForm}
					selectedType={type}
					subPath={subPath}
					compPath={compPath}
				/>
			),
		});
	}

	if (type === ChoreoComponentType.Service) {
		if (buildPackLang !== ChoreoBuildPackNames.MicroIntegrator || useDefaultEndpoints) {
			steps.push({
				label: "Endpoint Details",
				content: (
					<ComponentFormEndpointsSection
						{...props}
						key="endpoints-step"
						componentName={name || "component"}
						compPath={compPath}
						onNextClick={(data) => submitEndpoints(data.endpoints as Endpoint[])}
						onBackClick={() => setStepIndex(stepIndex - 1)}
						isSaving={isSubmittingEndpoints}
						form={endpointDetailsForm}
					/>
				),
			});
		}
	}
	if (type === ChoreoComponentType.ApiProxy) {
		steps.push({
			label: "Proxy Details",
			content: (
				<ComponentFormGitProxySection
					{...props}
					key="git-proxy-step"
					onNextClick={(data) => submitProxyConfig(data)}
					onBackClick={() => setStepIndex(stepIndex - 1)}
					isSaving={isSubmittingProxyConfig}
					form={gitProxyForm}
					compPath={compPath}
				/>
			),
		});
	}

	steps.push({
		label: "Summary",
		content: (
			<ComponentFormSummarySection
				{...props}
				key="summary-step"
				genDetailsForm={genDetailsForm}
				buildDetailsForm={buildDetailsForm}
				endpointDetailsForm={endpointDetailsForm}
				gitProxyForm={gitProxyForm}
				onNextClick={() => createComponent()}
				onBackClick={() => setStepIndex(stepIndex - 1)}
				isCreating={isCreatingComponent}
			/>
		),
	});

	return (
		<div className="flex flex-row justify-center p-1 md:p-3 lg:p-4 xl:p-6">
			<div className="container">
				<form className="mx-auto flex max-w-4xl flex-col gap-2 p-4">
					<HeaderSection
						title="Create New Component"
						tags={[
							{ label: "Project", value: project.name },
							{ label: "Organization", value: organization.name },
						]}
					/>
					<div className="mt-4 flex flex-col gap-6" ref={formSections}>
						<VerticalStepper currentStep={stepIndex} steps={steps} />
					</div>
				</form>
			</div>
		</div>
	);
};
