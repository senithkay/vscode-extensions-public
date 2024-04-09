import React, { FC, ReactNode, useEffect } from "react";
import { Divider } from "@wso2-enterprise/ui-toolkit";
import { TextField } from "../../Components/FormElements/TextField";
import { Dropdown } from "../../Components/FormElements/Dropdown";
import { DirectorySelect } from "../../Components/FormElements/DirectorySelect";

import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ChoreoBuildPackNames,
    ChoreoComponentType,
    NewComponentWebview,
    Organization,
    Project,
    WebAppSPATypes,
} from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@wso2-enterprise/ui-toolkit";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { WarningBanner } from "../../Components/Atoms/WarningBanner";

const componentFormSchema = z
    .object({
        projectName: z.string().min(1, "Required"),
        projectRegion: z.string().min(1, "Required"),
        name: z.string().min(1, "Required"),
        type: z.string().min(1, "Required"),
        buildPackLang: z.string().min(1, "Required"),
        subPath: z.string().min(1, "Required"),
        repoUrl: z.string().min(1, "Required"),
        branch: z.string().min(1, "Required"),
        langVersion: z.string(),
        dockerFile: z.string(),
        port: z.number({ coerce: true }),
        spaBuildCommand: z.string(),
        spaNodeVersion: z.string(),
        spaOutputDir: z.string(),
    })
    .partial()
    .superRefine((data, ctx) => {
        if (
            [
                ChoreoBuildPackNames.Ballerina,
                ChoreoBuildPackNames.MicroIntegrator,
                ChoreoBuildPackNames.StaticFiles,
            ].includes(data.buildPackLang as ChoreoBuildPackNames)
        ) {
            // do nothing
        } else if (data.buildPackLang === ChoreoBuildPackNames.Docker) {
            if (data?.dockerFile?.length === 0) {
                ctx.addIssue({ path: ["dockerFile"], code: z.ZodIssueCode.custom, message: `Required` });
            }
            if (data.type === ChoreoComponentType.WebApplication && !data.port) {
                ctx.addIssue({ path: ["port"], code: z.ZodIssueCode.custom, message: `Required` });
            }
        } else if (WebAppSPATypes.includes(data.buildPackLang as ChoreoBuildPackNames)) {
            if (!data.spaBuildCommand) {
                ctx.addIssue({ path: ["spaBuildCommand"], code: z.ZodIssueCode.custom, message: `Required` });
            }
            if (!data.spaNodeVersion) {
                ctx.addIssue({ path: ["spaNodeVersion"], code: z.ZodIssueCode.custom, message: `Required` });
            }
            if (!data.spaOutputDir) {
                ctx.addIssue({ path: ["spaOutputDir"], code: z.ZodIssueCode.custom, message: `Required` });
            }
        } else {
            // Build pack type
            if (!data.langVersion) {
                ctx.addIssue({ path: ["langVersion"], code: z.ZodIssueCode.custom, message: `Required` });
            }
            if (data.type === ChoreoComponentType.WebApplication && !data.port) {
                ctx.addIssue({ path: ["port"], code: z.ZodIssueCode.custom, message: `Required` });
            }
        }
    });

type ComponentFormType = z.infer<typeof componentFormSchema>;

