/* @generated from adl module config */

import * as ADL from './runtime/adl';
import * as sys_types from './sys/types';
import * as types from './types';

/**
 * Configuration file for the deployment tool
 */
export interface ToolConfig {
  deploysDir: types.FilePath;
  contextCache: types.FilePath;
  logFile: types.FilePath;
  letsencryptPrefixDir: types.FilePath;
  letsencryptWwwDir: types.FilePath;
  /**
   * If the deploy tool needs to generate an SSL certificate
   * using letsencrypt, it will be called this.
   */
  autoCertName: string;
  autoCertContactEmail: string;
  /**
   * The storage location for release zip files
   */
  releases: BlobStoreConfig;
  /**
   * Static config sources
   */
  configSources: types.StringKeyMap<types.StaticConfigName, JsonSource>;
  deployMode: DeployMode;
  healthCheck: sys_types.Maybe<HealthCheckConfig>;
  /**
   * The image of nginx to use
   */
  nginxDockerImage: string;
  /**
   * The version of the standard nginx docker image to use
   */
  nginxDockerVersion: string;
}

export function makeToolConfig(
  input: {
    deploysDir?: types.FilePath,
    contextCache?: types.FilePath,
    logFile?: types.FilePath,
    letsencryptPrefixDir?: types.FilePath,
    letsencryptWwwDir?: types.FilePath,
    autoCertName?: string,
    autoCertContactEmail?: string,
    releases: BlobStoreConfig,
    configSources?: types.StringKeyMap<types.StaticConfigName, JsonSource>,
    deployMode?: DeployMode,
    healthCheck?: sys_types.Maybe<HealthCheckConfig>,
    nginxDockerImage?: string,
    nginxDockerVersion?: string,
  }
): ToolConfig {
  return {
    deploysDir: input.deploysDir === undefined ? "/opt/deploys" : input.deploysDir,
    contextCache: input.contextCache === undefined ? "/opt/config" : input.contextCache,
    logFile: input.logFile === undefined ? "/opt/var/log/camus2.log" : input.logFile,
    letsencryptPrefixDir: input.letsencryptPrefixDir === undefined ? "/opt" : input.letsencryptPrefixDir,
    letsencryptWwwDir: input.letsencryptWwwDir === undefined ? "/opt/var/www" : input.letsencryptWwwDir,
    autoCertName: input.autoCertName === undefined ? "camus2cert" : input.autoCertName,
    autoCertContactEmail: input.autoCertContactEmail === undefined ? "" : input.autoCertContactEmail,
    releases: input.releases,
    configSources: input.configSources === undefined ? {} : input.configSources,
    deployMode: input.deployMode === undefined ? {kind : "noproxy"} : input.deployMode,
    healthCheck: input.healthCheck === undefined ? {kind : "just", value : {incomingPath : "/health-check", outgoingPath : "/", endpoint : {kind : "nothing"}}} : input.healthCheck,
    nginxDockerImage: input.nginxDockerImage === undefined ? "nginx" : input.nginxDockerImage,
    nginxDockerVersion: input.nginxDockerVersion === undefined ? "1.21.3" : input.nginxDockerVersion,
  };
}

