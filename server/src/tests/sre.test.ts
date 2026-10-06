import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';

describe('SRE Metrics & Topology API (/api/sre)', () => {
  describe('GET /api/sre/metrics', () => {
    it('should return system metrics and full architectural topology', async () => {
      const res = await request(app).get('/api/sre/metrics');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('system');
      expect(res.body).toHaveProperty('topology');

      const { system, topology } = res.body;

      // Check telemetry
      expect(system).toHaveProperty('uptime_seconds');
      expect(system).toHaveProperty('memory_usage_mb');
      expect(system).toHaveProperty('cpu_load');
      expect(system).toHaveProperty('status');
      expect(system).toHaveProperty('environment');

      // Check topology modules
      expect(Array.isArray(topology)).toBe(true);
      expect(topology.length).toBeGreaterThanOrEqual(5);

      const nodeIds = topology.map((t: any) => t.id);
      expect(nodeIds).toContain('client-spa');
      expect(nodeIds).toContain('server-api');
      expect(nodeIds).toContain('mongo-db');
      expect(nodeIds).toContain('ai-groq');
      expect(nodeIds).toContain('tts-engine');

      // Check dual-layer living documentation structure on every node
      for (const node of topology) {
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('name');
        expect(node).toHaveProperty('type');
        expect(node).toHaveProperty('status');
        expect(node).toHaveProperty('summary');

        // Non-technical documentation layer
        expect(node).toHaveProperty('non_technical');
        expect(node.non_technical).toHaveProperty('purpose');
        expect(node.non_technical).toHaveProperty('user_experience');
        expect(node.non_technical).toHaveProperty('business_value');

        // Technical deep-dive documentation layer
        expect(node).toHaveProperty('technical');
        expect(Array.isArray(node.technical.stack)).toBe(true);
        expect(Array.isArray(node.technical.source_files)).toBe(true);
        expect(node.technical).toHaveProperty('data_flow');
        expect(node.technical).toHaveProperty('error_handling');
      }
    });
  });
});
