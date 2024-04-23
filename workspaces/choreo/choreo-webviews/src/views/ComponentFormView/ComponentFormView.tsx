import React, { FC, ReactNode, useEffect } from "react";
import { Divider } from "@wso2-enterprise/ui-toolkit";
import { TextField } from "../../components/FormElements/TextField";
import { Dropdown } from "../../components/FormElements/Dropdown";
import { DirectorySelect } from "../../components/FormElements/DirectorySelect";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ChoreoBuildPackNames,
    ChoreoComponentType,
    CommandIds,
    ICreateComponentParams,
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

type ComponentFormType = z.infer<typeof componentFormSchema>;

export const ComponentFormView: FC<NewComponentWebviewProps> = ({ project, organization, directoryPath, initialValues }) => {
    const form = useForm<ComponentFormType>({
        resolver: zodResolver(componentFormSchema),
        mode: "all",
        defaultValues: {
            projectName: project?.name ?? "",
            projectRegion: project?.region ?? "US",
            name: "",
            type: initialValues?.type ?? ChoreoComponentType.Service,
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

    const selectedType = form.watch("type");
    const selectedLang = form.watch("buildPackLang");
    const subPath = form.watch("subPath");
    const repoUrl = form.watch("repoUrl");
    const port = form.watch("port");

    const { data: hasEndpoints } = useQuery({
        queryKey: ["directory-has-endpoints", { directoryPath, subPath }],
        queryFn: async () => {
            const compPath = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryPath, subPath]);
            return ChoreoWebViewAPI.getInstance().readServiceEndpoints(compPath);
        },
        select: (resp) =>
            resp?.endpoints?.length > 0 ||
            [ChoreoBuildPackNames.Ballerina, ChoreoBuildPackNames.MicroIntegrator].includes(
                selectedLang as ChoreoBuildPackNames
            ),
        enabled: selectedType === ChoreoComponentType.Service,
    });

    useEffect(() => {
        if (!hasEndpoints && !port) {
            form.setError("port", { message: "Required" });
        }
    }, [port, hasEndpoints]);

    const { isLoading: isLoadingBuildPacks, data: buildpacks = [] } = useQuery({
        queryKey: ["build-packs", { selectedType, orgId: organization?.id }],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getBuildPacks({
                componentType: selectedType,
                orgUuid: organization.uuid,
                orgId: organization.id.toString(),
            }),
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (buildpacks.length > 0 && !buildpacks.find((item) => item.language === form.getValues("buildPackLang"))) {
            form.setValue("buildPackLang", buildpacks[0]?.language ?? "");
            form.setValue("langVersion", "");
        }
    }, [form, buildpacks]);

    const { isLoading: isLoadingRemotes, data: gitRemotes = [] } = useQuery({
        queryKey: ["get-git-remotes", { subPath }],
        queryFn: () => ChoreoWebViewAPI.getInstance().getGitRemotes([directoryPath, subPath]),
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
    });

    useEffect(() => {
        if (!form.getValues("branch") || !branches.includes(form.getValues("branch"))) {
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

            let selectedProject = project;
            if (!selectedProject) {
                selectedProject = await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().createProject({
                    orgHandler: organization.handle,
                    orgId: organization.id.toString(),
                    projectName: data.projectName,
                    region: data.projectRegion,
                });
            }

            const componentDir = await ChoreoWebViewAPI.getInstance().joinFilePaths([directoryPath, data.subPath]);

            const createCompCommandParams: SubmitComponentCreateReq = {
                org: organization,
                project: selectedProject,
                createParams: {
                    orgId: organization.id.toString(),
                    projectHandle: selectedProject.handler,
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
        onError: (err: any) => {
            console.error("Component create failed", err);
            ChoreoWebViewAPI.getInstance().showErrorMsg(`Failed to create component. Cause: ${err.message}`);
        },
    });

    const onSubmit: SubmitHandler<ComponentFormType> = (data) => createComponent(data);

    const additionalConfigs: ReactNode[] = [];

    if (
        [
            ChoreoBuildPackNames.Ballerina,
            ChoreoBuildPackNames.MicroIntegrator,
            ChoreoBuildPackNames.StaticFiles,
        ].includes(selectedLang as ChoreoBuildPackNames)
    ) {
        // do nothing
    } else if (selectedLang === ChoreoBuildPackNames.Docker) {
        additionalConfigs.push(<TextField label="Dockerfile path" required name="dockerFile" control={form.control} />);
        if (selectedType === ChoreoComponentType.WebApplication) {
            additionalConfigs.push(<TextField label="Port" required name="port" control={form.control} />);
        }
    } else if (WebAppSPATypes.includes(selectedLang as ChoreoBuildPackNames)) {
        additionalConfigs.push(
            <TextField
                label="Node Version"
                required
                name="spaNodeVersion"
                control={form.control}
                placeholder="20.0.0"
            />
        );
        additionalConfigs.push(
            <TextField
                label="Build Command"
                required
                name="spaBuildCommand"
                control={form.control}
                placeholder="npm run build"
            />
        );
        additionalConfigs.push(
            <TextField
                label="Build Output Directory"
                required
                name="spaOutputDir"
                control={form.control}
                placeholder="build"
            />
        );
    } else {
        // Build pack type
        additionalConfigs.push(
            <Dropdown
                label="Language Version"
                required
                name="langVersion"
                control={form.control}
                items={supportedVersions}
                disabled={supportedVersions?.length === 0}
            />
        );

        if (selectedType === ChoreoComponentType.Service && !hasEndpoints) {
            additionalConfigs.push(
                <TextField label="Port" required name="port" control={form.control} placeholder="8080" />
            );
            additionalConfigs.push(
                <Dropdown
                    label="Visibility"
                    required
                    name="visibility"
                    items={["Public", "Organization", "Project"]}
                    control={form.control}
                />
            );
        } else if (selectedType === ChoreoComponentType.WebApplication) {
            additionalConfigs.push(
                <TextField label="Port" required name="port" control={form.control} placeholder="8080" />
            );
        }
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
                    . {isRepoAuthorizedResp?.retrievedRepos ? "(Only public repos are allowed for the free tier.)" : ""}
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
                    {!project ? (
                        <>
                            <h1 className="text-sm text-right mb-3">
                                <span className="font-extralight">Organization: </span>
                                {organization.name}
                            </h1>
                            <h1 className="text-xl font-bold">Project Details</h1>
                            <Divider />
                            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
                                <TextField
                                    label="Name"
                                    required
                                    name="projectName"
                                    placeholder="project-name"
                                    control={form.control}
                                />
                                <Dropdown
                                    label="Region"
                                    required
                                    name="projectRegion"
                                    control={form.control}
                                    items={["US", "EU"]}
                                />
                            </div>
                        </>
                    ) : (
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
                    )}

                    <h1 className="text-xl font-bold">Component Details</h1>
                    <Divider />
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        <TextField
                            label="Name"
                            required
                            name="name"
                            placeholder="component-name"
                            control={form.control}
                        />
                        <DirectorySelect
                            name="subPath"
                            label="Directory"
                            required
                            control={form.control}
                            basePath={directoryPath}
                        />
                        <Dropdown
                            label="Repository"
                            required
                            name="repoUrl"
                            control={form.control}
                            items={gitRemotes}
                            disabled={gitRemotes?.length === 0}
                            loading={isLoadingRemotes}
                            wrapClassName="col-span-full"
                        />
                        {invalidRepoMsg && (
                            <Banner type="warning" className="col-span-full">
                                {invalidRepoMsg}
                            </Banner>
                        )}
                        <Dropdown
                            label="Branch"
                            required
                            name="branch"
                            control={form.control}
                            items={branches}
                            disabled={branches?.length === 0 || !isRepoAuthorizedResp?.isAccessible}
                            loading={isLoadingBranches}
                        />
                        <Dropdown
                            label="Type"
                            required
                            name="type"
                            items={[
                                { label: "Service", value: ChoreoComponentType.Service },
                                { label: "Scheduled Task", value: ChoreoComponentType.ScheduledTask },
                                { label: "Manual Trigger", value: ChoreoComponentType.ManualTrigger },
                                { label: "Web Application", value: ChoreoComponentType.WebApplication },
                                { label: "Webhook", value: ChoreoComponentType.Webhook },
                            ]}
                            control={form.control}
                        />
                        <Dropdown
                            label="Build Pack"
                            required
                            name="buildPackLang"
                            control={form.control}
                            items={buildpacks?.map((item) => ({ label: item.displayName, value: item.language }))}
                            loading={isLoadingBuildPacks}
                        />
                        {...additionalConfigs}
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
