/* @generated from adl module release */

import * as ADL from './runtime/adl';
import * as types from './types';

/**
 * Configuration for a package to be customized
 * when unpacked
 */
export interface ReleaseConfig {
  templates: types.FilePath[];
  prestartCommand: string;
  startCommand: string;
  stopCommand: string;
}

export function makeReleaseConfig(
  input: {
    templates: types.FilePath[],
    prestartCommand: string,
    startCommand: string,
    stopCommand: string,
  }
): ReleaseConfig {
  return {
    templates: input.templates,
    prestartCommand: input.prestartCommand,
    startCommand: input.startCommand,
    stopCommand: input.stopCommand,
  };
}

const ReleaseConfig_AST : ADL.ScopedDecl =
  {"moduleName":"release","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"templates","default":{"kind":"nothing"},"name":"templates","typeExpr":{"typeRef":{"kind":"primitive","value":"Vector"},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}]}},{"annotations":[],"serializedName":"prestartCommand","default":{"kind":"nothing"},"name":"prestartCommand","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"startCommand","default":{"kind":"nothing"},"name":"startCommand","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"stopCommand","default":{"kind":"nothing"},"name":"stopCommand","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}]}},"name":"ReleaseConfig","version":{"kind":"nothing"}}};

export const snReleaseConfig: ADL.ScopedName = {moduleName:"release", name:"ReleaseConfig"};

export function texprReleaseConfig(): ADL.ATypeExpr<ReleaseConfig> {
  return {value : {typeRef : {kind: "reference", value : snReleaseConfig}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "release.ReleaseConfig" : ReleaseConfig_AST
};
