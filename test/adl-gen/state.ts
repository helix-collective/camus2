/* @generated from adl module state */

import * as ADL from './runtime/adl';
import * as types from './types';

export interface State {
  deploys: types.StringKeyMap<types.DeployLabel, Deploy>;
  connections: types.StringKeyMap<types.EndPointLabel, types.DeployLabel>;
}

export function makeState(
  input: {
    deploys: types.StringKeyMap<types.DeployLabel, Deploy>,
    connections: types.StringKeyMap<types.EndPointLabel, types.DeployLabel>,
  }
): State {
  return {
    deploys: input.deploys,
    connections: input.connections,
  };
}

const State_AST : ADL.ScopedDecl =
  {"moduleName":"state","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"deploys","default":{"kind":"nothing"},"name":"deploys","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"StringKeyMap"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"DeployLabel"}},"parameters":[]},{"typeRef":{"kind":"reference","value":{"moduleName":"state","name":"Deploy"}},"parameters":[]}]}},{"annotations":[],"serializedName":"connections","default":{"kind":"nothing"},"name":"connections","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"StringKeyMap"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"EndPointLabel"}},"parameters":[]},{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"DeployLabel"}},"parameters":[]}]}}]}},"name":"State","version":{"kind":"nothing"}}};

export const snState: ADL.ScopedName = {moduleName:"state", name:"State"};

export function texprState(): ADL.ATypeExpr<State> {
  return {value : {typeRef : {kind: "reference", value : snState}, parameters : []}};
}

export interface SlaveState {
  status: SlaveStatus;
  ipAddress: string;
  hostName: string;
  state: State;
}

export function makeSlaveState(
  input: {
    status: SlaveStatus,
    ipAddress: string,
    hostName: string,
    state: State,
  }
): SlaveState {
  return {
    status: input.status,
    ipAddress: input.ipAddress,
    hostName: input.hostName,
    state: input.state,
  };
}

const SlaveState_AST : ADL.ScopedDecl =
  {"moduleName":"state","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"status","default":{"kind":"nothing"},"name":"status","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"state","name":"SlaveStatus"}},"parameters":[]}},{"annotations":[],"serializedName":"ipAddress","default":{"kind":"nothing"},"name":"ipAddress","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"hostName","default":{"kind":"nothing"},"name":"hostName","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"state","default":{"kind":"nothing"},"name":"state","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"state","name":"State"}},"parameters":[]}}]}},"name":"SlaveState","version":{"kind":"nothing"}}};

export const snSlaveState: ADL.ScopedName = {moduleName:"state", name:"SlaveState"};

export function texprSlaveState(): ADL.ATypeExpr<SlaveState> {
  return {value : {typeRef : {kind: "reference", value : snSlaveState}, parameters : []}};
}

export interface SlaveStatus_Ok {
  kind: 'ok';
}
export interface SlaveStatus_Error {
  kind: 'error';
  value: string;
}

export type SlaveStatus = SlaveStatus_Ok | SlaveStatus_Error;

export interface SlaveStatusOpts {
  ok: null;
  error: string;
}

export function makeSlaveStatus<K extends keyof SlaveStatusOpts>(kind: K, value: SlaveStatusOpts[K]) { return {kind, value}; }

const SlaveStatus_AST : ADL.ScopedDecl =
  {"moduleName":"state","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"ok","default":{"kind":"nothing"},"name":"ok","typeExpr":{"typeRef":{"kind":"primitive","value":"Void"},"parameters":[]}},{"annotations":[],"serializedName":"error","default":{"kind":"nothing"},"name":"error","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}]}},"name":"SlaveStatus","version":{"kind":"nothing"}}};

export const snSlaveStatus: ADL.ScopedName = {moduleName:"state", name:"SlaveStatus"};

export function texprSlaveStatus(): ADL.ATypeExpr<SlaveStatus> {
  return {value : {typeRef : {kind: "reference", value : snSlaveStatus}, parameters : []}};
}

export interface Deploy {
  label: types.DeployLabel;
  release: string;
  port: number;
}

export function makeDeploy(
  input: {
    label: types.DeployLabel,
    release: string,
    port: number,
  }
): Deploy {
  return {
    label: input.label,
    release: input.release,
    port: input.port,
  };
}

const Deploy_AST : ADL.ScopedDecl =
  {"moduleName":"state","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"label","default":{"kind":"nothing"},"name":"label","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"DeployLabel"}},"parameters":[]}},{"annotations":[],"serializedName":"release","default":{"kind":"nothing"},"name":"release","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"port","default":{"kind":"nothing"},"name":"port","typeExpr":{"typeRef":{"kind":"primitive","value":"Word32"},"parameters":[]}}]}},"name":"Deploy","version":{"kind":"nothing"}}};

export const snDeploy: ADL.ScopedName = {moduleName:"state", name:"Deploy"};

export function texprDeploy(): ADL.ATypeExpr<Deploy> {
  return {value : {typeRef : {kind: "reference", value : snDeploy}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "state.State" : State_AST,
  "state.SlaveState" : SlaveState_AST,
  "state.SlaveStatus" : SlaveStatus_AST,
  "state.Deploy" : Deploy_AST
};
