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
  makeHealthCheckConfig
} from "./adl-gen/config";
import axios from "axios";

import {
  TestSetup,
  writeToolConfig,
  setupTest,
  tearDownTest,
  zipAddReleaseJson,
  writeReleaseZip,
  defaultDeployName
} from "./testUtils";
import { C2Exec } from "./C2Exec";
import promiseRetry from "promise-retry";
import { makeMaybe } from "./adl-gen/sys/types";
import { makePair } from "./adl-gen/runtime/sys/types";

const testfilePath = "testfile.txt";
const extrafilePath = "extrafile.txt";

/// Release zip of a simple http server
export function makeReleaseHttpdProxyMode(
  setup: TestSetup,
  testfileContents: string
): JSZip {
  const releaseConfig = makeReleaseConfig({
    templates: ["docker-compose.yml.tpl", extrafilePath + ".tpl"],
    prestartCommand: "",
    startCommand: "touch start && docker compose up -d && touch started",
    stopCommand: "docker compose kill && docker compose rm -f",
    configSources: {
       "releasevals" : "releasevals.json"
    },
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
  zip.file(extrafilePath + '.tpl', '{{releasevals.v1}}'),
  zip.file('releasevals.json', '{"v1" : "foobazbar"}'),
  zip.file(testfilePath, testfileContents);
  return zip;
}

const healthCheckEndpoint = 'other';

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
    healthCheck: {kind:"just", value: makeHealthCheckConfig({
      incomingPath: '/health-check',
      outgoingPath: `/${testfilePath}`,
      endpoint: {kind:'just',value:healthCheckEndpoint}
    })}
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
      await c2machine.connect(rel.endpoint, defaultDeployName(rel.releaseName));
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

      const res2 = await promiseRetry(async (retry) => {
        try {
          console.log("try http get file extra");
          const res2 = await axios.get(
            `http://${rel.endpoint}.localhost/${extrafilePath}`
          );
          return res2;
        } catch (error) {
          console.error("http get file extra error, retrying...");
          retry(error);
        }
      });

      expect(res2);
      if (res2) {
        expect(res2.data).toEqual("foobazbar");
      }
    }

    {
      console.log("validate health check");
      const res = await promiseRetry(async (retry) => {
        try {
          const res = await axios.get(
            `http://localhost/health-check`
          );
          return res;
        } catch (error) {
          console.error("health check error, retrying...");
          retry(error);
        }
      });

      expect(res);
      if (res) {
        const healthcheckcontent = releases.find(r => r.endpoint === healthCheckEndpoint)?.testcontents;
        expect(res.data).toEqual(healthcheckcontent);
      }
    }

    console.log("test OK");

    for (const rel of releases) {
      await c2machine!.disconnect(rel.endpoint);
      await c2machine!.stop(defaultDeployName(rel.releaseName));
    }

    // for test cleanup
    await c2machine.terminate();

    console.log("stopping...");
  });

  test("Config and deployment of multiple deploys of same release", async () => {
    const releaseName = testSetup.randomstr + ".zip"
    const testcontents =  "testcontentsA"
    const releases = [
      {
        releaseName,
        testcontents,
      },
    ];

    const deploys = [
      {
        deployName: "deploy1",
        endpoint: "main"
      },
            {
        deployName: "deploy2",
        endpoint: "other"
      },
    ];

    const dataDirs = testSetup.dataDirs!;

    for (const rel of releases) {
      await writeReleaseZip(
        testSetup,
        makeReleaseHttpdProxyMode(testSetup, rel.testcontents),
        rel.releaseName
      );
    }

    await writeToolConfig(testSetup, makeConfig(testSetup), "single");
    const c2machine = new C2Exec(dataDirs, "single");
    for (const dep of deploys) {
      await c2machine.start(releaseName, dep.deployName);
      await c2machine.connect(dep.endpoint, dep.deployName);
    }
    for (const dep of deploys) {
      expect(
        await fsx.pathExists(
          path.join(dataDirs.machineOptDeploys, dep.deployName, "started")
        )
      );
      console.log("http get file test start");

      const res = await promiseRetry(async (retry) => {
        try {
          console.log("try http get file test");
          const res = await axios.get(
            `http://${dep.endpoint}.localhost/${testfilePath}`
          );
          return res;
        } catch (error) {
          console.error("http get file test error, retrying...");
          retry(error);
        }
      });

      expect(res);
      if (res) {
        expect(res.data).toEqual(testcontents);
      }
    }

    console.log("test OK");

    for (const dep of deploys) {
      await c2machine!.disconnect(dep.endpoint);
      await c2machine!.stop(dep.deployName);
    }

    // for test cleanup
    await c2machine.terminate();

    console.log("stopping...");
  });
});

// problems with testing:
//    ports in use
//    docker fills up with too many networks