const ToolConfig_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"deploysDir","default":{"kind":"just","value":"/opt/deploys"},"name":"deploysDir","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}},{"annotations":[],"serializedName":"contextCache","default":{"kind":"just","value":"/opt/config"},"name":"contextCache","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}},{"annotations":[],"serializedName":"logFile","default":{"kind":"just","value":"/opt/var/log/camus2.log"},"name":"logFile","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}},{"annotations":[],"serializedName":"letsencryptPrefixDir","default":{"kind":"just","value":"/opt"},"name":"letsencryptPrefixDir","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}},{"annotations":[],"serializedName":"letsencryptWwwDir","default":{"kind":"just","value":"/opt/var/www"},"name":"letsencryptWwwDir","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}},{"annotations":[],"serializedName":"autoCertName","default":{"kind":"just","value":"camus2cert"},"name":"autoCertName","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"autoCertContactEmail","default":{"kind":"just","value":""},"name":"autoCertContactEmail","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"releases","default":{"kind":"nothing"},"name":"releases","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"config","name":"BlobStoreConfig"}},"parameters":[]}},{"annotations":[],"serializedName":"configSources","default":{"kind":"just","value":{}},"name":"configSources","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"StringKeyMap"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"StaticConfigName"}},"parameters":[]},{"typeRef":{"kind":"reference","value":{"moduleName":"config","name":"JsonSource"}},"parameters":[]}]}},{"annotations":[],"serializedName":"deployMode","default":{"kind":"just","value":"noproxy"},"name":"deployMode","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"config","name":"DeployMode"}},"parameters":[]}},{"annotations":[],"serializedName":"healthCheck","default":{"kind":"just","value":{"just":{"outgoingPath":"/","incomingPath":"/health-check"}}},"name":"healthCheck","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"sys.types","name":"Maybe"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"config","name":"HealthCheckConfig"}},"parameters":[]}]}},{"annotations":[],"serializedName":"nginxDockerImage","default":{"kind":"just","value":"nginx"},"name":"nginxDockerImage","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"nginxDockerVersion","default":{"kind":"just","value":"1.21.3"},"name":"nginxDockerVersion","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}]}},"name":"ToolConfig","version":{"kind":"nothing"}}};

export const snToolConfig: ADL.ScopedName = {moduleName:"config", name:"ToolConfig"};

export function texprToolConfig(): ADL.ATypeExpr<ToolConfig> {
  return {value : {typeRef : {kind: "reference", value : snToolConfig}, parameters : []}};
}

export interface DeployMode_Noproxy {
  kind: 'noproxy';
}
export interface DeployMode_Proxy {
  kind: 'proxy';
  value: ProxyModeConfig;
}

export type DeployMode = DeployMode_Noproxy | DeployMode_Proxy;

export interface DeployModeOpts {
  noproxy: null;
  proxy: ProxyModeConfig;
}

export function makeDeployMode<K extends keyof DeployModeOpts>(kind: K, value: DeployModeOpts[K]) { return {kind, value}; }

const DeployMode_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"noproxy","default":{"kind":"nothing"},"name":"noproxy","typeExpr":{"typeRef":{"kind":"primitive","value":"Void"},"parameters":[]}},{"annotations":[],"serializedName":"proxy","default":{"kind":"nothing"},"name":"proxy","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"config","name":"ProxyModeConfig"}},"parameters":[]}}]}},"name":"DeployMode","version":{"kind":"nothing"}}};

export const snDeployMode: ADL.ScopedName = {moduleName:"config", name:"DeployMode"};

export function texprDeployMode(): ADL.ATypeExpr<DeployMode> {
  return {value : {typeRef : {kind: "reference", value : snDeployMode}, parameters : []}};
}

export interface BlobStoreConfig_S3 {
  kind: 's3';
  value: types.S3Path;
}
export interface BlobStoreConfig_Localdir {
  kind: 'localdir';
  value: types.FilePath;
}

export type BlobStoreConfig = BlobStoreConfig_S3 | BlobStoreConfig_Localdir;

export interface BlobStoreConfigOpts {
  s3: types.S3Path;
  localdir: types.FilePath;
}

export function makeBlobStoreConfig<K extends keyof BlobStoreConfigOpts>(kind: K, value: BlobStoreConfigOpts[K]) { return {kind, value}; }

const BlobStoreConfig_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"s3","default":{"kind":"nothing"},"name":"s3","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"S3Path"}},"parameters":[]}},{"annotations":[],"serializedName":"localdir","default":{"kind":"nothing"},"name":"localdir","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}}]}},"name":"BlobStoreConfig","version":{"kind":"nothing"}}};

export const snBlobStoreConfig: ADL.ScopedName = {moduleName:"config", name:"BlobStoreConfig"};

