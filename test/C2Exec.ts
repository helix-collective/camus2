import path from "path";
import { TestDataPaths, localstack, execShellCommand } from "./testUtils";

/// Typescript wrapper around shell execution of c2
export class C2Exec {
  workingDir: string;

  constructor(
    public dataDirs: TestDataPaths,
    public mode: "single" | "controller" | "target"
  ) {
    this.workingDir =
      mode === "controller"
        ? this.dataDirs.controllerOptBin
        : this.dataDirs.machineOptBin;
  }
  async listReleases(): Promise<void> {
    await this.exec(["list-releases"]);
  }
  async start(release: string, asDeploy?: string): Promise<void> {
    if (asDeploy !== undefined) {
      await this.exec(["start", release, asDeploy]);
    } else {
      await this.exec(["start", release]);
    }
  }
  async connect(endpoint: string, deploy: string): Promise<void> {
    await this.exec(["connect", endpoint, deploy]);
  }
  async disconnect(endpoint: string): Promise<void> {
    await this.exec(["disconnect", endpoint]);
  }
  async slaveUpdate(): Promise<void> {
    await this.exec(["slave-update"]);
  }
  async stop(deploy: string): Promise<void> {
    await this.exec(["stop", deploy]);
  }
  async terminate(): Promise<void> {
    await this.exec(["shutdown-frontend-proxy"]);
  }
  private c2(): string {
    return path.join(this.workingDir, "c2");
  }
  private async exec(cmds: string[]): Promise<void> {
    const env = {
      ...process.env,
      S3_ENDPOINT: `http://${localstack.host}:${localstack.port}`,
    };
    await execShellCommand([this.c2()].concat(cmds).join(" "), {
      env,
      cwd: this.workingDir,
    });
  }
}
