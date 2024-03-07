import { Script } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getScriptMustacheTemplate() {
    return `{{#hasScriptKey}}
    <script {{#description}}description="{{description}}" {{/description}}{{#mediateFunction}}function="{{mediateFunction}}" {{/mediateFunction}}{{#scriptStaticKey}}key="{{scriptStaticKey}}" {{/scriptStaticKey}}{{#scriptDynamicKey}}key="{{scriptDynamicKey}}" {{/scriptDynamicKey}}{{#scriptLanguage}}language="{{scriptLanguage}}"{{/scriptLanguage}} >
        {{#scriptKeys}}
        <include {{#keyName}}key="{{keyName}}"{{/keyName}} />
        {{/scriptKeys}}
</script>
    {{/hasScriptKey}}
    {{^hasScriptKey}}
    {{#scriptBody}}
    <script {{#description}}description="{{description}}" {{/description}}{{#scriptLanguage}}language="{{scriptLanguage}}" {{/scriptLanguage}}><![CDATA[{{#scriptBody}}{{{scriptBody}}}{{/scriptBody}}]]></script>
    {{/scriptBody}}
    {{^scriptBody}}
    <script {{#description}}description="{{description}}" {{/description}}{{#mediateFunction}}function="{{mediateFunction}}" {{/mediateFunction}}{{#scriptStaticKey}}key="{{scriptStaticKey}}" {{/scriptStaticKey}}{{#scriptDynamicKey}}key="{{scriptDynamicKey}}" {{/scriptDynamicKey}}{{#scriptLanguage}}language="{{scriptLanguage}}" {{/scriptLanguage}} />
    {{/scriptBody}}
    {{/hasScriptKey}}`;
}

export function getScriptXml(data: { [key: string]: any }) {

    let hasScriptKey = false;
    let scriptKeys;
    if (data.scriptKeys && data.scriptKeys.length > 0) {
        hasScriptKey = true;
        scriptKeys = data.scriptKeys.map((key: string[]) => {
            return {
                keyName: key[0],
                keyValue: key[1]
            }
        });
    }

    if (data.scriptDynamicKey && !data.scriptDynamicKey.startsWith("{")) {
        data.scriptDynamicKey = "{" + data.scriptDynamicKey + "}";
    }

    const modifiedData = {
        ...data,
        scriptKeys: scriptKeys,
        hasScriptKey: hasScriptKey
    }

    const output = Mustache.render(getScriptMustacheTemplate(), modifiedData);
    return output.trim();
}

export function getScriptFormDataFromSTNode(data: { [key: string]: any }, node: Script) {

    if (node.include) {
        data.scriptKeys = node.include.map((key) => {
            return [key];
        });
    }
    data.scriptType = "REGISTRY_REFERENCE";
    if (!node.function && (!node.include || node.include.length == 0)) {
        data.scriptType = "INLINE";
    }
    data.scriptLanguage = node.language;

    if (node.key && node.key.startsWith("{")) {
        data.keyType = "DYNAMIC_KEY";
        data.scriptDynamicKey = node.key
    } else {
        data.keyType = "STATIC_KEY";
        data.scriptStaticKey = node.key
    }
    data.description = node.description;
    data.mediateFunction = node.function;
    if (node.content) {
        data.scriptBody = getScriptBody(node.content);
    }
    return data;
}

function getScriptBody(content: string[]) {
    let body;
    for (const c of content) {
        const match = c.match(/<!\[CDATA\[(.*?)]]>/);
        return body = match ? match[1] : null;
    };
} 