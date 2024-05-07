import { Rewrite } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import Mustache from "mustache";

export function getRewriteMustacheTemplate() {
    return `
    <rewrite description="{{description}}" inProperty="{{inProperty}}" outProperty="{{outProperty}}" >
    {{#urlRewriteRules}}
        <rewriterule>
            <condition>{{{condition}}}</condition>
            {{#rewriteRuleAction}}
                <action fragment="{{ruleFragment}}" {{#actionRegex}}regex="{{actionRegex}}"{{/actionRegex}} type="{{ruleAction}}" {{#actionValue}}value="{{actionValue}}"{{/actionValue}} {{#actionExpression}}xpath="{{actionExpression}}"{{/actionExpression}} />   
            {{/rewriteRuleAction}}
        </rewriterule>
    {{/urlRewriteRules}}
    </rewrite> 
    `;
}

export function getRewriteXml(data: { [key: string]: any }) {

    if (data.urlRewriteRules && data.urlRewriteRules.length > 0) {
        data.urlRewriteRules = data.urlRewriteRules.map((rewriteRule: any[]) => {
            return {
                condition: rewriteRule[1],
                rewriteRuleAction: rewriteRule[0].map((action: string[]) => {
                    return {
                        ruleAction: action[0]?.toLowerCase(),
                        ruleFragment: action[1],
                        actionValue: action[2] == "Literal" ? action[3] : undefined,
                        actionExpression: action[2] == "Expression" ? action[4] : undefined,
                        actionRegex: action[5]
                    }
                })
            }
        });
    }
    const output = Mustache.render(getRewriteMustacheTemplate(), data);
    return output;
}

export function getRewriteFormDataFromSTNode(data: { [key: string]: any }, node: Rewrite) {

    data.inProperty = node.inProperty;
    data.outProperty = node.outProperty;
    data.description = node.description;
    data.urlRewriteRules = node.rewriterule.map((rewriteRule) => {
        return [rewriteRule.action.map((action) => {
            let ruleAction = [action.type, action.fragment, action.value ? "Literal" : "Expression", action.value, action.xpath, action.regex];
            return ruleAction;
        }), rewriteRule.condition?.textNode];
    });
    return data;
}
