/* @generated from adl module types */

import * as ADL from './runtime/adl';

/**
 * Phantom Key type naming the string key type
 */
export type StringKeyMap<_Key, Value> = {[key: string]: Value};

const StringKeyMap_AST : ADL.ScopedDecl =
  {"moduleName":"types","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":["Key","Value"],"typeExpr":{"typeRef":{"kind":"primitive","value":"StringMap"},"parameters":[{"typeRef":{"kind":"typeParam","value":"Value"},"parameters":[]}]}}},"name":"StringKeyMap","version":{"kind":"nothing"}}};

export const snStringKeyMap: ADL.ScopedName = {moduleName:"types", name:"StringKeyMap"};

export function texprStringKeyMap<Key, Value>(texprKey : ADL.ATypeExpr<Key>, texprValue : ADL.ATypeExpr<Value>): ADL.ATypeExpr<StringKeyMap<Key, Value>> {
  return {value : {typeRef : {kind: "reference", value : {moduleName : "types",name : "StringKeyMap"}}, parameters : [texprKey.value, texprValue.value]}};
}

export type FilePath = string;

const FilePath_AST : ADL.ScopedDecl =
  {"moduleName":"types","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"FilePath","version":{"kind":"nothing"}}};

export const snFilePath: ADL.ScopedName = {moduleName:"types", name:"FilePath"};

export function texprFilePath(): ADL.ATypeExpr<FilePath> {
  return {value : {typeRef : {kind: "reference", value : snFilePath}, parameters : []}};
}

export type S3Path = string;

const S3Path_AST : ADL.ScopedDecl =
  {"moduleName":"types","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"S3Path","version":{"kind":"nothing"}}};

export const snS3Path: ADL.ScopedName = {moduleName:"types", name:"S3Path"};

export function texprS3Path(): ADL.ATypeExpr<S3Path> {
  return {value : {typeRef : {kind: "reference", value : snS3Path}, parameters : []}};
}

export type EndPointLabel = string;

const EndPointLabel_AST : ADL.ScopedDecl =
  {"moduleName":"types","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"EndPointLabel","version":{"kind":"nothing"}}};

export const snEndPointLabel: ADL.ScopedName = {moduleName:"types", name:"EndPointLabel"};

export function texprEndPointLabel(): ADL.ATypeExpr<EndPointLabel> {
  return {value : {typeRef : {kind: "reference", value : snEndPointLabel}, parameters : []}};
}

export type DeployLabel = string;

const DeployLabel_AST : ADL.ScopedDecl =
  {"moduleName":"types","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"DeployLabel","version":{"kind":"nothing"}}};

export const snDeployLabel: ADL.ScopedName = {moduleName:"types", name:"DeployLabel"};

export function texprDeployLabel(): ADL.ATypeExpr<DeployLabel> {
  return {value : {typeRef : {kind: "reference", value : snDeployLabel}, parameters : []}};
}

/**
 * ConfigName is a name of one of the keys of the top level object used for template interpolation
 */
export type ConfigName = string;

const ConfigName_AST : ADL.ScopedDecl =
  {"moduleName":"types","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}},"name":"ConfigName","version":{"kind":"nothing"}}};

export const snConfigName: ADL.ScopedName = {moduleName:"types", name:"ConfigName"};

export function texprConfigName(): ADL.ATypeExpr<ConfigName> {
  return {value : {typeRef : {kind: "reference", value : snConfigName}, parameters : []}};
}

/**
 * ConfigName as part of the static config - eg 'infrastructure' 'secrets'
 */
export type StaticConfigName = ConfigName;

const StaticConfigName_AST : ADL.ScopedDecl =
  {"moduleName":"types","decl":{"annotations":[],"type_":{"kind":"type_","value":{"typeParams":[],"typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"ConfigName"}},"parameters":[]}}},"name":"StaticConfigName","version":{"kind":"nothing"}}};

export const snStaticConfigName: ADL.ScopedName = {moduleName:"types", name:"StaticConfigName"};

export function texprStaticConfigName(): ADL.ATypeExpr<StaticConfigName> {
  return {value : {typeRef : {kind: "reference", value : snStaticConfigName}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "types.StringKeyMap" : StringKeyMap_AST,
  "types.FilePath" : FilePath_AST,
  "types.S3Path" : S3Path_AST,
  "types.EndPointLabel" : EndPointLabel_AST,
  "types.DeployLabel" : DeployLabel_AST,
  "types.ConfigName" : ConfigName_AST,
  "types.StaticConfigName" : StaticConfigName_AST
};
