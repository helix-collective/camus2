/* @generated from adl module dconfig */

import * as ADL from './runtime/adl';
import * as sys_types from './sys/types';
import * as types from './types';

/**
 * ConfigName for switchable dynamic configs - eg 'queue' 'processing'
 */
export type DynamicConfigName = types.ConfigName;

const DynamicConfigName_AST : ADL.ScopedDecl =
  {"moduleName":"dconfig","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"ConfigName"}},"parameters":[]}}},"name":"DynamicConfigName","version":{"kind":"nothing"}}};

export const snDynamicConfigName: ADL.ScopedName = {moduleName:"dconfig", name:"DynamicConfigName"};

export function texprDynamicConfigName(): ADL.ATypeExpr<DynamicConfigName> {
  return {value : {typeRef : {kind: "reference", value : snDynamicConfigName}, parameters : []}};
}

/**
 * Name of a mode of a dynamic config - eg 'active' 'inactive'
 */
export type DynamicConfigMode = string;

const DynamicConfigMode_AST : ADL.ScopedDecl =
  {"moduleName":"dconfig","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"DynamicConfigMode","version":{"kind":"nothing"}}};

export const snDynamicConfigMode: ADL.ScopedName = {moduleName:"dconfig", name:"DynamicConfigMode"};

export function texprDynamicConfigMode(): ADL.ATypeExpr<DynamicConfigMode> {
  return {value : {typeRef : {kind: "reference", value : snDynamicConfigMode}, parameters : []}};
}

/**
 * A config source that can be changed to different named Modes at runtime.
 */
export interface DynamicJsonSource {
  defaultMode: DynamicConfigMode;
  modes: types.StringKeyMap<DynamicConfigMode, JsonSource>;
}

export function makeDynamicJsonSource(
  input: {
    defaultMode: DynamicConfigMode,
    modes: types.StringKeyMap<DynamicConfigMode, JsonSource>,
  }
): DynamicJsonSource {
  return {
    defaultMode: input.defaultMode,
    modes: input.modes,
  };
}

const DynamicJsonSource_AST : ADL.ScopedDecl =
  {"moduleName":"dconfig","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"defaultMode","default":{"kind":"nothing"},"name":"defaultMode","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"DynamicConfigMode"}},"parameters":[]}},{"annotations":[],"serializedName":"modes","default":{"kind":"nothing"},"name":"modes","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"StringKeyMap"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"DynamicConfigMode"}},"parameters":[]},{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"JsonSource"}},"parameters":[]}]}}]}},"name":"DynamicJsonSource","version":{"kind":"nothing"}}};

export const snDynamicJsonSource: ADL.ScopedName = {moduleName:"dconfig", name:"DynamicJsonSource"};

export function texprDynamicJsonSource(): ADL.ATypeExpr<DynamicJsonSource> {
  return {value : {typeRef : {kind: "reference", value : snDynamicJsonSource}, parameters : []}};
}

export type DynamicConfigNameModeMap = types.StringKeyMap<DynamicConfigName, DynamicConfigMode>;

const DynamicConfigNameModeMap_AST : ADL.ScopedDecl =
  {"moduleName":"dconfig","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"StringKeyMap"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"DynamicConfigName"}},"parameters":[]},{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"DynamicConfigMode"}},"parameters":[]}]}}},"name":"DynamicConfigNameModeMap","version":{"kind":"nothing"}}};

export const snDynamicConfigNameModeMap: ADL.ScopedName = {moduleName:"dconfig", name:"DynamicConfigNameModeMap"};

export function texprDynamicConfigNameModeMap(): ADL.ATypeExpr<DynamicConfigNameModeMap> {
  return {value : {typeRef : {kind: "reference", value : snDynamicConfigNameModeMap}, parameters : []}};
}

export type DynamicConfigNameJSrcMap = types.StringKeyMap<DynamicConfigName, DynamicJsonSource>;

const DynamicConfigNameJSrcMap_AST : ADL.ScopedDecl =
  {"moduleName":"dconfig","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"StringKeyMap"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"DynamicConfigName"}},"parameters":[]},{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"DynamicJsonSource"}},"parameters":[]}]}}},"name":"DynamicConfigNameJSrcMap","version":{"kind":"nothing"}}};

export const snDynamicConfigNameJSrcMap: ADL.ScopedName = {moduleName:"dconfig", name:"DynamicConfigNameJSrcMap"};

export function texprDynamicConfigNameJSrcMap(): ADL.ATypeExpr<DynamicConfigNameJSrcMap> {
  return {value : {typeRef : {kind: "reference", value : snDynamicConfigNameJSrcMap}, parameters : []}};
}

/**
 * Listing of available modes per configName
 */
export type DynamicConfigOptions = types.StringKeyMap<DynamicConfigName, sys_types.Set<DynamicConfigMode>>;

const DynamicConfigOptions_AST : ADL.ScopedDecl =
  {"moduleName":"dconfig","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"StringKeyMap"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"DynamicConfigName"}},"parameters":[]},{"typeRef":{"kind":"reference","value":{"moduleName":"sys.types","name":"Set"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"DynamicConfigMode"}},"parameters":[]}]}]}}},"name":"DynamicConfigOptions","version":{"kind":"nothing"}}};

export const snDynamicConfigOptions: ADL.ScopedName = {moduleName:"dconfig", name:"DynamicConfigOptions"};

export function texprDynamicConfigOptions(): ADL.ATypeExpr<DynamicConfigOptions> {
  return {value : {typeRef : {kind: "reference", value : snDynamicConfigOptions}, parameters : []}};
}

export interface JsonSource_File {
  kind: 'file';
  value: types.FilePath;
}
export interface JsonSource_S3 {
  kind: 's3';
  value: types.S3Path;
}
export interface JsonSource_AwsSecretArn {
  kind: 'awsSecretArn';
  value: string;
}

/**
 * Methods of providing text for a config context
 */
export type JsonSource = JsonSource_File | JsonSource_S3 | JsonSource_AwsSecretArn;

export interface JsonSourceOpts {
  file: types.FilePath;
  /**
   * Context from an S3 object
   */
  s3: types.S3Path;
  /**
   * Context from AWS secrets manager secret
   */
  awsSecretArn: string;
}

export function makeJsonSource<K extends keyof JsonSourceOpts>(kind: K, value: JsonSourceOpts[K]) { return {kind, value}; }

const JsonSource_AST : ADL.ScopedDecl =
  {"moduleName":"dconfig","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"file","default":{"kind":"nothing"},"name":"file","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}},{"annotations":[],"serializedName":"s3","default":{"kind":"nothing"},"name":"s3","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"S3Path"}},"parameters":[]}},{"annotations":[],"serializedName":"awsSecretArn","default":{"kind":"nothing"},"name":"awsSecretArn","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}]}},"name":"JsonSource","version":{"kind":"nothing"}}};

