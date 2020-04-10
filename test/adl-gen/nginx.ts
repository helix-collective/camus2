/* @generated from adl module nginx */

import * as ADL from './runtime/adl';

/**
 * The struct available to the nginx config mustache template
 */
export interface NginxConfContext {
  healthCheck: (NginxHealthCheck|null);
  endPoints: NginxEndPoint[];
}

export function makeNginxConfContext(
  input: {
    healthCheck: (NginxHealthCheck|null),
    endPoints: NginxEndPoint[],
  }
): NginxConfContext {
  return {
    healthCheck: input.healthCheck,
    endPoints: input.endPoints,
  };
}

const NginxConfContext_AST : ADL.ScopedDecl =
  {"moduleName":"nginx","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"healthCheck","default":{"kind":"nothing"},"name":"healthCheck","typeExpr":{"typeRef":{"kind":"primitive","value":"Nullable"},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"nginx","name":"NginxHealthCheck"}},"parameters":[]}]}},{"annotations":[],"serializedName":"endPoints","default":{"kind":"nothing"},"name":"endPoints","typeExpr":{"typeRef":{"kind":"primitive","value":"Vector"},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"nginx","name":"NginxEndPoint"}},"parameters":[]}]}}]}},"name":"NginxConfContext","version":{"kind":"nothing"}}};

export const snNginxConfContext: ADL.ScopedName = {moduleName:"nginx", name:"NginxConfContext"};

export function texprNginxConfContext(): ADL.ATypeExpr<NginxConfContext> {
  return {value : {typeRef : {kind: "reference", value : snNginxConfContext}, parameters : []}};
}

export interface NginxEndPoint_Http {
  kind: 'http';
  value: NginxHttpEndPoint;
}
export interface NginxEndPoint_Https {
  kind: 'https';
  value: NginxHttpsEndPoint;
}

export type NginxEndPoint = NginxEndPoint_Http | NginxEndPoint_Https;

export interface NginxEndPointOpts {
  http: NginxHttpEndPoint;
  https: NginxHttpsEndPoint;
}

export function makeNginxEndPoint<K extends keyof NginxEndPointOpts>(kind: K, value: NginxEndPointOpts[K]) { return {kind, value}; }

const NginxEndPoint_AST : ADL.ScopedDecl =
  {"moduleName":"nginx","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"http","default":{"kind":"nothing"},"name":"http","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"nginx","name":"NginxHttpEndPoint"}},"parameters":[]}},{"annotations":[],"serializedName":"https","default":{"kind":"nothing"},"name":"https","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"nginx","name":"NginxHttpsEndPoint"}},"parameters":[]}}]}},"name":"NginxEndPoint","version":{"kind":"nothing"}}};

export const snNginxEndPoint: ADL.ScopedName = {moduleName:"nginx", name:"NginxEndPoint"};

export function texprNginxEndPoint(): ADL.ATypeExpr<NginxEndPoint> {
  return {value : {typeRef : {kind: "reference", value : snNginxEndPoint}, parameters : []}};
}

export interface NginxHttpEndPoint {
  serverNames: string;
  port: (number|null);
}

export function makeNginxHttpEndPoint(
  input: {
    serverNames: string,
    port: (number|null),
  }
): NginxHttpEndPoint {
  return {
    serverNames: input.serverNames,
    port: input.port,
  };
}

const NginxHttpEndPoint_AST : ADL.ScopedDecl =
  {"moduleName":"nginx","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"serverNames","default":{"kind":"nothing"},"name":"serverNames","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"port","default":{"kind":"nothing"},"name":"port","typeExpr":{"typeRef":{"kind":"primitive","value":"Nullable"},"parameters":[{"typeRef":{"kind":"primitive","value":"Word32"},"parameters":[]}]}}]}},"name":"NginxHttpEndPoint","version":{"kind":"nothing"}}};

export const snNginxHttpEndPoint: ADL.ScopedName = {moduleName:"nginx", name:"NginxHttpEndPoint"};

