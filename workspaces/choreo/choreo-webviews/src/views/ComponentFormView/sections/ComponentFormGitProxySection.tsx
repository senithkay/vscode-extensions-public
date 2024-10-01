/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import type { NewComponentWebviewProps } from "@wso2-enterprise/choreo-core";
import React, { type FC } from "react";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { Button } from "../../../components/Button";
import { Dropdown } from "../../../components/FormElements/Dropdown";
import { PathSelect } from "../../../components/FormElements/PathSelect";
import { TextField } from "../../../components/FormElements/TextField";
import { useCreateNewOpenApiFile, useGoToSource } from "../../../hooks/use-queries";
import type { componentGitProxyFormSchema } from "../componentFormSchema";

type ComponentFormGitProxyType = z.infer<typeof componentGitProxyFormSchema>;

interface Props extends NewComponentWebviewProps {
	isSaving?: boolean;
	compPath?: string;
	onNextClick: (data: ComponentFormGitProxyType) => void;
	onBackClick: () => void;
	form: UseFormReturn<ComponentFormGitProxyType>;
}

export const ComponentFormGitProxySection: FC<Props> = ({ onBackClick, onNextClick, isSaving, form, compPath }) => {
	const [proxyDetailsSections] = useAutoAnimate();

	const onSubmitForm: SubmitHandler<ComponentFormGitProxyType> = (data) => onNextClick(data);

	const proxyType = form.watch("componentConfig.type");
	const schemaFilePath = form.watch("componentConfig.schemaFilePath");

	const { openFile } = useGoToSource();

	const { createNewOpenApiFile } = useCreateNewOpenApiFile({
		compPath,
		onSuccess: (subPath) => form.setValue("componentConfig.schemaFilePath", subPath, { shouldValidate: true }),
	});

	return (
		<>
			<div className="col-span-2 grid gap-4 md:col-span-4" ref={proxyDetailsSections}>
				<TextField
					label="Target URL"
					required
					name="proxyTargetUrl"
					placeholder="https://www.target-url.com"
					control={form.control}
					wrapClassName="col-span-2"
				/>
				<TextField label="API Context" required name="proxyContext" placeholder="/base-path" control={form.control} wrapClassName="col-span-2" />
				<TextField label="Version" required name="proxyVersion" placeholder="v1.0" control={form.control} wrapClassName="col-span-2" />
				<Dropdown
					label="Type"
					required
					name="componentConfig.type"
					items={[{ value: "REST" }, { value: "GraphQL" }, { value: "WS" }]}
					control={form.control}
				/>
				<Dropdown
					label="Visibility"
					required
					name="componentConfig.networkVisibility"
					items={[{ value: "Public" }, { value: "Organization" }]}
					control={form.control}
				/>
				{proxyType === "REST" && (
					<div key="proxy-schema" className="col-span-2 md:col-span-4">
						<PathSelect
							name="componentConfig.schemaFilePath"
							label="Schema File Path"
							required
							control={form.control}
							basePath={compPath}
							type="file"
							promptTitle="Select Schema File Path"
						/>
						{schemaFilePath && (
							<VSCodeLink className="mt-0.5 font-semibold text-[11px] text-vsc-foreground" onClick={() => openFile([compPath, schemaFilePath])}>
								Edit Schema File
							</VSCodeLink>
						)}

						{!schemaFilePath && proxyType === "REST" && (
							<VSCodeLink className="mt-0.5 font-semibold text-[11px] text-vsc-foreground" onClick={() => createNewOpenApiFile()}>
								Create new OpenAPI schema file
							</VSCodeLink>
						)}
					</div>
				)}
				<PathSelect
					name="componentConfig.docPath"
					label="Documentation File Path"
					control={form.control}
					basePath={compPath}
					type="file"
					promptTitle="Select Documentation File Path"
					wrapClassName="col-span-2"
				/>
				<PathSelect
					name="componentConfig.thumbnailPath"
					label="Thumbnail File Path"
					control={form.control}
					basePath={compPath}
					type="file"
					promptTitle="Select Thumbnail File Path"
					wrapClassName="col-span-2"
				/>
			</div>

			<div className="flex justify-end gap-3 pt-6 pb-2">
				<Button appearance="secondary" onClick={() => onBackClick()}>
					Back
				</Button>
				<Button onClick={form.handleSubmit(onSubmitForm)} disabled={isSaving}>
					{isSaving ? "Loading..." : "Next"}
				</Button>
			</div>
		</>
	);
};
