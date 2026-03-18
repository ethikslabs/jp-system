/**
 * Lens Definitions
 *
 * Each lens is an audience context that tells Claude how to interpret the pulse stream.
 * Four built-in lenses: founder, ciso, investor, board.
 */

const LENSES = {
  founder: {
    id: 'founder',
    label: 'Founder',
    prompt_context: 'Everything. Full system read. BPM + all zones visible.',
    severity_weights: { info: 1, warning: 1, critical: 1 },
    source_weights: { github: 1, stripe: 1, auth0: 1, hubspot: 1, proof360: 1, system: 1, aws: 1 },
    max_components: 8,
  },
  ciso: {
    id: 'ciso',
    label: 'CISO',
    prompt_context: 'Security pulses — secrets, vulnerabilities, access events, SSL. Zone 4–5 only.',
    severity_weights: { info: 0, warning: 1, critical: 1 },
    source_weights: { github: 1, stripe: 0, auth0: 1, hubspot: 0, proof360: 0, system: 1, aws: 0 },
    max_components: 6,
  },
  investor: {
    id: 'investor',
    label: 'Investor',
    prompt_context: 'Revenue, pipeline, trust scores, lifecycle state. Calm framing.',
    severity_weights: { info: 1, warning: 0, critical: 0 },
    source_weights: { github: 0, stripe: 1, auth0: 0, hubspot: 1, proof360: 1, system: 0, aws: 0 },
    max_components: 5,
  },
  board: {
    id: 'board',
    label: 'Board',
    prompt_context: 'High-level health, cost, lifecycle, key people. Zone 3+ only.',
    severity_weights: { info: 0, warning: 1, critical: 1 },
    source_weights: { github: 1, stripe: 1, auth0: 1, hubspot: 1, proof360: 1, system: 1, aws: 1 },
    max_components: 4,
  },
};

function getLens(lensId) {
  return LENSES[lensId] || null;
}

module.exports = { LENSES, getLens };
