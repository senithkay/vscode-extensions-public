/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { TestWebviewProps } from "@wso2-enterprise/choreo-core";
import classNames from "classnames";
import clipboardy from "clipboardy";
import React, { type FC, useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Banner } from "../../components/Banner";
import { Button } from "../../components/Button";
import { Codicon } from "../../components/Codicon";
import { Dropdown } from "../../components/FormElements/Dropdown";
import { FormElementWrap } from "../../components/FormElements/FormElementWrap";
import { HeaderSection } from "../../components/HeaderSection";
import { SkeletonText } from "../../components/SkeletonText";
import { SwaggerUI } from "../../components/SwaggerUI";
import { SwaggerUISkeleton } from "../../components/SwaggerUI/SwaggerUI";
import { useGetSwaggerSpec, useGetTestKey } from "../../hooks/use-queries";
import { ChoreoWebViewAPI } from "../../utilities/vscode-webview-rpc";

const MAX_RESPONSE_SIZE = 4 * 1024 * 1024;

interface SwaggerSecuritySchemasValue {
	type: string;
	name: string;
	in: string;
	scheme?: string;
	bearerFormat?: string;
}

interface SwaggerSecuritySchemas {
	key: string;
	value: SwaggerSecuritySchemasValue;
}

const serviceTestSchema = z.object({
	endpoint: z.string().min(1, "Required"),
});

type serviceTestType = z.infer<typeof serviceTestSchema>;

const disableAuthorizeAndInfoPluginDefaultSecuritySchema = {
	statePlugins: {
		spec: {
			wrapSelectors: {
				servers: () => (): any[] => [],
				securityDefinitions: () => (): any => null,
				schemes: () => (): any[] => [],
			},
		},
	},
	wrapComponents: { info: () => (): any => null, authorizeBtn: () => (): any => null },
};

const disableAuthorizeAndInfoPluginCustomSecuritySchema = {
	statePlugins: { spec: { wrapSelectors: { servers: () => (): any[] => [], schemes: () => (): any[] => [] } } },
	wrapComponents: { info: () => (): any => null },
};

