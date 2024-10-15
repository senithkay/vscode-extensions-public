/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChoreoComponentType, type NewComponentWebviewProps } from "@wso2-enterprise/choreo-core";
import React, { type FC, type ReactNode, useEffect } from "react";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { Banner } from "../../../components/Banner";
import { Button } from "../../../components/Button";
import { Dropdown } from "../../../components/FormElements/Dropdown";
import { PathSelect } from "../../../components/FormElements/PathSelect";
import { TextField } from "../../../components/FormElements/TextField";
import { useGetGitBranches } from "../../../hooks/use-queries";
import { useLinkedDirStateContext } from "../../../providers/linked-dir-state-ctx-provider";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";
import type { componentGeneralDetailsSchema } from "../componentFormSchema";

type ComponentFormGenDetailsType = z.infer<typeof componentGeneralDetailsSchema>;

interface Props extends NewComponentWebviewProps {
	onNextClick: () => void;
	initialFormValues?: ComponentFormGenDetailsType;
	form: UseFormReturn<ComponentFormGenDetailsType>;
	componentType: string;
}

export const ComponentFormGenDetailsSection: FC<Props> = ({
	onNextClick,
	organization,
	directoryPath,
	directoryFsPath,
	directoryName,
	form,
	componentType,
}) => {
	const [compDetailsSections] = useAutoAnimate();
	const [sourceDetailsSections] = useAutoAnimate();

	const { state: linkedDirState } = useLinkedDirStateContext();

	const subPath = form.watch("subPath");
	const repoUrl = form.watch("repoUrl");

	const {
		data: gitData,
		isLoading: isLoadingGitData,
		refetch: refetchGitData,
	} = useQuery({
		queryKey: ["git-data", { subPath }],
		queryFn: async () => {
			const dir = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, subPath]);
			const gitData = await ChoreoWebViewAPI.getInstance().getLocalGitData(dir);
			return gitData ?? null;
		},
		refetchOnWindowFocus: true,
		cacheTime: 0,
	});

	useEffect(() => {
		if (gitData?.remotes?.length > 0 && !gitData?.remotes.includes(form.getValues("repoUrl"))) {
			if (gitData?.upstream?.remoteUrl) {
				form.setValue("repoUrl", gitData?.upstream?.remoteUrl, { shouldValidate: true });
			} else {
				form.setValue("repoUrl", gitData?.remotes[0], { shouldValidate: true });
			}
		}
	}, [gitData]);

	const {
		isLoading: isLoadingBranches,
		data: branches = [],
		refetch: refetchBranches,
		isFetching: isFetchingBranches,
	} = useGetGitBranches(repoUrl, organization, {
		enabled: !!repoUrl,
		refetchOnWindowFocus: true,
	});

	useEffect(() => {
		if (branches?.length > 0 && (!form.getValues("branch") || !branches.includes(form.getValues("branch")))) {
			if (branches.includes(gitData.upstream?.name)) {
				form.setValue("branch", gitData.upstream?.name, { shouldValidate: true });
			} else if (branches.includes("main")) {
				form.setValue("branch", "main", { shouldValidate: true });
			} else if (branches.includes("master")) {
				form.setValue("branch", "master", { shouldValidate: true });
			} else {
				form.setValue("branch", branches[0], { shouldValidate: true });
			}
		}
	}, [branches, gitData]);

	const {
		isLoading: isLoadingRepoAccess,
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
		refetchOnWindowFocus: true,
	});

	const onSubmitForm: SubmitHandler<ComponentFormGenDetailsType> = () => onNextClick();

	const { mutate: initializeGit } = useMutation({
		mutationFn: () => ChoreoWebViewAPI.getInstance().triggerCmd("git.init"),
		onSuccess: () => refetchGitData(),
	});

	const { mutate: addGitRemote } = useMutation({
		mutationFn: () => ChoreoWebViewAPI.getInstance().triggerCmd("git.addRemote"),
		onSuccess: () => refetchGitData(),
	});

	let invalidRepoMsg: ReactNode = "";
	let invalidRepoAction = "";
	let onInvalidRepoActionClick: () => void;
	let onInvalidRepoRefreshClick: () => void;
	let onInvalidRepoRefreshing: boolean;

	if (!isLoadingGitData) {
		if (gitData === null) {
			invalidRepoMsg = "Please initialize the selected directory as a Git repository to proceed.";
			invalidRepoAction = "Initialize";
			onInvalidRepoActionClick = initializeGit;
			onInvalidRepoRefreshClick = refetchGitData;
		} else if (gitData?.remotes?.length === 0) {
			invalidRepoMsg = "The selected Git repository has no configured remotes. Please add a remote to proceed.";
			invalidRepoAction = "Add Remote";
			onInvalidRepoActionClick = addGitRemote;
			onInvalidRepoRefreshClick = refetchGitData;
		}
	}

	if (!invalidRepoMsg && repoUrl && !isLoadingRepoAccess && !isRepoAuthorizedResp?.isAccessible) {
		if (isRepoAuthorizedResp?.retrievedRepos) {
			invalidRepoMsg = (
				<span>
					Choreo lacks access to this repository. <span className="font-thin">(Only public repos are allowed within the free tier.)</span>
				</span>
			);
			invalidRepoAction = "Grant Access";
			onInvalidRepoActionClick = () => ChoreoWebViewAPI.getInstance().triggerGithubInstallFlow(organization.id?.toString());
		} else {
			invalidRepoMsg = "Please authorize Choreo to access your GitHub repositories.";
			invalidRepoAction = "Authorize";
			onInvalidRepoActionClick = () => ChoreoWebViewAPI.getInstance().triggerGithubAuthFlow(organization.id?.toString());
		}
		onInvalidRepoRefreshClick = refetchRepoAccess;
		onInvalidRepoRefreshing = isFetchingRepoAccess;
	}

	const dirComponentExists = linkedDirState?.components?.some((item) => item.component?.spec?.source?.github?.path === subPath);

	return (
		<>
			<div className="grid gap-4 md:grid-cols-2" ref={compDetailsSections}>
				<TextField
					label="Name"
					key="gen-details-name"
					required
					name="name"
					placeholder="component-name"
					control={form.control}
					wrapClassName="col-span-full"
				/>
				<PathSelect
					name="subPath"
					key="gen-details-path"
					label={componentType === ChoreoComponentType.ApiProxy ? "Source Directory" : "Source/Docker Context Directory"}
					required
					control={form.control}
					basePath={directoryPath}
					directoryName={directoryName}
					type="directory"
					promptTitle="Select Component Directory"
					wrapClassName="col-span-full"
				/>
				{dirComponentExists && (
					<Banner key="dir-already-in-use" title="The selected directory is associated with another component within your Choreo project" />
				)}
				<div className="col-span-full grid gap-4 md:grid-cols-2" ref={sourceDetailsSections}>
					{gitData?.remotes?.length > 0 && (
						<Dropdown
							label="Repository"
							key="gen-details-repo"
							required
							name="repoUrl"
							control={form.control}
							items={gitData?.remotes}
							loading={isLoadingGitData}
						/>
					)}
					{invalidRepoMsg && (
						<Banner
							type="warning"
							className="col-span-full md:order-last"
							key="invalid-repo-banner"
							title={invalidRepoMsg}
							actionLink={invalidRepoAction && onInvalidRepoActionClick ? { title: invalidRepoAction, onClick: onInvalidRepoActionClick } : undefined}
							refreshBtn={onInvalidRepoRefreshClick ? { onClick: onInvalidRepoRefreshClick, isRefreshing: onInvalidRepoRefreshing } : undefined}
						/>
					)}
					{!invalidRepoMsg && !isLoadingBranches && branches?.length === 0 && (
						<Banner
							type="warning"
							key="no-branches-banner"
							className="col-span-full md:order-last"
							title={"The selected remote repository has no branches. Please publish your local branch to the remote repository."}
							refreshBtn={{ onClick: refetchBranches, isRefreshing: isFetchingBranches }}
						/>
					)}
					{!invalidRepoMsg && gitData?.remotes?.length > 0 && (
						<Dropdown
							label="Branch"
							key="gen-details-branch"
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

			<div className="flex justify-end gap-3 pt-6 pb-2">
				<Button onClick={form.handleSubmit(onSubmitForm)} disabled={!!invalidRepoMsg}>
					Next
				</Button>
			</div>
		</>
	);
};
