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
import type { NewComponentWebviewProps } from "@wso2-enterprise/choreo-core";
import React, { type FC, type ReactNode, useEffect } from "react";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { Banner } from "../../../components/Banner";
import { Button } from "../../../components/Button";
import { Dropdown } from "../../../components/FormElements/Dropdown";
import { TextField } from "../../../components/FormElements/TextField";
import { useGetGitBranches } from "../../../hooks/use-queries";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";
import type { componentGeneralDetailsSchema } from "../componentFormSchema";

type ComponentFormGenDetailsType = z.infer<typeof componentGeneralDetailsSchema>;

interface Props extends NewComponentWebviewProps {
	onNextClick: () => void;
	initialFormValues?: ComponentFormGenDetailsType;
	form: UseFormReturn<ComponentFormGenDetailsType>;
	componentType: string;
}

export const ComponentFormGenDetailsSection: FC<Props> = ({ onNextClick, organization, directoryFsPath, form }) => {
	const [compDetailsSections] = useAutoAnimate();
	const [sourceDetailsSections] = useAutoAnimate();

	const repoUrl = form.watch("repoUrl");

	const {
		data: gitData,
		isLoading: isLoadingGitData,
		refetch: refetchGitData,
	} = useQuery({
		queryKey: ["git-data", { directoryFsPath }],
		queryFn: async () => {
			const gitData = await ChoreoWebViewAPI.getInstance().getLocalGitData(directoryFsPath);
			return gitData ?? null;
		},
		refetchOnWindowFocus: true,
		cacheTime: 0,
	});

	const { data: subPath } = useQuery({
		queryKey: ["sub-path", { gitRoot: gitData?.gitRoot }],
		queryFn: () => ChoreoWebViewAPI.getInstance().getSubPath({ subPath: directoryFsPath, parentPath: gitData?.gitRoot }),
		enabled: !!gitData?.gitRoot,
	});

	useEffect(() => {
		if (gitData?.remotes?.length > 0 && !gitData?.remotes.includes(form.getValues("repoUrl"))) {
			if (gitData?.upstream?.remoteUrl) {
				form.setValue("repoUrl", gitData?.upstream?.remoteUrl, { shouldValidate: true });
			} else {
				form.setValue("repoUrl", gitData?.remotes[0], { shouldValidate: true });
			}
		}
		if (gitData?.gitRoot) {
			form.setValue("gitRoot", gitData?.gitRoot);
		}
	}, [gitData]);

	useEffect(() => {
		form.setValue("subPath", subPath || "");
	}, [subPath]);

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

	const { mutate: pushChanges } = useMutation({
		mutationFn: () => ChoreoWebViewAPI.getInstance().triggerCmd("git.push"),
		onSuccess: () => refetchGitData(),
	});

	let invalidRepoMsg: ReactNode = "";
	let invalidRepoAction = "";
	let invalidRepoBannerType: "error" | "warning" | "info" = "warning";
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
					Choreo lacks access to the selected repository. <span className="font-thin">(Only public repos are allowed within the free tier.)</span>
				</span>
			);
			invalidRepoAction = "Grant Access";
			onInvalidRepoActionClick = () => ChoreoWebViewAPI.getInstance().triggerGithubInstallFlow(organization.id?.toString());
		} else {
			invalidRepoMsg = "Please authorize Choreo to access your GitHub repositories.";
			invalidRepoAction = "Authorize";
			onInvalidRepoActionClick = () => ChoreoWebViewAPI.getInstance().triggerGithubAuthFlow(organization.id?.toString());
			invalidRepoBannerType = "info";
		}
		onInvalidRepoRefreshClick = refetchRepoAccess;
		onInvalidRepoRefreshing = isFetchingRepoAccess;
	}

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
							type={invalidRepoBannerType}
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
							actionLink={{ title: "Push Changes", onClick: pushChanges }}
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