export function texprBlobStoreConfig(): ADL.ATypeExpr<BlobStoreConfig> {
  return {value : {typeRef : {kind: "reference", value : snBlobStoreConfig}, parameters : []}};
}

export interface ProxyModeConfig {
  /**
   * The configured endpoints.
   */
  endPoints: types.StringKeyMap<types.EndPointLabel, EndPoint>;
  /**
   * If set, we are in remote mode, with state stored at this S3 path
   */
  remoteStateS3: sys_types.Maybe<types.S3Path>;
  /**
   * When we start deploys we choose a port from this range
   */
  dynamicPortRange: sys_types.Pair<number, number>;
  /**
   * How we generate identifiers for slave machines
   */
  slaveLabel: MachineLabel;
  slaveInterfaceName: string;
  /**
   * The mustache template to used be for the proxy nginx configuration
   * If not provided the builtin template will be used.
   */
  nginxConfTemplatePath: sys_types.Maybe<types.FilePath>;
}

export function makeProxyModeConfig(
  input: {
    endPoints: types.StringKeyMap<types.EndPointLabel, EndPoint>,
    remoteStateS3?: sys_types.Maybe<types.S3Path>,
    dynamicPortRange?: sys_types.Pair<number, number>,
    slaveLabel?: MachineLabel,
    slaveInterfaceName?: string,
    nginxConfTemplatePath?: sys_types.Maybe<types.FilePath>,
  }
): ProxyModeConfig {
  return {
    endPoints: input.endPoints,
    remoteStateS3: input.remoteStateS3 === undefined ? {kind : "nothing"} : input.remoteStateS3,
    dynamicPortRange: input.dynamicPortRange === undefined ? {v1 : 8000, v2 : 8100} : input.dynamicPortRange,
    slaveLabel: input.slaveLabel === undefined ? {kind : "ec2InstanceId"} : input.slaveLabel,
    slaveInterfaceName: input.slaveInterfaceName === undefined ? "eth0" : input.slaveInterfaceName,
    nginxConfTemplatePath: input.nginxConfTemplatePath === undefined ? {kind : "nothing"} : input.nginxConfTemplatePath,
  };
}

const ProxyModeConfig_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"endPoints","default":{"kind":"nothing"},"name":"endPoints","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"StringKeyMap"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"EndPointLabel"}},"parameters":[]},{"typeRef":{"kind":"reference","value":{"moduleName":"config","name":"EndPoint"}},"parameters":[]}]}},{"annotations":[],"serializedName":"remoteStateS3","default":{"kind":"just","value":"nothing"},"name":"remoteStateS3","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"sys.types","name":"Maybe"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"S3Path"}},"parameters":[]}]}},{"annotations":[],"serializedName":"dynamicPortRange","default":{"kind":"just","value":{"v1":8000,"v2":8100}},"name":"dynamicPortRange","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"sys.types","name":"Pair"}},"parameters":[{"typeRef":{"kind":"primitive","value":"Word32"},"parameters":[]},{"typeRef":{"kind":"primitive","value":"Word32"},"parameters":[]}]}},{"annotations":[],"serializedName":"slaveLabel","default":{"kind":"just","value":"ec2InstanceId"},"name":"slaveLabel","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"config","name":"MachineLabel"}},"parameters":[]}},{"annotations":[],"serializedName":"slaveInterfaceName","default":{"kind":"just","value":"eth0"},"name":"slaveInterfaceName","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"nginxConfTemplatePath","default":{"kind":"just","value":"nothing"},"name":"nginxConfTemplatePath","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"sys.types","name":"Maybe"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}]}}]}},"name":"ProxyModeConfig","version":{"kind":"nothing"}}};

export const snProxyModeConfig: ADL.ScopedName = {moduleName:"config", name:"ProxyModeConfig"};

export function texprProxyModeConfig(): ADL.ATypeExpr<ProxyModeConfig> {
  return {value : {typeRef : {kind: "reference", value : snProxyModeConfig}, parameters : []}};
}

