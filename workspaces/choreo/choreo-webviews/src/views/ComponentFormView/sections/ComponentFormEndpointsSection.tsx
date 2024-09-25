/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMutation } from "@tanstack/react-query";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { EndpointType, type NewComponentWebviewProps } from "@wso2-enterprise/choreo-core";
import React, { type FC, type ReactNode } from "react";
import { type SubmitHandler, type UseFieldArrayAppend, type UseFieldArrayRemove, type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";
import type { z } from "zod";
import { Button } from "../../../components/Button";
import { Codicon } from "../../../components/Codicon";
import { Divider } from "../../../components/Divider";
import { Dropdown } from "../../../components/FormElements/Dropdown";
import { PathSelect } from "../../../components/FormElements/PathSelect";
import { TextField } from "../../../components/FormElements/TextField";
import { ChoreoWebViewAPI } from "../../../utilities/vscode-webview-rpc";
import { type componentEndpointItemSchema, type componentEndpointsFormSchema, sampleEndpointItem } from "../componentFormSchema";

type ComponentFormEndpointsType = z.infer<typeof componentEndpointsFormSchema>;
type ComponentFormEndpointItemType = z.infer<typeof componentEndpointItemSchema>;

interface Props extends NewComponentWebviewProps {
	componentName: string;
	compPath?: string;
	isSaving?: boolean;
	onNextClick: (data: ComponentFormEndpointsType) => void;
	onBackClick: () => void;
	form: UseFormReturn<ComponentFormEndpointsType>;
}

export const ComponentFormEndpointsSection: FC<Props> = ({ directoryName, componentName, onBackClick, onNextClick, compPath, isSaving, form }) => {
	const [endpointListRef] = useAutoAnimate();

	const watchedForm = useWatch({ control: form.control });

	const { fields: endpoints, append, remove } = useFieldArray({ name: "endpoints", control: form.control });

	const onSubmitForm: SubmitHandler<ComponentFormEndpointsType> = (data) => onNextClick(data);

	return (
		<div ref={endpointListRef}>
			{endpoints?.map((item, index) => (
				<ComponentEndpointItem
					key={item.id}
					append={append}
					remove={remove}
					directoryName={directoryName}
					endpoints={endpoints}
					form={form}
					index={index}
					item={{ ...watchedForm?.endpoints?.[index], id: item.id }}
					componentName={componentName}
					compPath={compPath}
				/>
			))}

			<div className="flex justify-end gap-3 pt-6 pb-2">
				<Button appearance="secondary" onClick={() => onBackClick()}>
					Back
				</Button>
				<Button onClick={form.handleSubmit(onSubmitForm)} disabled={isSaving}>
					{isSaving ? "Loading..." : "Next"}
				</Button>
			</div>
		</div>
	);
};

interface ComponentEndpointItemProps extends Pick<Props, "directoryName" | "componentName" | "compPath"> {
	item: ComponentFormEndpointItemType & { id: string };
	endpoints: ComponentFormEndpointItemType[];
	form: UseFormReturn<ComponentFormEndpointsType, any, undefined>;
	index: number;
	append: UseFieldArrayAppend<ComponentFormEndpointsType, "endpoints">;
	remove: UseFieldArrayRemove;
}

const ComponentEndpointItem: FC<ComponentEndpointItemProps> = ({
	item,
	endpoints,
	form,
	index,
	componentName,
	append,
	remove,
	directoryName,
	compPath,
}) => {
	const [endpointListItemRef] = useAutoAnimate();

	const { mutate: createNewOpenApiFile } = useMutation({
		mutationFn: async () => {
			return ChoreoWebViewAPI.getInstance().saveFile({
				baseDirectory: compPath,
				fileContent: sampleOpenAPIContent,
				fileName: "openapi.yaml",
				isOpenApiFile: true,
				successMessage: `A sample OpenAPI specification file has been created at ${compPath}`,
			});
		},
		onSuccess: async (createdPath) => {
			const subPath = await ChoreoWebViewAPI.getInstance().getSubPath({
				subPath: createdPath,
				parentPath: compPath,
			});
			form.setValue(`endpoints.${index}.schemaFilePath`, subPath, { shouldValidate: true });
		},
		onError: () => ChoreoWebViewAPI.getInstance().showErrorMsg("Failed to create openapi file"),
	});

	const { mutate: openSchemaFile } = useMutation({
		mutationFn: async () => {
			const filePath = await ChoreoWebViewAPI.getInstance().joinFilePaths([compPath, item.schemaFilePath]);
			return ChoreoWebViewAPI.getInstance().goToSource(filePath);
		},
		onError: () => {
			ChoreoWebViewAPI.getInstance().showErrorMsg("Failed to open schema path");
		},
	});

	const fields: ReactNode[] = [
		<TextField
			label="Endpoint Name"
			required
			key="ep-name"
			name={`endpoints.${index}.name`}
			placeholder="component-name"
			control={form.control}
			wrapClassName="col-span-2"
		/>,
		<TextField
			label="Port"
			required
			key="ep-port"
			name={`endpoints.${index}.port`}
			control={form.control}
			placeholder="8080"
			wrapClassName="col-span-2"
		/>,
		<Dropdown
			label="Type"
			required
			name={`endpoints.${index}.type`}
			key="ep-type"
			items={[
				{ value: EndpointType.REST },
				{ value: EndpointType.GraphQL },
				{ value: EndpointType.GRPC },
				{ value: EndpointType.TCP },
				{ value: EndpointType.UDP },
			]}
			control={form.control}
		/>,
		<Dropdown
			label="Visibility"
			required
			name={`endpoints.${index}.networkVisibility`}
			key="ep-visibility"
			items={[{ value: "Public" }, { value: "Organization" }, { value: "Project" }]}
			control={form.control}
		/>,
	];

	if (item.type === EndpointType.REST || item.type === EndpointType.GraphQL) {
		fields.push(
			<TextField
				label="Context (Base path of the API)"
				required
				name={`endpoints.${index}.context`}
				key="ep-context"
				placeholder="/"
				control={form.control}
				wrapClassName="col-span-2"
			/>,
		);
	}

	if (item.type === EndpointType.REST) {
		fields.push(
			<div key="ep-schema" className="col-span-2 md:col-span-4">
				<PathSelect
					name={`endpoints.${index}.schemaFilePath`}
					label="Schema File Path"
					required
					control={form.control}
					basePath={compPath}
					directoryName={directoryName}
					type="file"
					promptTitle="Select Schema File Path"
				/>
				<VSCodeLink
					className="mt-0.5 font-semibold text-[11px] text-vsc-foreground"
					onClick={item.schemaFilePath ? () => openSchemaFile() : () => createNewOpenApiFile()}
				>
					{item.schemaFilePath ? "Edit Schema File" : "Create new OpenAPI schema file"}
				</VSCodeLink>
			</div>,
		);
	}

	return (
		<div key={item.id}>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4" ref={endpointListItemRef}>
				{fields}
			</div>

			<div className="mt-4 flex flex-1 gap-3">
				{endpoints.length > 1 && (
					<Button appearance="icon" className="hover:text-vsc-errorForeground" onClick={() => remove(index)}>
						<Codicon name="trash" className="mr-1" />
						Remove
					</Button>
				)}
				{index === endpoints.length - 1 && (
					<Button
						appearance="icon"
						onClick={() => {
							let tempIndex = endpoints.length;
							while (endpoints.some((item) => item.name === `${componentName} ${tempIndex}`)) {
								tempIndex++;
							}
							append({ ...sampleEndpointItem, name: `${componentName} ${tempIndex}` });
						}}
					>
						<Codicon name="plus" className="mr-1" />
						Add Another
					</Button>
				)}
			</div>

			{endpoints.length > 1 && index < endpoints.length - 1 && <Divider className="mt-2 mb-6" />}
		</div>
	);
};

const sampleOpenAPIContent = `openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /example:
    get:
      summary: Retrieve an example resource
      responses:
        '200':
          description: Successful response
`;
