"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetRemove = exports.EnableDisable = exports.PolicyType = exports.SchemaType = exports.LogCategory = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["simple"] = 0] = "simple";
    LogLevel[LogLevel["headers"] = 1] = "headers";
    LogLevel[LogLevel["full"] = 2] = "full";
    LogLevel[LogLevel["custom"] = 3] = "custom";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var LogCategory;
(function (LogCategory) {
    LogCategory[LogCategory["INFO"] = 0] = "INFO";
    LogCategory[LogCategory["FATAL"] = 1] = "FATAL";
    LogCategory[LogCategory["ERROR"] = 2] = "ERROR";
    LogCategory[LogCategory["WARN"] = 3] = "WARN";
    LogCategory[LogCategory["DEBUG"] = 4] = "DEBUG";
    LogCategory[LogCategory["TRACE"] = 5] = "TRACE";
})(LogCategory || (exports.LogCategory = LogCategory = {}));
var SchemaType;
(function (SchemaType) {
    SchemaType[SchemaType["XML"] = 0] = "XML";
    SchemaType[SchemaType["JSON"] = 1] = "JSON";
    SchemaType[SchemaType["CSV"] = 2] = "CSV";
    SchemaType[SchemaType["XSD"] = 3] = "XSD";
    SchemaType[SchemaType["JSONSCHEMA"] = 4] = "JSONSCHEMA";
    SchemaType[SchemaType["CONNECTOR"] = 5] = "CONNECTOR";
})(SchemaType || (exports.SchemaType = SchemaType = {}));
var PolicyType;
(function (PolicyType) {
    PolicyType[PolicyType["in"] = 0] = "in";
    PolicyType[PolicyType["out"] = 1] = "out";
})(PolicyType || (exports.PolicyType = PolicyType = {}));
var EnableDisable;
(function (EnableDisable) {
    EnableDisable[EnableDisable["enable"] = 0] = "enable";
    EnableDisable[EnableDisable["disable"] = 1] = "disable";
})(EnableDisable || (exports.EnableDisable = EnableDisable = {}));
var SetRemove;
(function (SetRemove) {
    SetRemove[SetRemove["set"] = 0] = "set";
    SetRemove[SetRemove["remove"] = 1] = "remove";
})(SetRemove || (exports.SetRemove = SetRemove = {}));
//# sourceMappingURL=syntax-tree-interfaces.js.map