export interface HealthCheckConfig {
  /**
   * a health check;
   */
  incomingPath: string;
  /**
   * The path to which will will proxy the above on the c2 deployment
   */
  outgoingPath: string;
  endpoint: sys_types.Maybe<types.EndPointLabel>;
}

export function makeHealthCheckConfig(
  input: {
    incomingPath: string,
    outgoingPath: string,
    endpoint?: sys_types.Maybe<types.EndPointLabel>,
  }
): HealthCheckConfig {
  return {
    incomingPath: input.incomingPath,
    outgoingPath: input.outgoingPath,
    endpoint: input.endpoint === undefined ? {kind : "nothing"} : input.endpoint,
  };
}

const HealthCheckConfig_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"incomingPath","default":{"kind":"nothing"},"name":"incomingPath","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"outgoingPath","default":{"kind":"nothing"},"name":"outgoingPath","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"endpoint","default":{"kind":"just","value":"nothing"},"name":"endpoint","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"sys.types","name":"Maybe"}},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"EndPointLabel"}},"parameters":[]}]}}]}},"name":"HealthCheckConfig","version":{"kind":"nothing"}}};

export const snHealthCheckConfig: ADL.ScopedName = {moduleName:"config", name:"HealthCheckConfig"};

export function texprHealthCheckConfig(): ADL.ATypeExpr<HealthCheckConfig> {
  return {value : {typeRef : {kind: "reference", value : snHealthCheckConfig}, parameters : []}};
}

export interface MachineLabel_Label {
  kind: 'label';
  value: string;
}
export interface MachineLabel_Ec2InstanceId {
  kind: 'ec2InstanceId';
}

export type MachineLabel = MachineLabel_Label | MachineLabel_Ec2InstanceId;

export interface MachineLabelOpts {
  label: string;
  ec2InstanceId: null;
}

export function makeMachineLabel<K extends keyof MachineLabelOpts>(kind: K, value: MachineLabelOpts[K]) { return {kind, value}; }

const MachineLabel_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"label","default":{"kind":"nothing"},"name":"label","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"ec2InstanceId","default":{"kind":"nothing"},"name":"ec2InstanceId","typeExpr":{"typeRef":{"kind":"primitive","value":"Void"},"parameters":[]}}]}},"name":"MachineLabel","version":{"kind":"nothing"}}};

export const snMachineLabel: ADL.ScopedName = {moduleName:"config", name:"MachineLabel"};

export function texprMachineLabel(): ADL.ATypeExpr<MachineLabel> {
  return {value : {typeRef : {kind: "reference", value : snMachineLabel}, parameters : []}};
}

export interface EndPoint {
  serverNames: string[];
  etype: EndPointType;
}

export function makeEndPoint(
  input: {
    serverNames: string[],
    etype: EndPointType,
  }
): EndPoint {
  return {
    serverNames: input.serverNames,
    etype: input.etype,
  };
}

