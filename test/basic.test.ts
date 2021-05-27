import { makeReleaseConfig } from "./adl-gen/release";
import JSZip from "jszip";
import fsx from "fs-extra";
import { v4 as uuid } from "uuid";
import path from "path";
import { makeToolConfig, makeDeployMode, ToolConfig } from "./adl-gen/config";

import {
  TestSetup,
  writeToolConfig,
  setupTest,
  tearDownTest,
  zipAddReleaseJson,
  writeReleaseZip,
} from "./testUtils";
import { C2Exec } from "./C2Exec";

/// Trivial release with no contents except the release.json - actions just touch files
function makeRelease(setup: TestSetup): JSZip {
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
function makeConfig(setup: TestSetup): ToolConfig {
  return makeToolConfig({
    ...setup.dataDirs!.config,
    deployMode: makeDeployMode("noproxy", null),
  });
}

for (const remoteMode of ["local", "remote"] as const) {
  describe(`Run remote mode ${remoteMode}`, () => {
    const testSetup: TestSetup = {
      randomstr: uuid(),
      dataDirs: null,
      mode: remoteMode,
    };
    beforeEach(async () => {
      await setupTest(`basic-${remoteMode}`, testSetup);
    });
    afterEach(async () => {
      await tearDownTest(testSetup);
    });

    test("Run through config release and run of a trivial deployment", async () => {
      const dataDirs = testSetup.dataDirs!;
      await writeReleaseZip(testSetup, makeRelease(testSetup));

      await writeToolConfig(testSetup, makeConfig(testSetup), "single");

      const c2 = new C2Exec(dataDirs, "single");

      await c2.start("release.zip");
      expect(
        await fsx.pathExists(
          path.join(dataDirs.machineOptDeploys, "release", "prestarted")
        )
      ).toBeTruthy();
      expect(
        await fsx.pathExists(
          path.join(dataDirs.machineOptDeploys, "release", "started")
        )
      ).toBeTruthy();

      await c2.stop("release.zip");
      expect(
        await fsx.pathExists(
          path.join(dataDirs.machineOptDeploys, "release", "stopped")
        )
      ).toBeTruthy();
    });
  });
}