export const ComponentTestView: FC<TestWebviewProps> = ({ env, choreoEnv, component, org, project, deploymentTrack, endpoints }) => {
	const INTERNAL_KEY_HEADER_NAME = choreoEnv === "prod" ? "api-key" : "test-key";
	const [refetchInterval, setRefetchInterval] = useState(10 * 60 * 1000);
	const [isRefreshPressed, setIsRefreshPressed] = useState(false);

	const form = useForm<serviceTestType>({
		resolver: zodResolver(serviceTestSchema),
		mode: "all",
		defaultValues: { endpoint: endpoints[0]?.id || "" },
	});

	const selectedEndpointId = form.watch("endpoint");

	const selectedEndpoint = endpoints.find((item) => item.id === selectedEndpointId);

	const { mutate: copyUrl } = useMutation({
		mutationFn: (params: { value: string; label: string }) => clipboardy.write(params.value),
		onSuccess: (_, params) => ChoreoWebViewAPI.getInstance().showInfoMsg(`${params.label} has been copied to the clipboard.`),
	});

	const {
		data: testKeyResp,
		refetch: refetchTestKey,
		isLoading: isLoadingTestKey,
		isFetching: isFetchingTestKey,
	} = useGetTestKey(selectedEndpoint, env, org, {
		enabled: !!selectedEndpoint,
		refetchInterval: refetchInterval - 15000, // Refetch every 10 minutes minus 15 seconds
		cacheTime: 0,
		refetchOnWindowFocus: true,
		onSuccess: (data) => {
			setRefetchInterval(data.validityTime * 1000);
			setIsRefreshPressed(false);
		},
	});

	const { data: swaggerSpec, isLoading: isLoadingSwagger } = useGetSwaggerSpec(selectedEndpoint, org, {
		enabled: !!selectedEndpoint,
	});

	const securitySchemas = useMemo(() => {
		if (swaggerSpec && (swaggerSpec as any)?.components?.securitySchemes) {
			const securitySchemasArray: SwaggerSecuritySchemas[] = [];
			Object.keys((swaggerSpec as any).components.securitySchemes).forEach((key) => {
				securitySchemasArray.push({ key, value: (swaggerSpec as any).components.securitySchemes[key] });
			});
			return securitySchemasArray;
		}
		return null;
	}, [swaggerSpec]);

	const getDisableAuthorizeAndInfoPlugin = () => {
		if (securitySchemas && securitySchemas.length > 1) {
			return [disableAuthorizeAndInfoPluginCustomSecuritySchema];
		}
		return [disableAuthorizeAndInfoPluginDefaultSecuritySchema];
	};

	const swaggerObj = useMemo(() => {
		let newSwaggerObj: any = null;
		if (swaggerSpec && Object.keys(swaggerSpec as any).length > 0 && selectedEndpoint?.publicUrl) {
			newSwaggerObj = swaggerSpec;
			// Checking if OpenAPI spec is 2.0 or 3.0
			if (newSwaggerObj.swagger?.startsWith("2")) {
				newSwaggerObj = {
					...newSwaggerObj,
					host: selectedEndpoint?.publicUrl.substring(8),
					basePath: selectedEndpoint?.publicUrl.slice(-1) === "/" ? "" : "/",
				};
			} else if (newSwaggerObj.openapi?.startsWith("3")) {
				newSwaggerObj = { ...newSwaggerObj, servers: [{ url: selectedEndpoint?.publicUrl }] };
			}
		}
		return newSwaggerObj;
	}, [swaggerSpec, selectedEndpoint]);

	const requestInterceptor = (req: any) => {
		req.headers[INTERNAL_KEY_HEADER_NAME] = testKeyResp?.apiKey;
		const { url } = req;
		req.url = url.replace("/*", "");
		return req;
	};

	const responseInterceptor = (response: any) => {
		if (response.status >= 200 && response.status < 300) {
			const responsePayload = response.data;
			const responseSize = new Blob([responsePayload]).size;
			if (responseSize > MAX_RESPONSE_SIZE) {
				return { ...response, text: "Response is too large to render" };
			}
		}
		return response;
	};

	const headerLabels: { label: string; value: string }[] = [
		{ label: "Component", value: component.metadata.displayName },
		{ label: "Deployment Track", value: deploymentTrack.branch },
		{ label: "Project", value: project.name },
		{ label: "Organization", value: org.name },
	];

	return (
		<div className="flex flex-row justify-center p-1 md:p-3 lg:p-4 xl:p-6">
			<div className="container">
				<div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
					<HeaderSection title={`${env.name} Environment`} tags={headerLabels} />
					{endpoints.length > 1 && (
						<Dropdown
							wrapClassName="max-w-xs"
							label="Endpoint"
							required
							name="endpoint"
							items={endpoints.map((item) => ({ label: item.displayName, value: item.id }))}
							control={form.control}
						/>
					)}
					<FormElementWrap label="Invoke URL" wrapClassName="max-w-sm">
						<div className="flex items-center gap-2">
							<span className="line-clamp-1 break-all">{selectedEndpoint?.publicUrl}</span>
							<Button appearance="icon" onClick={() => copyUrl({ value: selectedEndpoint?.publicUrl, label: "Invocation URL" })}>
								<Codicon name="chrome-restore" className="mr-1" /> Copy
							</Button>
						</div>
					</FormElementWrap>
					<FormElementWrap label="Security Header" wrapClassName="max-w-md">
						<div className="flex items-center gap-2">
							{isLoadingTestKey || !testKeyResp?.apiKey ? (
								<SkeletonText className="w-full max-w-72" />
							) : (
								<span className="line-clamp-1 text-clip">{testKeyResp?.apiKey?.replace(/./g, "*")}</span>
							)}
							<Button
								disabled={isLoadingTestKey || !testKeyResp?.apiKey}
								appearance="icon"
								onClick={() => copyUrl({ value: testKeyResp?.apiKey, label: "Security Header" })}
							>
								<Codicon name="chrome-restore" className="mr-1" /> Copy
							</Button>
							<Button
								appearance="icon"
								disabled={isFetchingTestKey}
								onClick={() => {
									refetchTestKey();
									setIsRefreshPressed(true);
								}}
							>
								<Codicon name="refresh" className={classNames("mr-1", isFetchingTestKey && "animate-spin")} /> Regenerate
							</Button>
						</div>
					</FormElementWrap>
					{(isLoadingSwagger || isLoadingTestKey) && <SwaggerUISkeleton />}
					{swaggerObj && !isLoadingTestKey && testKeyResp?.apiKey && !isRefreshPressed && (
						<SwaggerUI
							spec={swaggerObj}
							requestInterceptor={requestInterceptor}
							responseInterceptor={responseInterceptor}
							plugins={getDisableAuthorizeAndInfoPlugin()}
							defaultModelExpandDepth={-1}
							docExpansion="list"
							tryItOutEnabled={!isLoadingTestKey}
						/>
					)}
				</div>
			</div>
		</div>
	);
};
