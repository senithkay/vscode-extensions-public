/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import { ComponentInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
  FieldAccess,
  OptionalFieldAccess,
  SimpleNameReference,
  STKindChecker,
  STNode,
  Visitor,
} from "@wso2-enterprise/syntax-tree";
import { Uri } from "monaco-editor";

import { containsWithin } from "../../../utils/st-utils";
import { EnumInfo } from "../Node/EnumType";
import { ModuleVariable, ModuleVarKind } from "../Node/ModuleVariable";
import { getDefinitionPosition } from "../utils/ls-utils";

export class ModuleVariablesFindingVisitor implements Visitor {
  private readonly moduleVariables: Map<string, ModuleVariable>;
  private readonly enumTypes: Map<string, ModuleVariable>;
  private readonly filePath: string;
  private readonly langClientPromise: Promise<IBallerinaLangClient>;
  private queryExpressionDepth: number;
  private moduleVarDecls: ComponentInfo[];
  private constDecls: ComponentInfo[];
  private enums: EnumInfo[];

  constructor(
    filePath: string,
    langClientPromise: Promise<IBallerinaLangClient>
  ) {
    this.moduleVariables = new Map<string, ModuleVariable>();
    this.enumTypes = new Map<string, ModuleVariable>();
    this.filePath = filePath;
    this.langClientPromise = langClientPromise;
    this.queryExpressionDepth = 0;

    this.moduleVarDecls = [];
    this.constDecls = [];
    this.enums = [];
  }

  public async init() {
    const langClient = await this.langClientPromise;
    const componentResponse = await langClient.getBallerinaProjectComponents({
      documentIdentifiers: [
        {
          uri: Uri.file(this.filePath).toString(),
        },
      ],
    });
    for (const pkg of componentResponse.packages) {
      for (const mdl of pkg.modules) {
        for (const moduleVariable of mdl.moduleVariables) {
          this.moduleVarDecls.push(moduleVariable);
        }
        for (const constant of mdl.constants) {
          this.constDecls.push(constant);
        }
        for (const enumType of mdl.enums) {
          this.enums.push({
            filePath: pkg.filePath,
            enum: enumType,
          });
        }
      }
    }
  }

  public async beginVisitFieldAccess(node: FieldAccess, parent?: STNode) {
    if (
      (!parent ||
        (!STKindChecker.isFieldAccess(parent) &&
          !STKindChecker.isOptionalFieldAccess(parent))) &&
      this.queryExpressionDepth === 0
    ) {
      const varName = node.source.trim().split(".")[0];
      const moduleVarKind = await this.getModuleVarKind(varName, node.position);
      if (moduleVarKind !== undefined) {
        this.moduleVariables.set(varName, {
          kind: moduleVarKind,
          node,
        });
      }
    }
  }

  public async beginVisitOptionalFieldAccess(
    node: OptionalFieldAccess,
    parent?: STNode
  ) {
    if (
      (!parent ||
        (!STKindChecker.isFieldAccess(parent) &&
          !STKindChecker.isOptionalFieldAccess(parent))) &&
      this.queryExpressionDepth === 0
    ) {
      const varName = node.source.trim().split(".")[0];
      const moduleVarKind = await this.getModuleVarKind(varName, node.position);
      if (moduleVarKind !== undefined) {
        this.moduleVariables.set(varName, {
          kind: moduleVarKind,
          node,
        });
      }
    }
  }

  public async beginVisitSimpleNameReference(
    node: SimpleNameReference,
    parent?: STNode
  ) {
    if (
      STKindChecker.isIdentifierToken(node.name) &&
      (!parent ||
        (parent &&
          !STKindChecker.isFieldAccess(parent) &&
          !STKindChecker.isOptionalFieldAccess(parent))) &&
      this.queryExpressionDepth === 0
    ) {
      const moduleVarKind = await this.getModuleVarKind(
        node.name.value,
        node.position
      );
      if (moduleVarKind === ModuleVarKind.Enum) {
        this.enumTypes.set(node.name.value, {
          kind: moduleVarKind,
          node,
        });
      } else if (moduleVarKind !== undefined) {
        this.moduleVariables.set(node.name.value, {
          kind: moduleVarKind,
          node,
        });
      }
    }
  }

  public beginVisitQueryExpression() {
    this.queryExpressionDepth += 1;
  }

  public endVisitQueryExpression() {
    this.queryExpressionDepth -= 1;
  }

  private async getModuleVarKind(varName: string, position: any) {
    let kind: ModuleVarKind;

    this.constDecls?.forEach((component) => {
      if (component.name.trim() === varName && !kind) {
        kind = ModuleVarKind.Constant;
      }
    });
    this.moduleVarDecls?.forEach((component) => {
      if (component.name.trim() === varName && !kind) {
        kind = ModuleVarKind.Variable;
      }
    });
    if (this.enums) {
      for (const component of this.enums) {
        const definitionPosition = await getDefinitionPosition(
          this.filePath,
          this.langClientPromise,
          {
            line: position.startLine,
            offset: position.startColumn,
          }
        );
        if (definitionPosition.parseSuccess) {
          const path1 = Uri.parse(definitionPosition.defFilePath).fsPath;
          const path2 = Uri.parse(component.filePath + component.enum.filePath).fsPath;
          const contains = containsWithin(
            path1,
            path2,
            definitionPosition.syntaxTree?.position,
            {
              startLine: component.enum.startLine,
              startColumn: component.enum.startColumn,
              endLine: component.enum.endLine,
              endColumn: component.enum.endColumn,
            }
          );
          if (contains && !kind) {
            kind = ModuleVarKind.Enum;
          }
        }
      }
    }

    return kind;
  }

  public getModuleVariables() {
    return this.moduleVariables;
  }

  public getEnumTypes() {
    return this.enumTypes;
  }
}
