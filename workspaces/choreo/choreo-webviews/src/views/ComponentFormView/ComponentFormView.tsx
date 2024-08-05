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
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import {
	ChoreoBuildPackNames,
	ChoreoComponentType,
	type NewComponentWebviewProps,
	type SubmitComponentCreateReq,
	WebAppSPATypes,
	makeURLSafe,
} from "@wso2-enterprise/choreo-core";
import React, { type FC, type ReactNode, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { z } from "zod";
import { Banner } from "../../components/Banner";
import { Button } from "../../components/Button";
import { Codicon } from "../../components/Codicon";
import { Divider } from "../../components/Divider";
import { Dropdown } from "../../components/FormElements/Dropdown";
import { PathSelect } from "../../components/FormElements/PathSelect";
import { TextField } from "../../components/FormElements/TextField";
import { HeaderSection } from "../../components/HeaderSection";
import { useGetBuildPacks, useGetGitBranches, useGetGitRemotes } from "../../hooks/use-queries";
import { ChoreoWebViewAPI } from "../../utilities/vscode-webview-rpc";
import { type componentFormSchema, getComponentFormSchema } from "./componentFormSchema";

type ComponentFormType = z.infer<typeof componentFormSchema>;

export const ComponentFormView: FC<NewComponentWebviewProps> = ({
	project,
	organization,
	directoryPath,
	directoryFsPath,
	directoryName,
	initialValues,
	existingComponents,
}) => {
	const [formSections] = useAutoAnimate();
	const [compDetailsSections] = useAutoAnimate();
	const [sourceDetailsSections] = useAutoAnimate();
	const [buildConfigSections] = useAutoAnimate();

	const form = useForm<ComponentFormType>({
		resolver: zodResolver(getComponentFormSchema(existingComponents, directoryFsPath), { async: true }, { mode: "async" }),
		mode: "all",
		defaultValues: {
			name: "",
			type: initialValues?.type ?? "",
			buildPackLang: initialValues?.buildPackLang ?? "",
			langVersion: "",
			subPath: initialValues?.subPath || "",
			repoUrl: "",
			branch: "",
			dockerFile: "",
			port: 8080,
			outboundVisibility: "Public",
			spaBuildCommand: "npm run build",
			spaNodeVersion: "20.0.0",
			spaOutputDir: "build",
		},
	});

	const selectedType = form.watch("type");
	const selectedLang = form.watch("buildPackLang");
	const subPath = form.watch("subPath");
	const repoUrl = form.watch("repoUrl");

	const { data: hasEndpoints } = useQuery({
		queryKey: ["directory-has-endpoints", { directoryPath, subPath, selectedLang }],
		queryFn: async () => {
			const compPath = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, subPath]);
			return ChoreoWebViewAPI.getInstance().readServiceEndpoints(compPath);
		},
		select: (resp) => resp?.endpoints?.length > 0,
		enabled: selectedType === ChoreoComponentType.Service && !!selectedLang,
	});

	const { isLoading: isLoadingBuildPacks, data: buildpacks = [] } = useGetBuildPacks(selectedType, organization, {
		refetchOnWindowFocus: false,
		enabled: !!selectedType,
	});

	useEffect(() => {
		if (!buildpacks.find((item) => item.language === selectedLang)) {
			// Reset build pack selection if its invalid
			setTimeout(() => {
				form.setValue("buildPackLang", "");
				form.setValue("langVersion", "");
			}, 100);
		}
	}, [form, selectedLang, buildpacks]);

	useEffect(() => {
		form.trigger("subPath");
	}, [selectedLang]);

	const { isLoading: isLoadingRemotes, data: gitRemotes = [] } = useGetGitRemotes(directoryFsPath, subPath, {
		keepPreviousData: true,
	});

	useEffect(() => {
		if (gitRemotes.length > 0 && !gitRemotes.includes(form.getValues("repoUrl"))) {
			form.setValue("repoUrl", gitRemotes[0]);
		}
	}, [form, gitRemotes]);

	const { isLoading: isLoadingBranches, data: branches = [] } = useGetGitBranches(repoUrl, organization, {
		enabled: !!repoUrl,
	});

	useEffect(() => {
		if (branches?.length > 0 && (!form.getValues("branch") || !branches.includes(form.getValues("branch")))) {
			if (branches.includes("main")) {
				form.setValue("branch", "main");
			} else if (branches.includes("master")) {
				form.setValue("branch", "master");
			} else {
				form.setValue("branch", branches[0]);
			}
		}
	}, [form, branches]);

	const {
		isLoading: isCheckingRepoAccess,
		isFetching: isFetchingRepoAccess,
		data: isRepoAuthorizedResp,
		refetch: refetchRepoAccess,
	} = useQuery({
		queryKey: ["git-repo-access", { repo: repoUrl, orgId: organization?.id }],
		queryFn: () =>
			ChoreoWebViewAPI.getInstance().getChoreoRpcClient().isRepoAuthorized({
				repoUrl: repoUrl,
				orgId: organization.id.toString(),
			}),
		enabled: !!repoUrl,
		keepPreviousData: true,
	});

	const selectedBuildPack = buildpacks?.find((item) => item.language === selectedLang);

	const supportedVersions: string[] = selectedBuildPack?.supportedVersions?.split(",")?.reverse() ?? [];

	useEffect(() => {
		if (supportedVersions.length > 0 && (!form.getValues("langVersion") || !supportedVersions.includes(form.getValues("langVersion")))) {
			form.setValue("langVersion", supportedVersions[0]);
		}
	}, [supportedVersions]);

	const { mutate: createComponent, isLoading: isCreatingComponent } = useMutation({
		mutationFn: async (data: ComponentFormType) => {
			const componentName = makeURLSafe(data.name);

			const componentDir = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, data.subPath]);

			const createCompCommandParams: SubmitComponentCreateReq = {
				org: organization,
				project: project,
				createParams: {
					orgId: organization.id.toString(),
					projectHandle: project.handler,
					name: componentName,
					displayName: data.name,
					type: data.type,
					buildPackLang: data.buildPackLang,
					componentDir,
					repoUrl: data.repoUrl,
					branch: data.branch,
					langVersion: data.langVersion,
					dockerFile: data.dockerFile,
					port: data.port,
					spaBuildCommand: data.spaBuildCommand,
					spaNodeVersion: data.spaNodeVersion,
					spaOutputDir: data.spaOutputDir,
				},
			};

			if (data.type === ChoreoComponentType.Service && !hasEndpoints) {
				createCompCommandParams.endpoint = {
					name: componentName,
					port: data.port,
					networkVisibility: data.outboundVisibility,
					type: "REST",
					context: "/",
				};
			}

			const created = await ChoreoWebViewAPI.getInstance().submitComponentCreate(createCompCommandParams);

			if (created) {
				ChoreoWebViewAPI.getInstance().closeWebView();
			}
		},
	});

	const onSubmit: SubmitHandler<ComponentFormType> = (data) => createComponent(data);

	const buildConfigs: ReactNode[] = [];
	if (
		[ChoreoBuildPackNames.Ballerina, ChoreoBuildPackNames.MicroIntegrator, ChoreoBuildPackNames.StaticFiles].includes(
			selectedLang as ChoreoBuildPackNames,
		)
	) {
		// do nothing
	} else if (selectedLang === ChoreoBuildPackNames.Docker) {
		buildConfigs.push(
			<PathSelect
				name="dockerFile"
				label="Dockerfile path"
				required
				control={form.control}
				basePath={directoryPath}
				directoryName={directoryName}
				type="file"
				key="docker-path"
				promptTitle="Select Dockerfile"
				wrapClassName="col-span-full"
			/>,
		);
		if (selectedType === ChoreoComponentType.WebApplication) {
			buildConfigs.push(<TextField label="Port" key="port" required name="port" control={form.control} />);
		}
	} else if (WebAppSPATypes.includes(selectedLang as ChoreoBuildPackNames)) {
		buildConfigs.push(
			<TextField label="Node Version" key="node-version" required name="spaNodeVersion" control={form.control} placeholder="Eg: 18, 18.1.2" />,
		);
		buildConfigs.push(
			<TextField
				label="Build Command"
				key="build-command"
				required
				name="spaBuildCommand"
				control={form.control}
				placeholder="npm run build / yarn build"
			/>,
		);
		buildConfigs.push(
			<TextField label="Build Output Directory" key="spa-out-dir" required name="spaOutputDir" control={form.control} placeholder="build" />,
		);
	} else if (selectedLang) {
		// Build pack type
		buildConfigs.push(
			<Dropdown
				label="Language Version"
				key="lang-version"
				required
				name="langVersion"
				control={form.control}
				items={supportedVersions}
				disabled={supportedVersions?.length === 0}
			/>,
		);

		if (selectedType === ChoreoComponentType.WebApplication) {
			buildConfigs.push(<TextField label="Port" key="port" required name="port" control={form.control} placeholder="8080" />);
		}
	}

	const endpointConfigs: ReactNode[] = [];
	if (selectedType === ChoreoComponentType.Service && !!selectedLang && !hasEndpoints) {
		endpointConfigs.push(<TextField label="Port" required name="port" control={form.control} placeholder="8080" />);
		endpointConfigs.push(
			<Dropdown
				label="Visibility"
				key="outboundVisibility"
				required
				name="outboundVisibility"
				items={["Public", "Organization", "Project"]}
				control={form.control}
			/>,
		);
	}

	let invalidRepoMsg: ReactNode = "";
	if (!isLoadingRemotes && gitRemotes?.length === 0) {
		invalidRepoMsg = "The directory does not contain any Git remotes.";
	} else if (repoUrl && !isCheckingRepoAccess && !isRepoAuthorizedResp?.isAccessible) {
		invalidRepoMsg = (
			<div className="flex items-center">
				<div className="flex-1">
					{isRepoAuthorizedResp?.retrievedRepos
						? "Choreo lacks access to this repository. Please grant access by clicking"
						: "Please authorize Choreo to access your GitHub repositories by clicking"}{" "}
					<VSCodeLink
						className="font-bold text-vsc-list-warningForeground"
						onClick={
							isRepoAuthorizedResp?.retrievedRepos
								? () => ChoreoWebViewAPI.getInstance().triggerGithubInstallFlow(organization.id?.toString())
								: () => ChoreoWebViewAPI.getInstance().triggerGithubAuthFlow(organization.id?.toString())
						}
					>
						here
					</VSCodeLink>
					. {isRepoAuthorizedResp?.retrievedRepos ? "(Only public repos are allowed within the free tier.)" : ""}
				</div>
				<Button
					appearance="icon"
					className="text-vsc-list-warningForeground"
					title="Refresh access repository status"
					onClick={() => refetchRepoAccess()}
					disabled={isFetchingRepoAccess}
				>
					<Codicon name="refresh" />
				</Button>
			</div>
		);
	}

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
						<div className="grid gap-4 md:grid-cols-2" ref={compDetailsSections}>
							<TextField label="Name" required name="name" placeholder="component-name" control={form.control} />
							<Dropdown
								label="Type"
								required
								name="type"
								items={[
									{ label: "Service", value: ChoreoComponentType.Service },
									{ label: "Scheduled Task", value: ChoreoComponentType.ScheduledTask },
									{ label: "Manual Task", value: ChoreoComponentType.ManualTrigger },
									{ label: "Web Application", value: ChoreoComponentType.WebApplication },
									// TODO: Re-enable this after testing webhooks
									// { label: "Webhook", value: ChoreoComponentType.Webhook },
								]}
								control={form.control}
							/>
							{selectedType && (
								<Dropdown
									label="Build Pack"
									required
									name="buildPackLang"
									control={form.control}
									items={buildpacks?.map((item) => ({
										label: item.displayName,
										value: item.language,
									}))}
									loading={isLoadingBuildPacks}
									disabled={buildpacks.length === 0}
								/>
							)}
						</div>
						<div>
							<FormSectionHeader title="Component Source" />
							<div className="grid gap-4 md:grid-cols-2">
								<PathSelect
									name="subPath"
									label={selectedLang === ChoreoBuildPackNames.Docker ? "Docker Context" : "Directory"}
									required
									control={form.control}
									basePath={directoryPath}
									directoryName={directoryName}
									type="directory"
									promptTitle="Select Component Directory"
									wrapClassName="col-span-full"
								/>
								<div className="col-span-full grid gap-4 md:grid-cols-2" ref={sourceDetailsSections}>
									{gitRemotes?.length > 0 && (
										<Dropdown label="Repository" required name="repoUrl" control={form.control} items={gitRemotes} loading={isLoadingRemotes} />
									)}
									{invalidRepoMsg && (
										<Banner type="warning" className="col-span-full md:order-last">
											{invalidRepoMsg}
										</Banner>
									)}
									{!invalidRepoMsg && gitRemotes?.length > 0 && (
										<Dropdown
											label="Branch"
											required
											name="branch"
											control={form.control}
											items={branches}
											disabled={branches?.length === 0 || !isRepoAuthorizedResp?.isAccessible}
											loading={isLoadingBranches}
										/>
									)}
								</div>
							</div>
						</div>
						{buildConfigs.length > 0 && (
							<div>
								<FormSectionHeader title="Build Configurations" />
								<div className="grid gap-4 md:grid-cols-2" ref={buildConfigSections}>
									{buildConfigs}
								</div>
							</div>
						)}
						{endpointConfigs.length > 0 && (
							<div>
								<FormSectionHeader title="Endpoint Configurations" />
								<div className="grid gap-4 md:grid-cols-2">{endpointConfigs}</div>
							</div>
						)}
					</div>
					<div className="flex justify-end gap-3 pt-8 pb-4">
						<Button onClick={() => ChoreoWebViewAPI.getInstance().closeWebView()} appearance="secondary">
							Cancel
						</Button>
						<Button
							onClick={form.handleSubmit(onSubmit)}
							title={invalidRepoMsg ? "Invalid repo selection" : ""}
							disabled={!!invalidRepoMsg || isCreatingComponent}
						>
							{isCreatingComponent ? "Creating..." : "Create"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

const FormSectionHeader = ({ title }: { title: string }) => {
	return (
		<div className="mb-2 flex items-center gap-2 sm:gap-4">
			<Divider className="flex-1" />
			<h1 className="font-light text-base opacity-50">{title}</h1>
		</div>
	);
};
