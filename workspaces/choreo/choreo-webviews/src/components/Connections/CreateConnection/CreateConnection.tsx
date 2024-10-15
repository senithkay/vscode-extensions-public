/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	type ComponentKind,
	type ConnectionDetailed,
	type ConnectionListItem,
	type CreateComponentConnectionReq,
	type DeploymentTrack,
	type MarketplaceItem,
	type Organization,
	type Project,
	getTypeForDisplayType,
	toSentenceCase,
	toUpperSnakeCase,
} from "@wso2-enterprise/choreo-core";
import React, { type FC } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { queryKeys } from "../../../hooks/use-queries";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";
import { Button } from "../../Button";
import { Codicon } from "../../Codicon";
import { SectionHeader } from "../../FormElements/SectionHeader";
import { TextField } from "../../FormElements/TextField";

const createConnectionSchema = z.object({ name: z.string().min(1, "Required"), envNames: z.array(z.string().min(1, "Required")) });
type CreateConnectionForm = z.infer<typeof createConnectionSchema>;

interface Props {
	item: MarketplaceItem;
	component: ComponentKind;
	org: Organization;
	project: Project;
	onCreate: (createdItem: ConnectionDetailed) => void;
	directoryPath: string;
	deploymentTrack: DeploymentTrack;
}

export const CreateConnection: FC<Props> = ({ item, component, org, project, directoryPath, deploymentTrack, onCreate }) => {
	const queryClient = useQueryClient();

	const defaultSchema = item.connectionSchemas?.find((item) => item.isDefault) || item.connectionSchemas?.[0];

	const form = useForm<CreateConnectionForm>({
		resolver: zodResolver(createConnectionSchema),
		mode: "all",
		defaultValues: {
			// TODO: validate with existing connection names
			// TODO: append with a number if name already exists
			name: item.name,
			envNames: defaultSchema?.entries?.map((item) => toUpperSnakeCase(item.name)),
		},
	});

	const { mutate: createConnection, isLoading: isCreatingConnection } = useMutation({
		mutationFn: async (data: CreateConnectionForm) => {
			const req: CreateComponentConnectionReq = {
				componentId: component.metadata?.id,
				name: data.name,
				orgId: org.id?.toString(),
				orgUuid: org.uuid,
				projectId: project.id,
				serviceSchemaId: defaultSchema.id,
				serviceId: item.serviceId,
				serviceVisibility: item.visibility[0],
				componentType: getTypeForDisplayType(component?.spec?.type),
				componentPath: directoryPath,
				envs: defaultSchema?.entries?.map((item, index) => ({
					from: item.name,
					to: data.envNames[index],
				})),
			};
			const created = await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().createComponentConnection(req);

			if (created) {
				// TODO: replace all instance of component-config.yaml and endpoints.yaml with component.yaml
				ChoreoWebViewAPI.getInstance().showInfoMsg(
					`Connection ${data.name} created and component-config.yaml updated. Follow the developer guide to finish integration. Once done, commit and push your changes.`,
				);
				onCreate(created);

				const connectionQueryKey = queryKeys.getComponentConnections(component, project, org);
				const connectionItems: ConnectionListItem[] = queryClient.getQueryData(connectionQueryKey) ?? [];
				queryClient.setQueryData(connectionQueryKey, [...connectionItems, { name: data.name }]);
				queryClient.refetchQueries({ exact: true, queryKey: queryKeys.getComponentConfigDraft(directoryPath, component, deploymentTrack?.branch) });
			}
		},
		onError: () => {
			ChoreoWebViewAPI.getInstance().showErrorMsg("Failed to create new connection");
		},
	});

	const onSubmit: SubmitHandler<CreateConnectionForm> = (data) => createConnection(data);

	return (
		<div className="flex flex-col gap-2 overflow-y-auto px-4 sm:px-6">
			<form className="grid gap-4">
				<TextField label="Name" required name="name" placeholder="connection-name" control={form.control} />
				<div>
					<SectionHeader
						title={defaultSchema?.name ?? "Env variables"}
						alignLeft
						subTitle="Following environmental variables will be injected into the container & these environmental variables will need to be referred from within your component source code in order to connect to the API service."
					/>
					<div className="grid gap-4">
						{defaultSchema?.entries?.map((item, index) => (
							<TextField
								key={item.name}
								label={
									<span className="flex items-center gap-1">
										{toSentenceCase(item.name)}
										<Codicon className="!text-sm opacity-70" title={item.description} name="info" />
									</span>
								}
								required
								name={`envNames.[${index}]`}
								placeholder={toUpperSnakeCase(item.name)}
								control={form.control}
							/>
						))}
					</div>
				</div>
				<div className="flex justify-end gap-3 pt-8 pb-4">
					<Button onClick={form.handleSubmit(onSubmit)} disabled={isCreatingConnection}>
						{isCreatingConnection ? "Creating..." : "Create"}
					</Button>
				</div>
			</form>
		</div>
	);
};
