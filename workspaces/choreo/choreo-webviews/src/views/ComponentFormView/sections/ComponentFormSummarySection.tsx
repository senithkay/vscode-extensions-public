/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type Buildpack,
	ChoreoBuildPackNames,
	ChoreoComponentType,
	type NewComponentWebviewProps,
	WebAppSPATypes,
} from "@wso2-enterprise/choreo-core";
import classNames from "classnames";
import React, { type HTMLProps, type FC, type ReactNode, useMemo } from "react";
import type { z } from "zod";
import { Banner } from "../../../components/Banner";
import { Button } from "../../../components/Button";
import { queryKeys } from "../../../hooks/use-queries";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";
import { getComponentTypeText } from "../../ComponentDetailsView/utils";
import type { componentBuildDetailsSchema, componentEndpointsFormSchema, componentGeneralDetailsSchema } from "../componentFormSchema";

type ComponentFormGenDetailsType = z.infer<typeof componentGeneralDetailsSchema>;
type ComponentFormBuildDetailsType = z.infer<typeof componentBuildDetailsSchema>;
type ComponentFormEndpointsType = z.infer<typeof componentEndpointsFormSchema>;

interface Props extends NewComponentWebviewProps {
	genDetails: ComponentFormGenDetailsType;
	buildDetails: ComponentFormBuildDetailsType;
	endpointDetails: ComponentFormEndpointsType;
	isCreating: boolean;
	onNextClick: () => void;
	onBackClick: () => void;
}

export const ComponentFormSummarySection: FC<Props> = ({
	organization,
	genDetails,
	buildDetails,
	endpointDetails,
	onBackClick,
	onNextClick,
	directoryFsPath,
	isCreating,
}) => {
	const [summaryWrapRef] = useAutoAnimate();
	const queryClient = useQueryClient();

	const {
		data: configDriftFiles = [],
		isLoading: isLoadingConfigDriftFiles,
		isFetching: isFetchingConfigDrift,
		refetch: refetchConfigDrift,
	} = useQuery({
		queryKey: ["get-config-drift", { dirPath: genDetails?.subPath }],
		queryFn: async () => {
			const directoryPath = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, genDetails.subPath]);
			return ChoreoWebViewAPI.getInstance().getConfigFileDrifts({ repoDir: directoryPath, branch: genDetails.branch, repoUrl: genDetails.repoUrl });
		},
		refetchOnWindowFocus: true,
		enabled: genDetails?.repoUrl?.length > 0,
	});

	const { data: hasLocalChanges } = useQuery({
		queryKey: ["has-local-changes", { dirPath: genDetails?.subPath }],
		queryFn: async () => {
			const directoryPath = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, genDetails.subPath]);
			return ChoreoWebViewAPI.getInstance().hasDirtyLocalGitRepo(directoryPath);
		},
		refetchOnWindowFocus: true,
	});

	const buildPackName = useMemo(() => {
		const buildPackQueryKey = queryKeys.getBuildPacks(genDetails?.type, organization);
		const buildPacks: Buildpack[] | undefined = queryClient.getQueryData(buildPackQueryKey);
		return buildPacks?.find((item) => item.language === buildDetails?.buildPackLang)?.displayName || buildDetails?.buildPackLang;
	}, [genDetails?.type, buildDetails?.buildPackLang, organization]);

	const items: ReactNode[] = [];
	if (buildPackName) {
		items.push(<ComponentSummaryItem title="Build Pack" text={buildPackName} />);

		if (
			[ChoreoBuildPackNames.Ballerina, ChoreoBuildPackNames.MicroIntegrator, ChoreoBuildPackNames.StaticFiles].includes(
				buildDetails?.buildPackLang as ChoreoBuildPackNames,
			)
		) {
			// do nothing
		} else if (buildDetails?.buildPackLang === ChoreoBuildPackNames.Docker) {
			items.push(<ComponentSummaryItem title="Docker File" text={buildDetails?.dockerFile} />);

			if (genDetails?.type === ChoreoComponentType.WebApplication) {
				items.push(<ComponentSummaryItem title="Port" text={buildDetails?.webAppPort} />);
			}
		} else if (WebAppSPATypes.includes(buildDetails?.buildPackLang as ChoreoBuildPackNames)) {
			items.push(<ComponentSummaryItem title="Node Version" text={buildDetails?.spaNodeVersion} />);
			items.push(<ComponentSummaryItem title="Build Command" text={buildDetails?.spaBuildCommand} />);
			items.push(<ComponentSummaryItem title="Output directory" text={buildDetails?.spaOutputDir} />);
		} else if (buildDetails?.buildPackLang) {
			// Build pack type
			items.push(<ComponentSummaryItem title="Language Version" text={buildDetails?.langVersion} />);
			if (genDetails?.type === ChoreoComponentType.WebApplication) {
				items.push(<ComponentSummaryItem title="Port" text={buildDetails?.webAppPort} />);
			}
		}

		// todo: check if we need to handle MI
		if (genDetails?.type === ChoreoComponentType.Service && endpointDetails?.endpoints?.length) {
			items.push(
				<ComponentSummaryItem
					title="Endpoints"
					text={`${endpointDetails?.endpoints?.length} endpoint${endpointDetails?.endpoints?.length > 1 ? "s" : ""}`}
				/>,
			);
		}
	}

	return (
		<div ref={summaryWrapRef} className="flex flex-col gap-4 pt-2">
			{configDriftFiles.length > 0 && (
				<Banner
					type="warning"
					className="mb-4"
					title="Configuration Changes Detected"
					subTitle={`Choreo requires the metadata in the ${configDriftFiles.join(",")} ${configDriftFiles?.length > 1 ? "files" : "file"} to be committed and pushed to the selected remote repository for proper functionality.`}
					refreshBtn={{ isRefreshing: isFetchingConfigDrift, onClick: refetchConfigDrift }}
				/>
			)}

			{configDriftFiles.length === 0 && hasLocalChanges && (
				<Banner
					className="mb-4"
					title="Local Changes Detected"
					subTitle="Choreo builds your component from the source code in the selected remote repository. Please commit and push your local changes to the remote Git repository."
				/>
			)}

			<div
				className={classNames("grid grid-cols-2 gap-1 md:grid-cols-3 md:gap-2 xl:grid-cols-4 xl:gap-3", isLoadingConfigDriftFiles && "animate-pulse")}
			>
				<ComponentSummaryItem title="Name" text={genDetails?.name} />
				<ComponentSummaryItem title="Type" text={getComponentTypeText(genDetails?.type)} />
				<ComponentSummaryItem title="Repository" text={genDetails?.repoUrl} className="col-span-2" />
				<ComponentSummaryItem title="Branch" text={genDetails?.branch} />
				{genDetails?.subPath && <ComponentSummaryItem title="Directory" text={genDetails?.subPath} />}
				{items}
			</div>

			<div className="flex justify-end gap-3 pt-6 pb-2">
				<Button appearance="secondary" onClick={onBackClick} disabled={isCreating}>
					Back
				</Button>
				<Button onClick={onNextClick} disabled={isCreating || isLoadingConfigDriftFiles || configDriftFiles.length > 0}>
					{isCreating ? "Creating..." : "Create"}
				</Button>
			</div>
		</div>
	);
};

const ComponentSummaryItem: FC<{ title: string; text: string | number; className?: HTMLProps<HTMLElement>["className"] }> = ({
	text,
	title,
	className,
}) => {
	return (
		<div title={`${title}: ${text}`} className={className}>
			<div className="line-clamp-1 text-sm">{title}</div>
			<div className="line-clamp-1 font-light opacity-80">{text}</div>
		</div>
	);
};