const EndPoint_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"serverNames","default":{"kind":"nothing"},"name":"serverNames","typeExpr":{"typeRef":{"kind":"primitive","value":"Vector"},"parameters":[{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}]}},{"annotations":[],"serializedName":"etype","default":{"kind":"nothing"},"name":"etype","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"config","name":"EndPointType"}},"parameters":[]}}]}},"name":"EndPoint","version":{"kind":"nothing"}}};

export const snEndPoint: ADL.ScopedName = {moduleName:"config", name:"EndPoint"};

export function texprEndPoint(): ADL.ATypeExpr<EndPoint> {
  return {value : {typeRef : {kind: "reference", value : snEndPoint}, parameters : []}};
}

export interface EndPointType_HttpOnly {
  kind: 'httpOnly';
}
export interface EndPointType_HttpsWithRedirect {
  kind: 'httpsWithRedirect';
  value: SslCertMode;
}

export type EndPointType = EndPointType_HttpOnly | EndPointType_HttpsWithRedirect;

export interface EndPointTypeOpts {
  httpOnly: null;
  httpsWithRedirect: SslCertMode;
}

export function makeEndPointType<K extends keyof EndPointTypeOpts>(kind: K, value: EndPointTypeOpts[K]) { return {kind, value}; }

const EndPointType_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"httpOnly","default":{"kind":"nothing"},"name":"httpOnly","typeExpr":{"typeRef":{"kind":"primitive","value":"Void"},"parameters":[]}},{"annotations":[],"serializedName":"httpsWithRedirect","default":{"kind":"nothing"},"name":"httpsWithRedirect","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"config","name":"SslCertMode"}},"parameters":[]}}]}},"name":"EndPointType","version":{"kind":"nothing"}}};

export const snEndPointType: ADL.ScopedName = {moduleName:"config", name:"EndPointType"};

export function texprEndPointType(): ADL.ATypeExpr<EndPointType> {
  return {value : {typeRef : {kind: "reference", value : snEndPointType}, parameters : []}};
}

export interface SslCertMode_Generated {
  kind: 'generated';
}
export interface SslCertMode_Explicit {
  kind: 'explicit';
  value: SslCertPaths;
}

export type SslCertMode = SslCertMode_Generated | SslCertMode_Explicit;

export interface SslCertModeOpts {
  /**
   * Use letsencrypt to generate a certificate
   */
  generated: null;
  /**
   * Use the existing certificate from the given file system
   * paths
   */
  explicit: SslCertPaths;
}

export function makeSslCertMode<K extends keyof SslCertModeOpts>(kind: K, value: SslCertModeOpts[K]) { return {kind, value}; }

const SslCertMode_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"generated","default":{"kind":"nothing"},"name":"generated","typeExpr":{"typeRef":{"kind":"primitive","value":"Void"},"parameters":[]}},{"annotations":[],"serializedName":"explicit","default":{"kind":"nothing"},"name":"explicit","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"config","name":"SslCertPaths"}},"parameters":[]}}]}},"name":"SslCertMode","version":{"kind":"nothing"}}};

export const snSslCertMode: ADL.ScopedName = {moduleName:"config", name:"SslCertMode"};

export function texprSslCertMode(): ADL.ATypeExpr<SslCertMode> {
  return {value : {typeRef : {kind: "reference", value : snSslCertMode}, parameters : []}};
}

export interface SslCertPaths {
  sslCertificate: types.FilePath;
  sslCertificateKey: types.FilePath;
}

export function makeSslCertPaths(
  input: {
    sslCertificate: types.FilePath,
    sslCertificateKey: types.FilePath,
  }
): SslCertPaths {
  return {
    sslCertificate: input.sslCertificate,
    sslCertificateKey: input.sslCertificateKey,
  };
}

const SslCertPaths_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"sslCertificate","default":{"kind":"nothing"},"name":"sslCertificate","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}},{"annotations":[],"serializedName":"sslCertificateKey","default":{"kind":"nothing"},"name":"sslCertificateKey","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}}]}},"name":"SslCertPaths","version":{"kind":"nothing"}}};

export const snSslCertPaths: ADL.ScopedName = {moduleName:"config", name:"SslCertPaths"};

export function texprSslCertPaths(): ADL.ATypeExpr<SslCertPaths> {
  return {value : {typeRef : {kind: "reference", value : snSslCertPaths}, parameters : []}};
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
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"file","default":{"kind":"nothing"},"name":"file","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"FilePath"}},"parameters":[]}},{"annotations":[],"serializedName":"s3","default":{"kind":"nothing"},"name":"s3","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"types","name":"S3Path"}},"parameters":[]}},{"annotations":[],"serializedName":"awsSecretArn","default":{"kind":"nothing"},"name":"awsSecretArn","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}]}},"name":"JsonSource","version":{"kind":"nothing"}}};

export const snJsonSource: ADL.ScopedName = {moduleName:"config", name:"JsonSource"};

export function texprJsonSource(): ADL.ATypeExpr<JsonSource> {
  return {value : {typeRef : {kind: "reference", value : snJsonSource}, parameters : []}};
}

export enum Verbosity {
  quiet,
  noisy,
}

const Verbosity_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"quiet","default":{"kind":"nothing"},"name":"quiet","typeExpr":{"typeRef":{"kind":"primitive","value":"Void"},"parameters":[]}},{"annotations":[],"serializedName":"noisy","default":{"kind":"nothing"},"name":"noisy","typeExpr":{"typeRef":{"kind":"primitive","value":"Void"},"parameters":[]}}]}},"name":"Verbosity","version":{"kind":"nothing"}}};

