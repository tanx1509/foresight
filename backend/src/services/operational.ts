import fs from 'fs';
import path from 'path';

export interface OperationalProvider {
  getSprintMetrics(): Promise<any>;
  getPRMetrics(): Promise<any>;
  getDeploymentMetrics(): Promise<any>;
}

export class MockOperationalProvider implements OperationalProvider {
  private getPath(filename: string): string {
    return path.resolve(__dirname, '../../../data/operational', filename);
  }

  private readJson(filename: string): any {
    const fullPath = this.getPath(filename);
    if (!fs.existsSync(fullPath)) return {};
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  }

  async getSprintMetrics(): Promise<any> {
    return this.readJson('sprint.json');
  }

  async getPRMetrics(): Promise<any> {
    return this.readJson('pr_metrics.json');
  }

  async getDeploymentMetrics(): Promise<any> {
    return this.readJson('deployments.json');
  }
}
