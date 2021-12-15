import { compile } from "handlebars";

import templates from "../../../templates/components";

export async function getInsertTemplate(insertTempName: string) {
    return templates[insertTempName];
}

export async function getInsertComponentSource(insertTempName: string, config: { [key: string]: any }) {
    const hbTemplate = compile(await getInsertTemplate(insertTempName));
    return hbTemplate(config);
}
