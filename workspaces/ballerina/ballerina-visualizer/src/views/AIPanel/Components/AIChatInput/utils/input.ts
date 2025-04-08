/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Command } from "../../../commandTemplates/models/command.enum";
import { BadgeType } from "../../Badge";

export type Input = TextInput | BadgeInput;

interface TextInput {
  content: string;
}

interface BaseBadgeInput {
  badgeType: BadgeType;
  value: string;
}

interface CommandBadgeInput extends BaseBadgeInput {
  badgeType: BadgeType.Command;
  command: Command;
}

interface TagBadgeInput extends BaseBadgeInput {
  badgeType: BadgeType.Tag;
}

type BadgeInput = CommandBadgeInput | TagBadgeInput;
