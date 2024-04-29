import React, { FC, ReactNode, useEffect } from "react";
import { TextField } from "../../components/FormElements/TextField";
import { Dropdown } from "../../components/FormElements/Dropdown";
import { DirectorySelect } from "../../components/FormElements/DirectorySelect";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ChoreoBuildPackNames,
    ChoreoComponentType,
    NewComponentWebviewProps,
    SubmitComponentCreateReq,
    WebAppSPATypes,
} from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { Banner } from "../../components/Banner";
import { componentFormSchema } from "./componentFormSchema";
import { Button } from "../../components/Button";
import { makeURLSafe } from "../../utilities/helpers";
import { Codicon } from "../../components/Codicon";
import { Divider } from "../../components/Divider";
import { useAutoAnimate } from "@formkit/auto-animate/react";

type ComponentFormType = z.infer<typeof componentFormSchema>;

export const ComponentFormView: FC<NewComponentWebviewProps> = ({
    project,
    organization,
    directoryPath,
    directoryFsPath,
    directoryName,
    initialValues,
}) => {
    const [formSections] = useAutoAnimate({ duration: 100 });
    const [compDetailsSections] = useAutoAnimate({ duration: 100 });
    const [sourceDetailsSections] = useAutoAnimate({ duration: 100 });
    const [buildConfigSections] = useAutoAnimate({ duration: 100 });

    const form = useForm<ComponentFormType>({
        resolver: zodResolver(componentFormSchema),
        mode: "all",
        defaultValues: {
            name: "",
            type: initialValues?.type ?? "",
            buildPackLang: initialValues?.buildPackLang ?? "",
            langVersion: "",
            subPath: initialValues?.subPath ?? ".",
            repoUrl: "",
            branch: "",
            dockerFile: "Dockerfile",
            port: 8080,
            visibility: "Public",
            spaBuildCommand: "npm run build",
            spaNodeVersion: "20.0.0",
            spaOutputDir: "build",
        },
    });

    const name = form.watch("name");
    const selectedType = form.watch("type");
    const selectedLang = form.watch("buildPackLang");
    const subPath = form.watch("subPath");
    const repoUrl = form.watch("repoUrl");
    const port = form.watch("port");

    const { data: hasEndpoints } = useQuery({
        queryKey: ["directory-has-endpoints", { directoryPath, subPath }],
        queryFn: async () => {
            const compPath = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryFsPath, subPath]);
            return ChoreoWebViewAPI.getInstance().readServiceEndpoints(compPath);
        },
        select: (resp) => resp?.endpoints?.length > 0,
        enabled: selectedType === ChoreoComponentType.Service,
    });

    const { isLoading: isLoadingBuildPacks, data: buildpacks = [] } = useQuery({
        queryKey: ["build-packs", { selectedType, orgId: organization?.id }],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getBuildPacks({
                componentType: selectedType,
                orgUuid: organization.uuid,
                orgId: organization.id.toString(),
            }),
        onSuccess: (buildpacks = []) => {
            if (
                form.getValues("buildPackLang") &&
                buildpacks.length > 0 &&
                !buildpacks.find((item) => item.language === form.getValues("buildPackLang"))
            ) {
                // Reset build pack selection if its invalid
                form.setValue("buildPackLang", "");
                form.setValue("langVersion", "");
            }
        },
        refetchOnWindowFocus: false,
        enabled: !!selectedType,
    });

    const { isLoading: isLoadingRemotes, data: gitRemotes = [] } = useQuery({
        queryKey: ["get-git-remotes", { directoryFsPath, subPath }],
        queryFn: () => ChoreoWebViewAPI.getInstance().getGitRemotes([directoryFsPath, subPath]),
    });

    useEffect(() => {
        if (gitRemotes.length > 0 && !gitRemotes.includes(form.getValues("repoUrl"))) {
            form.setValue("repoUrl", gitRemotes[0]);
        }
    }, [form, gitRemotes]);

    const { isLoading: isLoadingBranches, data: branches = [] } = useQuery({
        queryKey: ["get-git-branches", { repo: repoUrl, orgId: organization?.id }],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getRepoBranches({
                repoUrl,
                orgId: organization.id.toString(),
            }),
        refetchOnWindowFocus: false,
        enabled: !!repoUrl,
    });

    useEffect(() => {
        if (branches.length > 0 && (!form.getValues("branch") || !branches.includes(form.getValues("branch")))) {
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
    });

    const { data: components = [] } = useQuery({
        queryKey: ["project-components", { project: project.handler, orgId: organization.id }],
        queryFn: async () =>
            ChoreoWebViewAPI.getInstance()
                .getChoreoRpcClient()
                .getComponentList({ orgId: organization.id.toString(), projectHandle: project.handler }),
        refetchOnWindowFocus: false,
    });

    const selectedBuildPack = buildpacks?.find((item) => item.language === selectedLang);

    const supportedVersions: string[] = selectedBuildPack?.supportedVersions?.split(",")?.reverse() ?? [];

    useEffect(
        () => form.setValue("langVersion", supportedVersions[0] ?? "", { shouldValidate: !!supportedVersions[0] }),
        [supportedVersions]
    );

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
                createCompCommandParams.endpoint = { port: data.port, networkVisibility: data.visibility };
            }

            const created = await ChoreoWebViewAPI.getInstance().submitComponentCreate(createCompCommandParams);

            if (created) {
                ChoreoWebViewAPI.getInstance().closeWebView();
            }
        },
    });

    const onSubmit: SubmitHandler<ComponentFormType> = (data) => {
        const hasDuplicateName = components.some((item) => item.metadata.name === makeURLSafe(name))
        const needPort = !hasEndpoints && !port
        if (hasDuplicateName) {
            form.setError("name", { message: "Name already exists" });
        }
        if (needPort) {
            form.setError("port", { message: "Required" });
        }

        if (!hasDuplicateName && !needPort) {
            createComponent(data);
        }
    };

    const buildConfigs: ReactNode[] = [];
    if (
        [
            ChoreoBuildPackNames.Ballerina,
            ChoreoBuildPackNames.MicroIntegrator,
            ChoreoBuildPackNames.StaticFiles,
        ].includes(selectedLang as ChoreoBuildPackNames)
    ) {
        // do nothing
    } else if (selectedLang === ChoreoBuildPackNames.Docker) {
        buildConfigs.push(
            <TextField label="Dockerfile path" key="docker-path" required name="dockerFile" control={form.control} />
        );
        if (selectedType === ChoreoComponentType.WebApplication) {
            buildConfigs.push(<TextField label="Port" key="port" required name="port" control={form.control} />);
        }
    } else if (WebAppSPATypes.includes(selectedLang as ChoreoBuildPackNames)) {
        buildConfigs.push(
            <TextField
                label="Node Version"
                key="node-version"
                required
                name="spaNodeVersion"
                control={form.control}
                placeholder="20.0.0"
            />
        );
        buildConfigs.push(
            <TextField
                label="Build Command"
                key="build-command"
                required
                name="spaBuildCommand"
                control={form.control}
                placeholder="npm run build"
            />
        );
        buildConfigs.push(
            <TextField
                label="Build Output Directory"
                key="spa-out-dir"
                required
                name="spaOutputDir"
                control={form.control}
                placeholder="build"
            />
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
            />
        );

        if (selectedType === ChoreoComponentType.WebApplication) {
            buildConfigs.push(
                <TextField label="Port" key="port" required name="port" control={form.control} placeholder="8080" />
            );
        }
    }

    const endpointConfigs: ReactNode[] = [];
    if (selectedType === ChoreoComponentType.Service && !hasEndpoints) {
        endpointConfigs.push(<TextField label="Port" required name="port" control={form.control} placeholder="8080" />);
        endpointConfigs.push(
            <Dropdown
                label="Visibility"
                key="visibility"
                required
                name="visibility"
                items={["Public", "Organization", "Project"]}
                control={form.control}
            />
        );
    }

    let invalidRepoMsg: ReactNode = "";
    if (!isLoadingRemotes && gitRemotes?.length === 0) {
        invalidRepoMsg = "The selected repository does not contain any Git remotes";
    } else if (repoUrl && !isCheckingRepoAccess && !isRepoAuthorizedResp?.isAccessible) {
        invalidRepoMsg = (
            <div className="flex items-center">
                <div className="flex-1">
                    {isRepoAuthorizedResp?.retrievedRepos
                        ? "Choreo lacks access to this repository. Please grant access by clicking"
                        : "Please authorize Choreo to access your GitHub repositories by clicking"}{" "}
                    <VSCodeLink
                        className="text-vsc-list-warningForeground font-bold"
                        onClick={
                            isRepoAuthorizedResp?.retrievedRepos
                                ? () =>
                                      ChoreoWebViewAPI.getInstance().triggerGithubInstallFlow(
                                          organization.id?.toString()
                                      )
                                : () =>
                                      ChoreoWebViewAPI.getInstance().triggerGithubAuthFlow(organization.id?.toString())
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

    // TODO: add visibility (internal/external) for webhooks

    return (
        <div className="flex flex-row justify-center p-1 md:p-3 lg:p-4 xl:p-6">
            <div className="container">
                <form className="mx-auto max-w-4xl flex flex-col gap-2 p-4">
                    <div className="flex flex-col gap-1 mb-3">
                        <h1 className="text-sm text-right">
                            <span className="font-extralight">Organization: </span>
                            {organization.name}
                        </h1>
                        <h1 className="text-sm text-right">
                            <span className="font-extralight">Project: </span>
                            {project.name}
                        </h1>
                    </div>

                    <div className="flex flex-col gap-6" ref={formSections}>
                        <div>
                            <FormSectionHeader title="Component Details" />
                            <div className="grid md:grid-cols-2 gap-4" ref={compDetailsSections}>
                                <TextField
                                    label="Name"
                                    required
                                    name="name"
                                    placeholder="component-name"
                                    control={form.control}
                                />
                                <Dropdown
                                    label="Type"
                                    required
                                    name="type"
                                    items={[
                                        { label: "Service", value: ChoreoComponentType.Service },
                                        // TODO: add back after fixing deployment
                                        // { label: "Scheduled Task", value: ChoreoComponentType.ScheduledTask },
                                        { label: "Manual Trigger", value: ChoreoComponentType.ManualTrigger },
                                        { label: "Web Application", value: ChoreoComponentType.WebApplication },
                                        { label: "Webhook", value: ChoreoComponentType.Webhook },
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
                                        loading={isLoadingBuildPacks && !!selectedType}
                                        disabled={buildpacks.length === 0}
                                    />
                                )}
                            </div>
                        </div>
                        <div>
                            <FormSectionHeader title="Component Source" />
                            <div className="grid md:grid-cols-2 gap-4">
                                <DirectorySelect
                                    name="subPath"
                                    label="Directory"
                                    required
                                    control={form.control}
                                    basePath={directoryPath}
                                    directoryName={directoryName}
                                    wrapClassName="col-span-full"
                                />
                                <div className="grid md:grid-cols-2 gap-4 col-span-full" ref={sourceDetailsSections}>
                                    <Dropdown
                                        label="Repository"
                                        required
                                        name="repoUrl"
                                        control={form.control}
                                        items={gitRemotes}
                                        disabled={gitRemotes?.length === 0}
                                        loading={isLoadingRemotes}
                                    />
                                    {invalidRepoMsg && (
                                        <Banner type="warning" className="col-span-full md:order-last">
                                            {invalidRepoMsg}
                                        </Banner>
                                    )}
                                    {repoUrl && (
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
                                <div className="grid md:grid-cols-2 gap-4" ref={buildConfigSections}>
                                    {buildConfigs}
                                </div>
                            </div>
                        )}
                        {endpointConfigs.length > 0 && (
                            <div>
                                <FormSectionHeader title="Endpoint Configurations" />
                                <div className="grid md:grid-cols-2 gap-4">{endpointConfigs}</div>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 justify-end pt-6 pb-4">
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
        <div className="flex items-center sm:gap-4 gap-2 mb-2">
            <h1 className="text-lg opacity-50">{title}</h1>
            <Divider className="flex-1" />
        </div>
    );
};
