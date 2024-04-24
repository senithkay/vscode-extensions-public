import { z } from "zod";
import { ChoreoBuildPackNames, ChoreoComponentType, WebAppSPATypes } from "@wso2-enterprise/choreo-core";

export const componentFormSchema = z
    .object({
        name: z.string().min(1, "Required"),
        type: z.string().min(1, "Required"),
        buildPackLang: z.string().min(1, "Required"),
        subPath: z.string().min(1, "Required"),
        repoUrl: z.string().min(1, "Required"),
        branch: z.string().min(1, "Required"),
        langVersion: z.string(),
        dockerFile: z.string(),
        port: z.number({ coerce: true }),
        visibility: z.string(),
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
