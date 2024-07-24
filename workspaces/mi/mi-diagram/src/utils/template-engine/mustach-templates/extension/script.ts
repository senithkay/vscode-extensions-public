import { Script } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";
import { transformNamespaces } from "../../../commons";

export function getScriptMustacheTemplate() {
    return `{{#isRegistry}}
    {{#hasScriptKeys}}
    <script {{#description}}description="{{description}}" {{/description}}{{#mediateFunction}}function="{{mediateFunction}}" {{/mediateFunction}}{{#scriptKey}}key="{{value}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}} {{/scriptKey}}{{#scriptLanguage}}language="{{scriptLanguage}}"{{/scriptLanguage}} >
        {{#scriptKeys}}
        <include {{#keyName}}key="{{keyName}}"{{/keyName}} />
        {{/scriptKeys}}
    </script>
    {{/hasScriptKeys}}
    {{^hasScriptKeys}}
    <script {{#description}}description="{{description}}" {{/description}}{{#mediateFunction}}function="{{mediateFunction}}" {{/mediateFunction}}{{#scriptKey}}key="{{value}}"{{#namespaces}} xmlns:{{prefix}}="{{uri}}"{{/namespaces}} {{/scriptKey}}{{#scriptLanguage}}language="{{scriptLanguage}}"{{/scriptLanguage}}/>
    {{/hasScriptKeys}}
    {{/isRegistry}}
    {{^isRegistry}}
    <script {{#description}}description="{{description}}" {{/description}}{{#scriptLanguage}}language="{{scriptLanguage}}" {{/scriptLanguage}}><![CDATA[{{#scriptBody}}{{{scriptBody}}}{{/scriptBody}}]]></script>
    {{/isRegistry}}`;
}

export function getScriptXml(data: { [key: string]: any }) {

    if (data.scriptType !== "INLINE") {
        data.isRegistry = true
        if (data.scriptKeys && data.scriptKeys.length > 0) {
            data.hasScriptKeys = true;
            data.scriptKeys = data.scriptKeys.map((key: string[]) => {
                return {
                    keyName: key[0],
                    keyValue: key[1]
                }
            });
        }

        if (data.scriptKey?.isExpression) {
            data.scriptKey.value = "{" + data.scriptKey.value + "}";
        }
    }

    if (data.scriptLanguage && data.scriptLanguage.includes("(Deprecated)")) {
        data.scriptLanguage = data.scriptLanguage.replace("(Deprecated)", "").trim();
    }

    const output = Mustache.render(getScriptMustacheTemplate(), data);
    return output.trim();
}

export function getScriptFormDataFromSTNode(data: { [key: string]: any }, node: Script) {

    if (node.include) {
        data.scriptKeys = node.include.map((key) => {
            return ["", key];
        });
    }
    data.scriptType = "REGISTRY_REFERENCE";
    if (!node.key) {
        data.scriptType = "INLINE";
    }
    data.scriptLanguage = node.language;

    if (node.key?.startsWith("{") && node.key?.endsWith("}")) {
        data.scriptKey = { isExpression: true, value: node.key?.substring(1, node.key?.length - 1), namespaces: transformNamespaces(node.namespaces) };
    } else {
        data.scriptKey = { isExpression: false, value: node.key };
    }
    data.description = node.description;
    data.mediateFunction = node.function;
    if (node.content) {
        data.scriptBody = getScriptBody(node.content);
    }
    return data;
}

function getScriptBody(content: string[]): string | null {
    for (const c of content) {
        const match = c.match(/<!\[CDATA\[(.*?)]]>/s);
        if (match) {
            return match[1];
        }
        return c;
    }
    return null;
}