export const snVerbosity: ADL.ScopedName = {moduleName:"config", name:"Verbosity"};

export function texprVerbosity(): ADL.ATypeExpr<Verbosity> {
  return {value : {typeRef : {kind: "reference", value : snVerbosity}, parameters : []}};
}

/**
 * Configuration specification for the letsencrypt related functions
 */
export interface LetsEncryptConfig {
  /**
   * The path to the install certbot executable
   */
  certbotPath: string;
  /**
   * The ID of the AWS hosted zone containing the SSL DNS entries
   */
  awsHostedZoneId: string;
  /**
   * The directory within which certbot will it's working files
   * and live certificates
   */
  basedir: string;
  /**
   * The email address that certbot will use for essential communications
   */
  email: string;
  /**
   * The fully scoped DNS names required on the certificate
   */
  domains: string[];
  /**
   * How much logging output to generate
   */
  verbosity: Verbosity;
}

export function makeLetsEncryptConfig(
  input: {
    certbotPath: string,
    awsHostedZoneId: string,
    basedir: string,
    email: string,
    domains: string[],
    verbosity?: Verbosity,
  }
): LetsEncryptConfig {
  return {
    certbotPath: input.certbotPath,
    awsHostedZoneId: input.awsHostedZoneId,
    basedir: input.basedir,
    email: input.email,
    domains: input.domains,
    verbosity: input.verbosity === undefined ? 0 : input.verbosity,
  };
}

const LetsEncryptConfig_AST : ADL.ScopedDecl =
  {"moduleName":"config","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"certbotPath","default":{"kind":"nothing"},"name":"certbotPath","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"awsHostedZoneId","default":{"kind":"nothing"},"name":"awsHostedZoneId","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"basedir","default":{"kind":"nothing"},"name":"basedir","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"email","default":{"kind":"nothing"},"name":"email","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"domains","default":{"kind":"nothing"},"name":"domains","typeExpr":{"typeRef":{"kind":"primitive","value":"Vector"},"parameters":[{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}]}},{"annotations":[],"serializedName":"verbosity","default":{"kind":"just","value":"quiet"},"name":"verbosity","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"config","name":"Verbosity"}},"parameters":[]}}]}},"name":"LetsEncryptConfig","version":{"kind":"nothing"}}};

export const snLetsEncryptConfig: ADL.ScopedName = {moduleName:"config", name:"LetsEncryptConfig"};

export function texprLetsEncryptConfig(): ADL.ATypeExpr<LetsEncryptConfig> {
  return {value : {typeRef : {kind: "reference", value : snLetsEncryptConfig}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "config.ToolConfig" : ToolConfig_AST,
  "config.DeployMode" : DeployMode_AST,
  "config.BlobStoreConfig" : BlobStoreConfig_AST,
  "config.ProxyModeConfig" : ProxyModeConfig_AST,
  "config.HealthCheckConfig" : HealthCheckConfig_AST,
  "config.MachineLabel" : MachineLabel_AST,
  "config.EndPoint" : EndPoint_AST,
  "config.EndPointType" : EndPointType_AST,
  "config.SslCertMode" : SslCertMode_AST,
  "config.SslCertPaths" : SslCertPaths_AST,
  "config.JsonSource" : JsonSource_AST,
  "config.Verbosity" : Verbosity_AST,
  "config.LetsEncryptConfig" : LetsEncryptConfig_AST
};
