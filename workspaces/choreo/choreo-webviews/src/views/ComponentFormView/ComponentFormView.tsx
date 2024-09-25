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
	makeURLSafe,
} from "@wso2-enterprise/choreo-core";
import React, { type FC, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { HeaderSection } from "../../components/HeaderSection";
import { type StepItem, VerticalStepper } from "../../components/VerticalStepper";
import { ChoreoWebViewAPI } from "../../utilities/vscode-webview-rpc";
import {
	type componentBuildDetailsSchema,
	componentEndpointsFormSchema,
	type componentGeneralDetailsSchema,
	getComponentFormSchemaBuildDetails,
	getComponentFormSchemaGenDetails,
	sampleEndpointItem,
} from "./componentFormSchema";
import { ComponentFormBuildSection } from "./sections/ComponentFormBuildSection";
import { ComponentFormEndpointsSection } from "./sections/ComponentFormEndpointsSection";
import { ComponentFormGenDetailsSection } from "./sections/ComponentFormGenDetailsSection";
import { ComponentFormSummarySection } from "./sections/ComponentFormSummarySection";

type ComponentFormGenDetailsType = z.infer<typeof componentGeneralDetailsSchema>;
type ComponentFormBuildDetailsType = z.infer<typeof componentBuildDetailsSchema>;
type ComponentFormEndpointsType = z.infer<typeof componentEndpointsFormSchema>;

export const ComponentFormView: FC<NewComponentWebviewProps> = (props) => {
	const { project, organization, directoryPath, directoryFsPath, initialValues, existingComponents } = props;
	const [formSections] = useAutoAnimate();

	const [stepIndex, setStepIndex] = useState(0);

	const genDetailsForm = useForm<ComponentFormGenDetailsType>({
		resolver: zodResolver(getComponentFormSchemaGenDetails(existingComponents), { async: true }, { mode: "async" }),
		mode: "all",
		defaultValues: {
			name: "",
			type: initialValues?.type ?? "",
			subPath: initialValues?.subPath || "",
			repoUrl: "",
			branch: "",
		},
	});
	const genDetails = genDetailsForm.watch();

	const buildDetailsForm = useForm<ComponentFormBuildDetailsType>({
		resolver: zodResolver(
			getComponentFormSchemaBuildDetails(genDetails?.type, directoryFsPath, genDetails?.subPath),
			{ async: true },
			{ mode: "async" },
		),
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
	const buildDetails = buildDetailsForm.watch();

	const endpointDetailsForm = useForm<ComponentFormEndpointsType>({
		resolver: zodResolver(componentEndpointsFormSchema),
		mode: "all",
		defaultValues: { endpoints: [] },
	});
	const endpointDetails = endpointDetailsForm.watch();

	useQuery({
		queryKey: ["service-dir-endpoints", { directoryPath, subPath: genDetails?.subPath, type: genDetails?.type }],
		queryFn: async () => {
			const compPath = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, genDetails?.subPath]);
			return ChoreoWebViewAPI.getInstance().readServiceEndpoints(compPath);
		},
		select: (resp) => resp?.endpoints,
		refetchOnWindowFocus: false,
		enabled: genDetails?.type === ChoreoComponentType.Service,
		onSuccess: (resp) => {
			endpointDetailsForm.setValue("endpoints", resp?.length > 0 ? resp : [{ ...sampleEndpointItem, name: genDetails?.name }]);
		},
	});

	const { data: compPath = directoryFsPath } = useQuery({
		queryKey: ["comp-create-path", { directoryFsPath, subPath: genDetails?.subPath || "" }],
		queryFn: () => ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, genDetails?.subPath || ""]),
	});

	const { mutate: createComponent, isLoading: isCreatingComponent } = useMutation({
		mutationFn: async () => {
			const componentName = makeURLSafe(genDetails.name);

			const componentDir = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, genDetails.subPath]);

			const createCompCommandParams: SubmitComponentCreateReq = {
				org: organization,
				project: project,
				autoBuildOnCommit: buildDetails?.autoBuildOnCommit,
				createParams: {
					orgId: organization.id.toString(),
					projectHandle: project.handler,
					name: componentName,
					displayName: genDetails.name,
					type: genDetails.type,
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
			return ChoreoWebViewAPI.getInstance().submitEndpointsCreate({ componentDir: compPath, endpoints });
		},
		onSuccess: () => setStepIndex(stepIndex + 1),
	});

	const steps: StepItem[] = [
		{
			label: "General Details",
			content: (
				<ComponentFormGenDetailsSection {...props} key="gen-details-step" form={genDetailsForm} onNextClick={() => setStepIndex(stepIndex + 1)} />
			),
		},
		{
			label: "Build Details",
			content: (
				<ComponentFormBuildSection
					{...props}
					key="build-details-step"
					onNextClick={() => setStepIndex(stepIndex + 1)}
					onBackClick={() => setStepIndex(stepIndex - 1)}
					form={buildDetailsForm}
					selectedType={genDetails?.type}
					subPath={genDetails?.subPath}
					compPath={compPath}
				/>
			),
		},
	];

	if (genDetails?.type === ChoreoComponentType.Service) {
		if (buildDetails?.buildPackLang !== ChoreoBuildPackNames.MicroIntegrator || !buildDetails.useDefaultEndpoints) {
			steps.push({
				label: "Endpoint Details",
				content: (
					<ComponentFormEndpointsSection
						{...props}
						key="endpoints-step"
						componentName={genDetails?.name || "component"}
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

	steps.push({
		label: "Summary",
		content: (
			<ComponentFormSummarySection
				{...props}
				key="summary-step"
				genDetails={genDetails}
				buildDetails={buildDetails}
				endpointDetails={endpointDetails}
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
