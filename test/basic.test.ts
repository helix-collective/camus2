import { makeReleaseConfig } from "./adl-gen/release";
import JSZip from "jszip";
import fsx from "fs-extra";
import { v4 as uuid } from "uuid";
import path from "path";
import { makeToolConfig, makeDeployMode, ToolConfig } from "./adl-gen/config";

import {
  TestSetup,
  TestDataPaths,
  writeToolConfig,
  setupTest,
  tearDownTest,
  zipAddReleaseJson,
  writeReleaseZip,
  C2Exec,
} from "./testUtils";

/// Trivial release wit no contents except the release.json - actions just touch files
function makeRelease(dataDirs: TestDataPaths) : JSZip {
  const releaseConfig = makeReleaseConfig({
    templates: [],
    prestartCommand: "touch prestarted",
    startCommand: "touch started",
    stopCommand: "touch stopped",
  });

  const zip = new JSZip();
  zipAddReleaseJson(zip, releaseConfig);
  return zip;
}

/// Trivial tool config with no special options
function makeConfig(dataDirs: TestDataPaths): ToolConfig {
  return makeToolConfig({
    ...dataDirs.config,
    deployMode: makeDeployMode("noproxy", null),
  });
}



describe("Run locally", async ()=>{
  const testSetup: TestSetup = {
    dataDirs: null,
  };
  beforeEach(async () => {
    await setupTest("basic", uuid(), testSetup, "local");
  });
  afterEach(async () => {
    await tearDownTest(testSetup);
  });

  test("Run through config release and run of a trivial deployment", async () => {
    const dataDirs = testSetup.dataDirs!;
    await writeReleaseZip(dataDirs, makeRelease(dataDirs));

    await writeToolConfig(dataDirs, makeConfig(dataDirs));

    const c2 = new C2Exec(dataDirs);

    await c2.start("release.zip");
    expect(await fsx.pathExists(path.join(dataDirs.machineOptDeploys,"release","prestarted")));
    expect(await fsx.pathExists(path.join(dataDirs.machineOptDeploys,"release","started")));

    await c2.stop("release.zip");
    expect(await fsx.pathExists(path.join(dataDirs.machineOptDeploys,"release","stopped")));
  });
});