export function texprNginxHttpEndPoint(): ADL.ATypeExpr<NginxHttpEndPoint> {
  return {value : {typeRef : {kind: "reference", value : snNginxHttpEndPoint}, parameters : []}};
}

export interface NginxHttpsEndPoint {
  serverNames: string;
  sslCertPath: (string|null);
  sslCertKeyPath: (string|null);
  letsencryptWwwDir: string;
  port: (number|null);
}

export function makeNginxHttpsEndPoint(
  input: {
    serverNames: string,
    sslCertPath: (string|null),
    sslCertKeyPath: (string|null),
    letsencryptWwwDir: string,
    port: (number|null),
  }
): NginxHttpsEndPoint {
  return {
    serverNames: input.serverNames,
    sslCertPath: input.sslCertPath,
    sslCertKeyPath: input.sslCertKeyPath,
    letsencryptWwwDir: input.letsencryptWwwDir,
    port: input.port,
  };
}

const NginxHttpsEndPoint_AST : ADL.ScopedDecl =
  {"moduleName":"nginx","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"serverNames","default":{"kind":"nothing"},"name":"serverNames","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"sslCertPath","default":{"kind":"nothing"},"name":"sslCertPath","typeExpr":{"typeRef":{"kind":"primitive","value":"Nullable"},"parameters":[{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}]}},{"annotations":[],"serializedName":"sslCertKeyPath","default":{"kind":"nothing"},"name":"sslCertKeyPath","typeExpr":{"typeRef":{"kind":"primitive","value":"Nullable"},"parameters":[{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}]}},{"annotations":[],"serializedName":"letsencryptWwwDir","default":{"kind":"nothing"},"name":"letsencryptWwwDir","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"port","default":{"kind":"nothing"},"name":"port","typeExpr":{"typeRef":{"kind":"primitive","value":"Nullable"},"parameters":[{"typeRef":{"kind":"primitive","value":"Word32"},"parameters":[]}]}}]}},"name":"NginxHttpsEndPoint","version":{"kind":"nothing"}}};

export const snNginxHttpsEndPoint: ADL.ScopedName = {moduleName:"nginx", name:"NginxHttpsEndPoint"};

export function texprNginxHttpsEndPoint(): ADL.ATypeExpr<NginxHttpsEndPoint> {
  return {value : {typeRef : {kind: "reference", value : snNginxHttpsEndPoint}, parameters : []}};
}

export interface NginxHealthCheck {
  incomingPath: string;
  outgoingPath: string;
  outgoingPort: number;
}

export function makeNginxHealthCheck(
  input: {
    incomingPath: string,
    outgoingPath: string,
    outgoingPort: number,
  }
): NginxHealthCheck {
  return {
    incomingPath: input.incomingPath,
    outgoingPath: input.outgoingPath,
    outgoingPort: input.outgoingPort,
  };
}

const NginxHealthCheck_AST : ADL.ScopedDecl =
  {"moduleName":"nginx","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"incomingPath","default":{"kind":"nothing"},"name":"incomingPath","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"outgoingPath","default":{"kind":"nothing"},"name":"outgoingPath","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"outgoingPort","default":{"kind":"nothing"},"name":"outgoingPort","typeExpr":{"typeRef":{"kind":"primitive","value":"Word32"},"parameters":[]}}]}},"name":"NginxHealthCheck","version":{"kind":"nothing"}}};

export const snNginxHealthCheck: ADL.ScopedName = {moduleName:"nginx", name:"NginxHealthCheck"};

export function texprNginxHealthCheck(): ADL.ATypeExpr<NginxHealthCheck> {
  return {value : {typeRef : {kind: "reference", value : snNginxHealthCheck}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "nginx.NginxConfContext" : NginxConfContext_AST,
  "nginx.NginxEndPoint" : NginxEndPoint_AST,
  "nginx.NginxHttpEndPoint" : NginxHttpEndPoint_AST,
  "nginx.NginxHttpsEndPoint" : NginxHttpsEndPoint_AST,
  "nginx.NginxHealthCheck" : NginxHealthCheck_AST
};
