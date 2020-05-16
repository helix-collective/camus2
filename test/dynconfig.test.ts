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
  getC2State,
} from "./testUtils";
import { C2Exec } from "./C2Exec";
import promiseRetry from "promise-retry";
import { makeDynamicJsonSource, makeJsonSource } from "./adl-gen/dconfig";
import { makeMaybe, makePair } from "./adl-gen/sys/types";

const localHttpPort = 8081;
const testfilePath = "testfile.yml";

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

      remoteStateS3: {
        kind:'nothing'
      },

      dynamicPortRange: makePair({ v1: 8090, v2: 8099 }),
      slaveLabel: makeMachineLabel("label", "testslave"),
    })),

    dynamicConfigSources: {
      topping : makeDynamicJsonSource({
        defaultMode: "normal",
        modes: {
          normal: makeJsonSource("s3", configS3("topping_normal").url),
          special: makeJsonSource("s3", configS3("topping_special").url),
        }
      }),
      flavour : makeDynamicJsonSource({
        defaultMode: "vanilla",
        modes: {
          vanilla: makeJsonSource("s3", configS3("flavour_vanilla").url),
          choc: makeJsonSource("s3", configS3("flavour_choc").url),
          berry: makeJsonSource("s3", configS3("flavour_berry").url),
        }
      })
    }
  });
}

export function makeReleaseHttpd(
  setup: TestSetup,
  exposedPort: string,
  testfilePath: string
): JSZip {
  const releaseConfig = makeReleaseConfig({
    templates: ["docker-compose.yml.tpl", testfilePath + ".tpl"],
    prestartCommand: "",
    startCommand: "touch start && docker-compose up -d && touch started",
    stopCommand: "docker-compose kill && docker-compose rm -f",
    ctxJson: {kind:"just", value:"ctx.json"},
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
  // YAML format so that its easier to write mustache template
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


describe("Run release mode local", () => {
  const testSetup: TestSetup = {
    randomstr: uuid(),
    dataDirs: null,
    mode: "local",
  };
  beforeEach(async () => {
    await setupTest("dynconfig", testSetup);
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

    await writeToolConfig(testSetup, makeConfig(testSetup), "single");

    const c2machine = new C2Exec(dataDirs, "single");

    await c2machine.start(release);
    await c2machine.connect(endpoint, release);



    expect(
      await fsx.pathExists(
        path.join(dataDirs.machineOptDeploys, testSetup.randomstr, "started")
      )
    );

    await c2machine.reconfig(release, "flavour,berry");


    {
      const state = await getC2State(testSetup);

      expect(state.deploys[release].dynamicConfigModes["flavour"]).toEqual("berry");


      console.log("state: ", JSON.stringify(state,null,2));
    }

    {
      const ctx = await fsx.readJSON(testSetup.dataDirs?.machineOptDeploys + "/" +  release + "/ctx.json");
      console.log("ctx: ", JSON.stringify(ctx,null,2));
    }

    await c2machine.reconfig(release, "topping,special");

    {
      const state = await getC2State(testSetup);

      expect(state.deploys[release].dynamicConfigModes["topping"]).toEqual("special");

      console.log("state: ", JSON.stringify(state,null,2));
    }

    {
      const ctx = await fsx.readJSON(testSetup.dataDirs?.machineOptDeploys + "/" +  release + "/ctx.json");
      console.log("ctx: ", JSON.stringify(ctx,null,2));
    }


    {
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
      },
      {
        retries:5
      });

      expect(res);
      if (res) {
        const data = yaml.parse(res.data)
        console.log(res.data)
        expect(data.toppings).toEqual(["sprinkles","cream"]);
        expect(data.ingredients).toEqual(["sorbet","raspberry","strawberry"]);
      }

    }

    await c2machine.reconfig(release, "flavour,choc");

    {
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
      },
      {
        retries:5
      });

      expect(res);
      if (res) {
        const data = yaml.parse(res.data)
        console.log(res.data)
        expect(data.toppings).toEqual(["sprinkles","cream"]);
        expect(data.ingredients).toEqual(["icecream","chocolate"]);
      }

    }
    console.log("test OK");

    await c2machine.disconnect(endpoint);
    await c2machine.stop(release);

    console.log("stopping...");
  });
});

