import { makeReleaseConfig } from "./adl-gen/release";
import JSZip from "jszip";
import fsx from "fs-extra";
import { v4 as uuid } from "uuid";
import path from "path";
import { makeToolConfig, makeDeployMode, ToolConfig } from "./adl-gen/config";
import axios from "axios";

import {
  TestSetup,
  writeToolConfig,
  setupTest,
  tearDownTest,
  zipAddReleaseJson,
  writeReleaseZip,
  makeReleaseHttpd,
} from "./testUtils";
import { C2Exec } from "./C2Exec";
import promiseRetry from "promise-retry";

const localHttpPort = 8081;
const testfilePath = "testfile.txt";
const testfileContents = "testfilecontents";

/// Trivial tool config with no special options
function makeConfig(setup: TestSetup): ToolConfig {
  return makeToolConfig({
    ...setup.dataDirs!.config,
    deployMode: makeDeployMode("noproxy", null),
  });
}

for (const remoteMode of ["remote", "local"] as const) {
  describe(`Run release mode ${remoteMode}`, () => {
    const testSetup: TestSetup = {
      randomstr: uuid(),
      dataDirs: null,
      mode: remoteMode,
    };
    beforeEach(async () => {
      await setupTest(`httpd-${remoteMode}`, testSetup);
    });
    afterEach(async () => {
      await tearDownTest(testSetup);
    });
    test("Config and deployment of a httpd server", async () => {
      const dataDirs = testSetup.dataDirs!;
      await writeReleaseZip(
        testSetup,
        makeReleaseHttpd(
          testSetup,
          `${localHttpPort}`,
          testfilePath,
          testfileContents
        ),
        testSetup.randomstr
      );

      await writeToolConfig(testSetup, makeConfig(testSetup), "single");

      const c2 = new C2Exec(dataDirs, "single");

      console.log("c2 start release");
      await c2.start(testSetup.randomstr);

      expect(
        await fsx.pathExists(
          path.join(dataDirs.machineOptDeploys, testSetup.randomstr, "started")
        )
      ).toBeTruthy();

      console.log("http get file test start");
      const res = await promiseRetry(async (retry) => {
        try {
          console.log("try http get file test");
          const res = await axios.get(
            `http://localhost:${localHttpPort}/${testfilePath}`
          );
          return res;
        } catch (error) {
          console.error("http get file test error, retrying ... ", error);
          retry(error);
        }
      });

      expect(res).toBeTruthy();
      if (res) {
        expect(res.data).toEqual(testfileContents);
      }

      console.log("test OK");

      await c2.stop("release.zip");
      console.log("stopping...");
    });
  });
}