export const snJsonSource: ADL.ScopedName = {moduleName:"dconfig", name:"JsonSource"};

export function texprJsonSource(): ADL.ATypeExpr<JsonSource> {
  return {value : {typeRef : {kind: "reference", value : snJsonSource}, parameters : []}};
}

export type ConfigNameJsonSourceMap = types.StringKeyMap<types.ConfigName, JsonSource>;

const ConfigNameJsonSourceMap_AST : ADL.ScopedDecl =
  {"moduleName":"dconfig","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"StringKeyMap"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"ConfigName"}},"parameters":[]},{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"JsonSource"}},"parameters":[]}]}}},"name":"ConfigNameJsonSourceMap","version":{"kind":"nothing"}}};

export const snConfigNameJsonSourceMap: ADL.ScopedName = {moduleName:"dconfig", name:"ConfigNameJsonSourceMap"};

export function texprConfigNameJsonSourceMap(): ADL.ATypeExpr<ConfigNameJsonSourceMap> {
  return {value : {typeRef : {kind: "reference", value : snConfigNameJsonSourceMap}, parameters : []}};
}

export interface DynamicConfigNameMode {
  name: DynamicConfigName;
  mode: DynamicConfigMode;
}

export function makeDynamicConfigNameMode(
  input: {
    name: DynamicConfigName,
    mode: DynamicConfigMode,
  }
): DynamicConfigNameMode {
  return {
    name: input.name,
    mode: input.mode,
  };
}

const DynamicConfigNameMode_AST : ADL.ScopedDecl =
  {"moduleName":"dconfig","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"name","default":{"kind":"nothing"},"name":"name","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"DynamicConfigName"}},"parameters":[]}},{"annotations":[],"serializedName":"mode","default":{"kind":"nothing"},"name":"mode","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"DynamicConfigMode"}},"parameters":[]}}]}},"name":"DynamicConfigNameMode","version":{"kind":"nothing"}}};

export const snDynamicConfigNameMode: ADL.ScopedName = {moduleName:"dconfig", name:"DynamicConfigNameMode"};

export function texprDynamicConfigNameMode(): ADL.ATypeExpr<DynamicConfigNameMode> {
  return {value : {typeRef : {kind: "reference", value : snDynamicConfigNameMode}, parameters : []}};
}

export interface ConfigSource_Static {
  kind: 'static';
  value: types.ConfigName;
}
export interface ConfigSource_Dynamic {
  kind: 'dynamic';
  value: DynamicConfigNameMode;
}

export type ConfigSource = ConfigSource_Static | ConfigSource_Dynamic;

export interface ConfigSourceOpts {
  static: types.ConfigName;
  dynamic: DynamicConfigNameMode;
}

export function makeConfigSource<K extends keyof ConfigSourceOpts>(kind: K, value: ConfigSourceOpts[K]) { return {kind, value}; }

const ConfigSource_AST : ADL.ScopedDecl =
  {"moduleName":"dconfig","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"static","default":{"kind":"nothing"},"name":"static","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"ConfigName"}},"parameters":[]}},{"annotations":[],"serializedName":"dynamic","default":{"kind":"nothing"},"name":"dynamic","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"dconfig","name":"DynamicConfigNameMode"}},"parameters":[]}}]}},"name":"ConfigSource","version":{"kind":"nothing"}}};

export const snConfigSource: ADL.ScopedName = {moduleName:"dconfig", name:"ConfigSource"};

export function texprConfigSource(): ADL.ATypeExpr<ConfigSource> {
  return {value : {typeRef : {kind: "reference", value : snConfigSource}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "dconfig.DynamicConfigName" : DynamicConfigName_AST,
  "dconfig.DynamicConfigMode" : DynamicConfigMode_AST,
  "dconfig.DynamicJsonSource" : DynamicJsonSource_AST,
  "dconfig.DynamicConfigNameModeMap" : DynamicConfigNameModeMap_AST,
  "dconfig.DynamicConfigNameJSrcMap" : DynamicConfigNameJSrcMap_AST,
  "dconfig.DynamicConfigOptions" : DynamicConfigOptions_AST,
  "dconfig.JsonSource" : JsonSource_AST,
  "dconfig.ConfigNameJsonSourceMap" : ConfigNameJsonSourceMap_AST,
  "dconfig.DynamicConfigNameMode" : DynamicConfigNameMode_AST,
  "dconfig.ConfigSource" : ConfigSource_AST
};
