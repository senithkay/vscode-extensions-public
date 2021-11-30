import React from "react";

import ConfigForm from "../components/ConfigForm";

export default {
  component: ConfigForm,
  title: 'ConfigForm',
};

const data = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "dilhashanazeer": {
      "type": "object",
      "properties": {
        "simpleconfigs": {
          "type": "object",
          "properties": {
            "itemCode": {
              "type": "string",
              "description": "description"
            },
            "discount": {
              "type": "number",
              "description": "description"
            },
            "testMode": {
              "type": "boolean",
              "description": "description"
            },
            "mod1": {
              "type": "object",
              "properties": {
                "nameVal": {
                  "type": "string",
                  "description": "description"
                }
              }
            }
          },
          "required": [
            "testMode"
          ]
        }
      }
    }
  }
};

export const BasicForm = () => <ConfigForm configSchema={data}/>;
