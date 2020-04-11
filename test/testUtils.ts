import fsx from 'fs-extra';
import path from 'path';
import { BlobStoreConfig, ToolConfig, texprToolConfig, makeBlobStoreConfig } from './adl-gen/config';
import {exec, ExecOptions} from 'child_process'
import { createJsonBinding } from './adl-gen/runtime/json';
import { RESOLVER } from './adl-gen/resolver';
import JSZip from 'jszip';
import { ReleaseConfig, texprReleaseConfig } from './adl-gen/release';

export type DirPath = string;
export type FilePath = string;

export type TestDataPaths = {
  dirs: DirPath[],
  workdir: DirPath;
  machineOpt: DirPath;
  machineOptBin: DirPath;
  machineOptEtc: DirPath;
  machineOptDeploys: DirPath;
  machineOptDeploysCurrent: DirPath;
  mockS3: DirPath;
  mockS3Configs: DirPath;
  config: {
    deploysDir: DirPath;
    contextCache: DirPath;
    logFile: FilePath;
    releases: BlobStoreConfig
  }
};
export type TestSetup = {
  dataDirs: TestDataPaths|null;
};


/// Copy C2 binary to test workdir emulating deployed machine /opt/bin
export async function installC2Binary(dataDirs: TestDataPaths) {
  await fsx.copyFile(path.join(__dirname, 'c2'), path.join(dataDirs.machineOptBin, 'c2'));
}

/// Create filesystem directories in dataDirs.dirs
export async function makeTestDataDirs(dataDirs: TestDataPaths) : Promise<void> {
  await Promise.all(dataDirs.dirs.map(d => fsx.mkdirp(d)));
}

/// Helper for tool config's directories and other paths used in testing
export function makeTestDataParams(name: string, randomstr: string, mode: "local"|"remote") : TestDataPaths {
  const workdir = path.join(__dirname, 'tests', name, randomstr);
  const machineOpt = path.join(workdir,'machine','opt');
  const machineOptBin = path.join(machineOpt,'bin');
  const machineOptEtc = path.join(machineOpt,'etc');
  const machineOptDeploys = path.join(machineOpt,'deploys');
  const machineOptDeploysCurrent = path.join(machineOptDeploys,'current');
  const deploysDir = path.join(machineOpt,'deploys');
  const contextCache = path.join(machineOpt,'contextCache');
  const mockS3 = path.join(workdir,'mockS3');
  const mockS3Releases = path.join(mockS3,'releases');
  const mockS3Configs = path.join(mockS3,'configs');

  return {
    dirs: [
      workdir,
      machineOpt,
      machineOptBin,
      machineOptEtc,
      machineOptDeploys,
      deploysDir,
      contextCache,
      mockS3,
      mockS3Releases,
      mockS3Configs
    ],
    workdir,
    machineOpt,
    machineOptBin,
    machineOptEtc,
    machineOptDeploys,
    machineOptDeploysCurrent,
    config: {
      deploysDir,
      contextCache,
      logFile: path.join(machineOpt,'camus2.log'),
      releases: (mode === 'local') ?
        makeBlobStoreConfig('localdir', mockS3Releases) :
        makeBlobStoreConfig('s3', "TODO")
    },
    mockS3,
    mockS3Configs
  };
}

export async function execShellCommand(cmd: string, options: ExecOptions = {}) : Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject({
          cmd,
          error,
          stdout,
          stderr,
        });
      }
      resolve();
    });
  });
}

export async function writeToolConfig(dataDirs: TestDataPaths, toolConfig: ToolConfig) : Promise<void> {
  const jsonBinding = createJsonBinding(RESOLVER, texprToolConfig());
  await fsx.writeJSON(path.join(dataDirs.machineOptEtc,'camus2.json'), jsonBinding.toJson(toolConfig));
}

export async function setupTest(
  name: string,
  randomstr: string,
  testSetup: TestSetup,
  mode: "local"|"remote"
): Promise<void> {
  testSetup.dataDirs = makeTestDataParams(name, randomstr, mode);
  await makeTestDataDirs(testSetup.dataDirs);
  await installC2Binary(testSetup.dataDirs);
}

export async function tearDownTest(
  testSetup: TestSetup,
): Promise<void> {
  if(testSetup.dataDirs) {
    if(!process.env["KEEPTESTDIRS"]) {
      await fsx.remove(testSetup.dataDirs.workdir);
    }
  }
}

export function zipAddReleaseJson(zip: JSZip, releaseConfig: ReleaseConfig) {
  const jsonBinding = createJsonBinding(RESOLVER, texprReleaseConfig());
  zip.file("release.json", JSON.stringify(jsonBinding.toJson(releaseConfig)));
}

export async function writeReleaseZip(dataDirs: TestDataPaths, zip: JSZip, name="release.zip") : Promise<void> {
  await fsx.writeFile(
    path.join(dataDirs.config.releases.value, name),
    await zip.generateAsync({
      type: "nodebuffer",
    })
  );
}

export class C2Exec {
  constructor(public dataDirs: TestDataPaths){};

  async listReleases() : Promise<void> {
    await this.exec(["list-releases"]);
  }

  async start(release:string) : Promise<void> {
    await this.exec(["start",release]);
  }

  async stop(release:string) : Promise<void> {
    await this.exec(["stop",release]);
  }

  private c2() : string {
    return path.join(this.dataDirs.machineOptBin, "c2");
  }

  private async exec(cmds: string[]) : Promise<void> {
    await execShellCommand(
      [this.c2()].concat(cmds).join(" "),
      {
        cwd: this.dataDirs.machineOptBin,
      }
    );
  }
}
