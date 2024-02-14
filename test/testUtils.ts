import fsx from "fs-extra";
import path from "path";
import {
  BlobStoreConfig,
  ToolConfig,
  texprToolConfig,
  makeBlobStoreConfig,
} from "./adl-gen/config";
import { exec, ExecOptions, ChildProcess, spawn } from "child_process";
import { createJsonBinding } from "./adl-gen/runtime/json";
import { RESOLVER } from "./adl-gen/resolver";
import JSZip from "jszip";
import {
  ReleaseConfig,
  texprReleaseConfig,
  makeReleaseConfig,
} from "./adl-gen/release";
import AWS, { Endpoint } from "aws-sdk";
import retry from "promise-retry";

export type DirPath = string;
export type FilePath = string;

export type TestDataPaths = {
  mkdirs: DirPath[];
  workdir: DirPath;
  machineOpt: DirPath;
  machineOptBin: DirPath;
  machineOptEtc: DirPath;
  machineOptDeploys: DirPath;
  machineOptDeploysCurrent: DirPath;
  mockS3: DirPath;
  mockS3Configs: DirPath;
  controllerOpt: DirPath;
  controllerOptBin: DirPath;
  controllerOptEtc: DirPath;
  config: {
    deploysDir: DirPath;
    contextCache: DirPath;
    logFile: FilePath;
    releases: BlobStoreConfig;
  };
};
export type TestSetup = {
  randomstr: string;
  dataDirs: TestDataPaths | null;
  mode: "local" | "remote";
};

/// Copy C2 binary to test workdir emulating deployed machine /opt/bin
export async function installC2Binary(dataDirs: TestDataPaths) {
  await fsx.copyFile(
    path.join(__dirname, "c2"),
    path.join(dataDirs.machineOptBin, "c2")
  );
  await fsx.copyFile(
    path.join(__dirname, "c2"),
    path.join(dataDirs.controllerOptBin, "c2")
  );
}

/// Create filesystem directories in dataDirs.dirs
export async function makeTestDataDirs(dataDirs: TestDataPaths): Promise<void> {
  await Promise.all(dataDirs.mkdirs.map((d) => fsx.mkdirp(d)));
}

export const localstack: {
  dockerCompose: ChildProcess | null;
  s3: AWS.S3 | null;
  bucket: string;
  prefix: string;
  port: number;
  host: string;
} = {
  dockerCompose: null,
  s3: null,
  bucket: "mocks3Bucket", // use lowercase
  prefix: "some/path/in/mock/bucket",
  port: 4572, // default port for localstack s3 (also exposed out in docker-compose.yml)
  host: "localhost",
};

/// Helper for tool config's directories and other paths used in testing
export function makeTestDataParams(
  name: string,
  randomstr: string,
  mode: "local" | "remote"
): TestDataPaths {
  const workdir = path.join(__dirname, "tests", name, randomstr);
  const machineOpt = path.join(workdir, "machine", "opt");
  const machineOptBin = path.join(machineOpt, "bin");
  const machineOptEtc = path.join(machineOpt, "etc");
  const machineOptDeploys = path.join(machineOpt, "deploys");
  const machineOptDeploysCurrent = path.join(machineOptDeploys, "current");
  const deploysDir = path.join(machineOpt, "deploys");
  const contextCache = path.join(machineOpt, "contextCache");
  const mockS3 = path.join(workdir, "mockS3");
  const mockS3Releases = path.join(mockS3, "releases");
  const mockS3Configs = path.join(mockS3, "configs");

  const controllerOpt = path.join(workdir, "controller", "opt");
  const controllerOptBin = path.join(controllerOpt, "bin");
  const controllerOptEtc = path.join(controllerOpt, "etc");

  return {
    mkdirs: [
      workdir,
      machineOpt,
      machineOptBin,
      machineOptEtc,
      machineOptDeploys,
      deploysDir,
      contextCache,
      mockS3,
      mockS3Releases,
      mockS3Configs,
      controllerOpt,
      controllerOptBin,
      controllerOptEtc,
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
      logFile: path.join(machineOpt, "camus2.log"),
      releases:
        mode === "local"
          ? makeBlobStoreConfig("localdir", mockS3Releases)
          : makeBlobStoreConfig(
              "s3",
              "s3://" + localstack.bucket + "/" + localstack.prefix
            ),
    },
    mockS3,
    mockS3Configs,
    controllerOpt,
    controllerOptBin,
    controllerOptEtc,
  };
}

export async function execShellCommand(
  cmd: string,
  options: ExecOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(cmd);
    exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        reject({
          cmd,
          error,
          stdout,
          stderr,
        });
      }
      console.log(stdout);
      resolve();
    });
  });
}