export const ComponentFormView: FC<NewComponentWebview> = ({ project, organization, directoryPath, gitInstallUrl }) => {
    const form = useForm<ComponentFormType>({
        resolver: zodResolver(componentFormSchema),
        mode: "all",
        defaultValues: {
            projectName: project?.name ?? "",
            projectRegion: project?.region ?? "US",
            name: "",
            type: ChoreoComponentType.Service,
            buildPackLang: "",
            langVersion: "",
            subPath: ".",
            repoUrl: "",
            branch: "",
            dockerFile: "Dockerfile",
            port: 8080,
            spaBuildCommand: "npm run build",
            spaNodeVersion: "20.0.0",
            spaOutputDir: "build",
        },
    });

    const selectedType = form.watch("type");
    const selectedLang = form.watch("buildPackLang");
    const subPath = form.watch("subPath");
    const repoUrl = form.watch("repoUrl");

    const { isLoading: isLoadingBuildPacks, data: buildpacks = [] } = useQuery({
        queryKey: ["build-packs", { selectedType, orgId: organization?.id }],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getBuildPacks({
                componentType: selectedType,
                orgUuid: organization.uuid,
                orgId: organization.id.toString(),
            }),
        onSuccess: (buildpacks) => {
            if (!buildpacks.find((item) => item.language === form.getValues("buildPackLang"))) {
                form.setValue("buildPackLang", buildpacks[0].language);
                form.setValue("langVersion", "");
            }
        },
        refetchOnWindowFocus: false,
    });

    const { isLoading: isLoadingRemotes, data: gitRemotes = [] } = useQuery({
        queryKey: ["get-git-remotes", { subPath }],
        queryFn: () => ChoreoWebViewAPI.getInstance().getGitRemotes([directoryPath, subPath]),
        onSuccess: (remotes) => {
            if (remotes.length > 0 && !remotes.includes(form.getValues("repoUrl"))) {
                form.setValue("repoUrl", remotes[0]);
            }
        },
    });

    const { isLoading: isLoadingBranches, data: branches = [] } = useQuery({
        queryKey: ["get-git-branches", { repo: repoUrl, orgId: organization?.id }],
        queryFn: () =>
            ChoreoWebViewAPI.getInstance().getChoreoRpcClient().getRepoBranches({
                repoUrl,
                orgId: organization.id.toString(),
            }),
        onSuccess: (branches) => {
            if (!form.getValues("branch") || !branches.includes(form.getValues("branch"))) {
                if (branches.includes("main")) {
                    form.setValue("branch", "main");
                } else if (branches.includes("master")) {
                    form.setValue("branch", "master");
                } else {
                    form.setValue("branch", branches[0]);
                }
            }
        },
    });

    const { isLoading: isCheckingRepoAccess, data: hasRepoAccess } = useQuery({
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

    const openGitInstallUrl = () => ChoreoWebViewAPI.getInstance().openExternal(gitInstallUrl);

    const { mutate: createComponent, isLoading: isCreatingComponent } = useMutation({
        mutationFn: async (data: ComponentFormType) => {
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

            await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().createComponent({
                orgId: organization.id.toString(),
                projectHandle: selectedProject.handler,
                name: data.name,
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
            });

            await ChoreoWebViewAPI.getInstance().getChoreoRpcClient().createComponentLink({
                projectHandle: selectedProject.handler,
                orgHandle: organization.handle,
                componentHandle: data.name,
                componentDir,
            });
        },
        onSuccess: (_, data) => {
            ChoreoWebViewAPI.getInstance().showInfoMsg(`Component ${data.name} has been successfully created`);
            ChoreoWebViewAPI.getInstance().refreshLinkedDirState();
            ChoreoWebViewAPI.getInstance().closeWebView();
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

        if (selectedType === ChoreoComponentType.WebApplication) {
            additionalConfigs.push(
                <TextField label="Port" required name="port" control={form.control} placeholder="8080" />
            );
        }
    }

    const showRequireRepoAccess = repoUrl && !isCheckingRepoAccess && !hasRepoAccess;

    return (
        <div className="flex flex-row justify-center p-6">
            <div className="container">
                <form className="mx-auto max-w-4xl flex flex-col gap-2 p-4">
                    {!project && (
                        <>
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
                        {showRequireRepoAccess && (
                            <WarningBanner className="col-span-full">
                                <span className="text-vsc-inputValidation-warningForeground">
                                    Choreo lacks access to this repository. To grant access, please visit{" "}
                                    <VSCodeLink onClick={openGitInstallUrl}>{gitInstallUrl}</VSCodeLink>
                                </span>
                            </WarningBanner>
                        )}
                        <Dropdown
                            label="Branch"
                            required
                            name="branch"
                            control={form.control}
                            items={branches}
                            disabled={branches?.length === 0 || !hasRepoAccess}
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
                            tooltip={
                                showRequireRepoAccess ? "Access to selected repository is required to proceed" : ""
                            }
                            disabled={showRequireRepoAccess || isCreatingComponent}
                        >
                            {isCreatingComponent ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
