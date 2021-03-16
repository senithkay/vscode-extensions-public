import { compile } from "handlebars";

export async function getTriggerTemplate(templateName: string) {
    const resp = await fetch(`/templates/triggers/${templateName}.hbs`);
    return resp && resp.status === 200 ? resp.text() : undefined;
}

export async function getTriggerSource(triggerName: string, config: { [key: string]: any }) {
    const hbTemplate = compile(await getTriggerTemplate(triggerName));
    return hbTemplate(config);
}

export async function getSampleTemplate(sampleName: string) {
    const resp = await fetch(`/samples/${sampleName}/sample.hbs`);
    return resp && resp.status === 200 ? resp.text() : undefined;
}

export async function getSampleSource(sampleName: string, config: { [key: string]: any }) {
    const hbTemplate = compile(await getSampleTemplate(sampleName));
    return hbTemplate(config);
}

export async function getInsertTemplate(insertTempName: string) {
    const resp = await fetch(`/templates/components/${insertTempName}.hbs`);
    return resp && resp.status === 200 ? resp.text() : undefined;
}

export async function getInsertComponentSource(insertTempName: string, config: { [key: string]: any }) {
    const hbTemplate = compile(await getInsertTemplate(insertTempName));
    return hbTemplate(config);
}
