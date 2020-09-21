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
  const releaseConfig = makeReleaseConfig({
    templates: ["docker-compose.yml.tpl"],
    prestartCommand: "",
    startCommand: "touch start && docker-compose up -d && touch started",
    stopCommand: "docker-compose kill && docker-compose rm -f",
  });

  const zip = new JSZip();
  zipAddReleaseJson(zip, releaseConfig);
  zip.file(
    "docker-compose.yml.tpl",
    `version: '2.1'
services:
  webserver:
    image: httpd:2.4-alpine
    ports:
      - {{ports.http}}:80
    volumes:
      - ./:/usr/local/apache2/htdocs/:ro
  `
  );
  zip.file(testfilePath, testfileContents);
  return zip;
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

        remoteStateS3: makeMaybe<string, "nothing">("nothing", null),

        dynamicPortRange: makePair({ v1: 8090, v2: 8099 }),
        slaveLabel: makeMachineLabel("label", "testslave"),
      })
    ),
  });
}

describe(`Run httpd-proxy-local`, () => {
  const testSetup: TestSetup = {
    randomstr: uuid(),
    dataDirs: null,
    mode: "local",
  };
  beforeEach(async () => {
    await setupTest(`httpd-proxy-local`, testSetup);
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

    await writeToolConfig(testSetup, makeConfig(testSetup), "single");
    const c2machine = new C2Exec(dataDirs, "single");
    for (const rel of releases) {
      console.log("c2 start release", rel.releaseName);
      await c2machine.start(rel.releaseName);
      await c2machine.connect(rel.endpoint, rel.releaseName);
    }

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
          console.error("http get file test error, retrying...");
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
      await c2machine!.disconnect(rel.endpoint);
      await c2machine!.stop(rel.releaseName);
    }

    // for test cleanup
    await c2machine.terminate();

    console.log("stopping...");
  });
});

// problems with testing:
//    ports in use
//    docker fills up with too many networks
