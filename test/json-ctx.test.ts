import { makeReleaseConfig, ReleaseConfig } from "./adl-gen/release";
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
import { Maybe } from "./adl-gen/sys/types";

const jsonValsTest = {
  rva: {
    aa : "aaaaa"
  },
  rvb: {
    b : {
      val: 'bbbb'
    }
  }
};

/// Trivial release with no contents except the release.json - actions just touch files
function makeRelease(setup: TestSetup, ctxJson: Maybe<string>): JSZip {
  let releaseConfig : ReleaseConfig;
  const configSources = {
    "rva" : "releaseValsA.json",
    "rvb" : "releaseValsB.json",
  };

  if(ctxJson.kind === 'just') {
    // test that the json context is exported ready before prestart
    const ctxJsonFile = ctxJson.value;
    releaseConfig = makeReleaseConfig({
      templates: [],
      prestartCommand: `[ -f ${ctxJsonFile} ] && touch prestarted`,
      startCommand: `[ -f ${ctxJsonFile} ] && touch started`,
      stopCommand: `[ -f ${ctxJsonFile} ] && touch stopped`,
      configSources,
      ctxJson
    });
  } else {
    releaseConfig = makeReleaseConfig({
      templates: [],
      prestartCommand: `touch prestarted`,
      startCommand: `touch started`,
      stopCommand: `touch stopped`,
      configSources,
      ctxJson
    });
  }

  const zip = new JSZip();
  zipAddReleaseJson(zip, releaseConfig);
  zip.file('releaseValsA.json', JSON.stringify(jsonValsTest.rva));
  zip.file('releaseValsB.json', JSON.stringify(jsonValsTest.rvb));
  return zip;
}

/// Trivial tool config with no special options
function makeConfig(setup: TestSetup): ToolConfig {
  return makeToolConfig({
    ...setup.dataDirs!.config,
    deployMode: makeDeployMode("noproxy", null),
  });
}

const withJsonCtxVals : (Maybe<string> & {comment:string})[] = [
  {
    kind: "just", value: "ctx.json",
    comment: "enabled-ctx-json",
  },
  {
    kind: "just", value: "somethingElse.json",
    comment: "enabled-something-custom",
  },
  {
    kind: "nothing",
    comment: "disabled",
  }
]

for (const withJsonCtx of withJsonCtxVals) {
  describe(`Json context enabled: ${withJsonCtx.comment}`, () => {
    const testSetup: TestSetup = {
      randomstr: uuid(),
      dataDirs: null,
      mode: "local",
    };
    beforeEach(async () => {
      await setupTest(`json-ctx-export-${withJsonCtx.comment}`, testSetup);
    });
    afterEach(async () => {
      await tearDownTest(testSetup);
    });

    test(`Config release and run - ${withJsonCtx.comment}`, async () => {
      const dataDirs = testSetup.dataDirs!;
      await writeReleaseZip(testSetup, makeRelease(testSetup, withJsonCtx));

      await writeToolConfig(testSetup, makeConfig(testSetup), "single");

      const c2 = new C2Exec(dataDirs, "single");

      await c2.start("release.zip");
      if(withJsonCtx.kind === 'just') {
        const ctxJsonFilename = path.join(dataDirs.machineOptDeploys, "release", withJsonCtx.value);
        expect(
          await fsx.pathExists(ctxJsonFilename)
        ).toBeTruthy();

        const ctxJson = await fsx.readJSON(ctxJsonFilename);
        expect(JSON.stringify(ctxJson)).toEqual(JSON.stringify(jsonValsTest));
      }

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