/** Save c2 tool config to machine and/or controller */
export async function writeToolConfig(
  setup: TestSetup,
  toolConfig: ToolConfig,
  mode: "single" | "controller" | "target"
): Promise<void> {
  const jsonBinding = createJsonBinding(RESOLVER, texprToolConfig());

  if (mode === "single" || mode === "target") {
    await fsx.writeJSON(
      path.join(setup.dataDirs!.machineOptEtc, "camus2.json"),
      jsonBinding.toJson(toolConfig)
    );
  }
  if (mode === "controller") {
    await fsx.writeJSON(
      path.join(setup.dataDirs!.controllerOptEtc, "camus2.json"),
      jsonBinding.toJson(toolConfig)
    );
  }
}

/** Configure jest to start localstack for S3 use in tests */
export function useLocalStack() {
  // localstack is too slow to start and stop - moved setup of localstack outside of jest
  const useInlineLocalstack = false;

  beforeAll(async () => {
    if (useInlineLocalstack) {
      console.log("starting localstack");
      localstack.dockerCompose = spawn("docker compose", ["up"], {
        detached: true,
        cwd: path.join(__dirname, "localstack"),
      });
    } else {
      console.log("using external localstack");
    }
    const endpoint = `http://${localstack.host}:${localstack.port}`;
    console.log("Connecting to AWS via ", endpoint);
    localstack.s3 = new AWS.S3({
      endpoint
    });
    await retry(async function (retry, number) {
      try {
        // create bucket if not already present
        const listBucketsResp = await localstack.s3!.listBuckets().promise();
        const bucketNames: string[] = listBucketsResp.Buckets!.map(
          (b) => b.Name!
        );

        if (bucketNames.filter((bn) => bn === localstack.bucket).length === 0) {
          await localstack
            .s3!.createBucket({
              Bucket: localstack.bucket,
            })
            .promise();
        }
      } catch (error) {
        console.log("Failed to create s3 bucket, retrying...:", JSON.stringify(localstack),  error);
        return retry(error);
      }
    });
  });
  afterAll(async () => {
    if (useInlineLocalstack) {
      // kill and wait for exit
      await Promise.all([
        new Promise((resolve) => {
          localstack.dockerCompose?.on("exit", () => {
            resolve();
          });
        }),
        localstack.dockerCompose?.kill(),
      ]);
    }
  });
}

/** Wrapper beforeAll helper */
export async function setupTest(
  name: string,
  testSetup: TestSetup
): Promise<void> {
  testSetup.dataDirs = makeTestDataParams(
    name,
    testSetup.randomstr,
    testSetup.mode
  );
  await makeTestDataDirs(testSetup.dataDirs);
  await installC2Binary(testSetup.dataDirs);
}

export async function tearDownTest(testSetup: TestSetup): Promise<void> {
  if (testSetup.dataDirs) {
    if (!process.env["KEEPTESTDIRS"]) {
      await fsx.remove(testSetup.dataDirs.workdir);
    }
  }
}

/** Helper for inserting the release.json in a JSZip archive */
export function zipAddReleaseJson(zip: JSZip, releaseConfig: ReleaseConfig) {
  const jsonBinding = createJsonBinding(RESOLVER, texprReleaseConfig());
  zip.file("release.json", JSON.stringify(jsonBinding.toJson(releaseConfig)));
}

/** Helper for saving release zip to directories / localstack S3 for the tests */
export async function writeReleaseZip(
  setup: TestSetup,
  zip: JSZip,
  name = "release.zip"
): Promise<void> {
  console.log("saving releasezip", name);
  let dest = path.join(setup.dataDirs!.config.releases.value, name);

  if (setup.mode === "remote") {
    dest = path.join(setup.dataDirs?.mockS3!, name);
  }

  await fsx.writeFile(
    dest,
    await zip.generateAsync({
      type: "nodebuffer",
    })
  );

  if (setup.mode === "remote") {
    await localstack
      .s3!.putObject({
        Key: localstack.prefix + "/" + name,
        Bucket: localstack.bucket,
        Body: await fsx.readFile(dest),
      })
      .promise();
  }
}

/// Release zip of a simple http server
export function makeReleaseHttpd(
  setup: TestSetup,
  exposedPort: string,
  testfilePath: string,
  testfileContents: string
): JSZip {
  const releaseConfig = makeReleaseConfig({
    templates: ["docker-compose.yml.tpl"],
    prestartCommand: "",
    startCommand: "touch start && docker compose up -d && touch started",
    stopCommand: "docker compose kill && docker compose rm -f",
  });

  const zip = new JSZip();
  zipAddReleaseJson(zip, releaseConfig);
  zip.file(
    "docker-compose.yml.tpl",
    `
version: '2.1'
services:
  webserver:
    image: httpd:2.4-alpine
    ports:
      - ${exposedPort}:80
    volumes:
      - ./:/usr/local/apache2/htdocs/:ro
  `
  );

  // A file which will be availble on the http server for testing
  zip.file(testfilePath, testfileContents);
  return zip;
}

export function defaultDeployName(releasename: string): string {
  return path.parse(releasename).name;
}
