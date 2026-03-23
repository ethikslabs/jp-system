/**
 * Property 14: Lens definitions contain all required fields
 *
 * Feature: dashboard-api, Property 14: Lens definitions contain all required fields
 *
 * For any lens in the configuration (founder, ciso, investor, board),
 * the definition SHALL contain all required fields: id, label, prompt_context,
 * severity_weights, source_weights, and max_components.
 *
 * Validates: Requirements 5.4
 */

const fc = require('fast-check');
const { LENSES } = require('../../src/config/lenses.js');

const LENS_IDS = ['founder', 'ciso', 'investor', 'board'];
const SEVERITY_KEYS = ['info', 'warning', 'critical'];

describe('Property 14: Lens definitions contain all required fields', () => {
  test('all four built-in lenses exist in LENSES', () => {
    for (const id of LENS_IDS) {
      expect(LENSES).toHaveProperty(id);
    }
  });

  test('each lens has all required fields with correct types', () => {
    fc.assert(
      fc.property(fc.constantFrom(...LENS_IDS), (lensId) => {
        const lens = LENSES[lensId];

        // id: string
        expect(typeof lens.id).toBe('string');
        expect(lens.id).toBe(lensId);

        // label: string
        expect(typeof lens.label).toBe('string');
        expect(lens.label.length).toBeGreaterThan(0);

        // prompt_context: string
        expect(typeof lens.prompt_context).toBe('string');
        expect(lens.prompt_context.length).toBeGreaterThan(0);

        // severity_weights: object with info/warning/critical as numbers
        expect(typeof lens.severity_weights).toBe('object');
        expect(lens.severity_weights).not.toBeNull();
        for (const key of SEVERITY_KEYS) {
          expect(lens.severity_weights).toHaveProperty(key);
          expect(typeof lens.severity_weights[key]).toBe('number');
        }

        // source_weights: object with string keys and number values
        expect(typeof lens.source_weights).toBe('object');
        expect(lens.source_weights).not.toBeNull();
        const sourceKeys = Object.keys(lens.source_weights);
        expect(sourceKeys.length).toBeGreaterThan(0);
        for (const key of sourceKeys) {
          expect(typeof key).toBe('string');
          expect(typeof lens.source_weights[key]).toBe('number');
        }

        // max_components: positive integer
        expect(typeof lens.max_components).toBe('number');
        expect(Number.isInteger(lens.max_components)).toBe(true);
        expect(lens.max_components).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});
