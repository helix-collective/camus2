import path from 'path';
import { TestDataPaths, localstack, execShellCommand } from './testUtils';
export class C2Exec {

  cwd: string;

  constructor(public dataDirs: TestDataPaths, public mode:'single'|'controller'|'target') {
    this.cwd = mode==='controller' ? this.dataDirs.controllerOptBin : this.dataDirs.machineOptBin;
  }
  ;
  async listReleases(): Promise<void> {
    await this.exec(["list-releases"]);
  }
  async start(release: string): Promise<void> {
    await this.exec(["start", release]);
  }
  async connect(endpoint:string, release: string): Promise<void> {
    await this.exec(["connect", endpoint, release]);
  }
  async disconnect(endpoint:string): Promise<void> {
    await this.exec(["disconnect", endpoint]);
  }
  async slaveUpdate(): Promise<void> {
    await this.exec(["slave-update"]);
  }
  async stop(release: string): Promise<void> {
    await this.exec(["stop", release]);
  }
  async terminate() : Promise<void> {
    await this.exec(['shutdown-frontend-proxy']);
  }
  private c2(): string {
    return path.join(this.cwd, "c2");
  }
  private async exec(cmds: string[]): Promise<void> {
    const env = {
      ...process.env,
      S3_ENDPOINT: `http://${localstack.host}:${localstack.port}`
    };
    await execShellCommand([this.c2()].concat(cmds).join(" "), {
      env,
      cwd: this.cwd,
    });
  }
}
