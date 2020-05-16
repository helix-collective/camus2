import { makeReleaseConfig } from "./adl-gen/release";
import JSZip from "jszip";
import fsx from "fs-extra";
import { v4 as uuid } from "uuid";
import path from "path";
import { makeToolConfig, makeDeployMode, ToolConfig, makeProxyModeConfig, makeEndPoint, makeEndPointType, makeMachineLabel } from "./adl-gen/config";
import axios from "axios";
import yaml from 'yaml';

import {
  TestSetup,
  writeToolConfig,
  setupTest,
  tearDownTest,
  zipAddReleaseJson,
  writeReleaseZip,
  localstack,
} from "./testUtils";
import { C2Exec } from "./C2Exec";
import promiseRetry from "promise-retry";
import { makeDynamicJsonSource, makeJsonSource } from "./adl-gen/dconfig";
import { makeMaybe, makePair } from "./adl-gen/sys/types";

const localHttpPort = 8081;
const testfilePath = "testfile.txt";

function configS3(name: string) {
  return {
    key: localstack.prefix + "/configs/" + name,
    bucket: localstack.bucket,
    url: `s3://${localstack.bucket}/${localstack.prefix}/configs/${name}`
  }
}

/// Usually happens in infrastructure-as-code repo - Puts json config blocks in S3
async function makeS3Configs() {
  await localstack
  .s3!.putObject({
    Key: configS3("topping_normal").key,
    Bucket: localstack.bucket,
    Body: JSON.stringify({
      sprinkles: false,
      cream: false,
    })
  })
  .promise();

  await localstack
  .s3!.putObject({
    Key: configS3("topping_special").key,
    Bucket: localstack.bucket,
    Body: JSON.stringify({
      sprinkles: true,
      cream: true,
    })
  })
  .promise();

  await localstack
  .s3!.putObject({
    Key: configS3("flavour_vanilla").key,
    Bucket: localstack.bucket,
    Body: JSON.stringify({
      ingredients: [
        {name:"icecream"},
        {name:"vanilla"}
      ],
    })
  })
  .promise();

  await localstack
  .s3!.putObject({
    Key: configS3("flavour_choc").key,
    Bucket: localstack.bucket,
    Body: JSON.stringify({
      ingredients: [
        {name:"icecream"},
        {name:"chocolate"}
      ],
    })
  })
  .promise();

  await localstack
  .s3!.putObject({
    Key: configS3("flavour_berry").key,
    Bucket: localstack.bucket,
    Body: JSON.stringify({
      ingredients: [
        {name:"sorbet"},
        {name:"raspberry"},
        {name:"strawberry"}
      ],
    })
  })
  .promise();
}

function makeConfig(setup: TestSetup): ToolConfig {
  return makeToolConfig({
    ...setup.dataDirs!.config,
    deployMode: makeDeployMode('proxy', makeProxyModeConfig({
      endPoints: {
        main: makeEndPoint({
          serverNames: ["main.localhost"],
          etype: makeEndPointType("httpOnly", null),
        })
      },

      //remoteStateS3: makeMaybe<string, "just">(
      //  "just",
      //  `s3://${localstack.bucket}/${localstack.prefix}/${setup.randomstr}/remotestate`
      //),
      remoteStateS3: makeMaybe<string,"nothing">("nothing",null),

      dynamicPortRange: makePair({ v1: 8090, v2: 8099 }),
      slaveLabel: makeMachineLabel("label", "testslave"),
    })),

    configSources: {
      topping : makeJsonSource("s3", configS3("topping_special").url),
      flavour : makeJsonSource("s3", configS3("flavour_berry").url)
    }
  });
}

export function makeReleaseHttpd(
  setup: TestSetup,
  exposedPort: string,
  testfilePath: string
): JSZip {
  const releaseConfig = makeReleaseConfig({
    templates: ["docker-compose.yml.tpl",testfilePath + ".tpl"],
    prestartCommand: "",
    startCommand: "touch start && docker-compose up -d && touch started",
    stopCommand: "docker-compose kill && docker-compose rm -f",
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
  zip.file(testfilePath + ".tpl",
`toppings:
{{#topping.sprinkles}}
  - sprinkles
{{/topping.sprinkles}}
{{#topping.cream}}
  - cream
{{/topping.cream}}
ingredients:
{{#flavour.ingredients}}
  - {{name}}
{{/flavour.ingredients}}
`
  );
  return zip;
}

for (const remoteMode of ["local"] as const) {
  describe(`Run release mode ${remoteMode}`, () => {
    const testSetup: TestSetup = {
      randomstr: uuid(),
      dataDirs: null,
      mode: remoteMode,
    };
    beforeEach(async () => {
      await setupTest(`httpd-${remoteMode}`, testSetup);
      await makeS3Configs();
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
          testfilePath
        ),
        testSetup.randomstr
      );

      const release = testSetup.randomstr;
      const endpoint = "main";

      await writeToolConfig(testSetup, makeConfig(testSetup), "controller");
      await writeToolConfig(testSetup, makeConfig(testSetup), "target");

      const c2machine = new C2Exec(dataDirs, "target");

      await c2machine.start(release);
      await c2machine.connect(endpoint, release);

      expect(
        await fsx.pathExists(
          path.join(dataDirs.machineOptDeploys, testSetup.randomstr, "started")
        )
      );

      console.log("http get file test start");
      const res = await promiseRetry(async (retry) => {
        try {
          console.log("try http get file test");
          const res = await axios.get(
            `http://localhost:${localHttpPort}/${testfilePath}`
          );
          return res;
        } catch (error) {
          console.error("http get file test error");
          retry(error);
        }
      });

      expect(res);
      if (res) {
        const data = yaml.parse(res.data)
        console.log(res.data)
        expect(data.toppings).toEqual(["sprinkles","cream"]);
        expect(data.ingredients).toEqual(["sorbet","raspberry","strawberry"]);
      }

      console.log("test OK");

      await c2machine.disconnect(endpoint);
      await c2machine.stop(release);

      // for test cleanup
      await c2machine.terminate();

      console.log("stopping...");
    });
  });
}
