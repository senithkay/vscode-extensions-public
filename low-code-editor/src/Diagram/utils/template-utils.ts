import { compile } from "handlebars";

import templates from "../../templates/components";

export async function getTriggerTemplate(templateName: string) {
    const resp = await fetch(`/templates/triggers/${templateName}.hbs`);
    return resp && resp.status === 200 ? resp.text() : undefined;
}

export async function getTriggerSource(triggerName: string, config: { [key: string]: any }) {
    const hbTemplate = compile(await getTriggerTemplate(triggerName));
    return hbTemplate(config);
}

export async function getSampleTemplate(sampleName: string, kind?: string) {
    kind = (kind === "Integration") ? "integrations" : "services";
    const resp = await fetch(`/newsamples/${kind}/${sampleName}/sample.bal`);
    return resp && resp.status === 200 ? resp.text() : undefined;
}

export async function getSampleSource(sampleName: string, config: {[key: string]: any}, kind?: string) {
    const hbTemplate = compile(await getSampleTemplate(sampleName, kind));
    return hbTemplate(config);
}

export async function getInsertTemplate(insertTempName: string) {
    return templates[insertTempName];
}

export async function getInsertComponentSource(insertTempName: string, config: { [key: string]: any }) {
    const hbTemplate = compile(await getInsertTemplate(insertTempName));
    return hbTemplate(config);
}

export function getComponentSource(insertTemplateName: string, config: {[key: string]: any}) {
    const hbTemplate = compile(templates[insertTemplateName]);
    return hbTemplate(config);
}
