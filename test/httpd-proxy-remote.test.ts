import { makeReleaseConfig } from "./adl-gen/release";
import JSZip from "jszip";
import fsx from "fs-extra";
import { v4 as uuid } from "uuid";
import path from "path";
import {
  makeToolConfig,
  makeDeployMode,
  ToolConfig,
  makeProxyModeConfig,
  makeEndPoint,
  makeEndPointType,
  makeMachineLabel,
} from "./adl-gen/config";
import axios from "axios";

import {
  TestSetup,
  writeToolConfig,
  setupTest,
  tearDownTest,
  zipAddReleaseJson,
  writeReleaseZip,
  localstack,
  makeReleaseHttpd,
} from "./testUtils";
import { C2Exec } from "./C2Exec";
import promiseRetry from "promise-retry";
import { makeMaybe } from "./adl-gen/sys/types";
import { makePair } from "./adl-gen/runtime/sys/types";

const testfilePath = "testfile.txt";

/// Release zip of a simple http server
export function makeReleaseHttpdProxyMode(
  setup: TestSetup,
  testfileContents: string
): JSZip {
  return makeReleaseHttpd(
    setup,
    "{{ports.http}}",
    testfilePath,
    testfileContents
  );
}

/// Tool config with proxy mode
function makeConfig(setup: TestSetup): ToolConfig {
  return makeToolConfig({
    ...setup.dataDirs!.config,
    deployMode: makeDeployMode(
      "proxy",
      makeProxyModeConfig({
        endPoints: {
          main: makeEndPoint({
            serverNames: ["main.localhost"],
            etype: makeEndPointType("httpOnly", null),
          }),
          other: makeEndPoint({
            serverNames: ["other.localhost"],
            etype: makeEndPointType("httpOnly", null),
          }),
        },

        remoteStateS3: makeMaybe<string, "just">(
          "just",
          `s3://${localstack.bucket}/${localstack.prefix}/${setup.randomstr}/remotestate`
        ),

        dynamicPortRange: makePair({ v1: 8090, v2: 8099 }),
        slaveLabel: makeMachineLabel("label", "testslave"),
      })
    ),
  });
}

describe(`Run httpd-proxy-remote`, () => {
  const testSetup: TestSetup = {
    randomstr: uuid(),
    dataDirs: null,
    mode: "remote",
  };
  beforeEach(async () => {
    await setupTest(`httpd-proxy-remote`, testSetup);
  });
  afterEach(async () => {
    await tearDownTest(testSetup);
  });
  test("Config and deployment of a httpd server", async () => {
    const releases = [
      {
        releaseName: testSetup.randomstr + "A.zip",
        testcontents: "testcontentsA",
        endpoint: "main",
      },
      {
        releaseName: testSetup.randomstr + "B.zip",
        testcontents: "testcontentsB",
        endpoint: "other",
      },
    ];

    const dataDirs = testSetup.dataDirs!;

    // make several releases:
    for (const rel of releases) {
      await writeReleaseZip(
        testSetup,
        makeReleaseHttpdProxyMode(testSetup, rel.testcontents),
        rel.releaseName
      );
    }

    await writeToolConfig(testSetup, makeConfig(testSetup), "controller");
    await writeToolConfig(testSetup, makeConfig(testSetup), "target");

    const c2controller = new C2Exec(dataDirs, "controller");
    const c2machine = new C2Exec(dataDirs, "target");

    for (const rel of releases) {
      console.log("c2 start release", rel.releaseName);
      await c2controller.start(rel.releaseName);
      await c2controller.connect(rel.endpoint, rel.releaseName);
    }

    /// In deployment this happens on target machine periodically
    // for test - just run once after updateing remote config
    await c2machine.slaveUpdate();

    for (const rel of releases) {
      expect(
        await fsx.pathExists(
          path.join(dataDirs.machineOptDeploys, rel.releaseName, "started")
        )
      );
      console.log("http get file test start");

      const res = await promiseRetry(async (retry) => {
        try {
          console.log("try http get file test");
          const res = await axios.get(
            `http://${rel.endpoint}.localhost/${testfilePath}`
          );
          return res;
        } catch (error) {
          console.error("http get file test error");
          retry(error);
        }
      });

      expect(res);
      if (res) {
        expect(res.data).toEqual(rel.testcontents);
      }
    }

    console.log("test OK");

    for (const rel of releases) {
      await c2controller!.disconnect(rel.endpoint);
      await c2controller!.stop(rel.releaseName);
    }
    await c2machine.slaveUpdate();

    // for test cleanup
    await c2machine.terminate();

    console.log("stopping...");
  });
});

// problems with testing:
//    ports in use
//    docker fills up with too many networks
