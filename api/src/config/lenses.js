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
  sarvesh: {
    id: 'sarvesh',
    label: 'Sarvesh',
    prompt_context: 'CTO of Ethiks360. This is John\'s lab — jp-system is where things are built and tested before graduating to Ethiks360. Sarvesh needs to know: what is in the lab right now, what is close to graduating (validated/authorised state), what has already graduated (live), and whether the infrastructure supporting it is healthy. Show build velocity, lifecycle state of all projects, deployment activity, server health, pipeline performance. Technical depth — specifics not summaries. Flag anything that is validated or authorised as ready for handoff conversation.',
    severity_weights: { info: 1, warning: 1, critical: 1 },
    source_weights: { github: 1, stripe: 0, auth0: 1, hubspot: 0, proof360: 1, system: 1, aws: 1 },
    max_components: 6,
  },
  val: {
    id: 'val',
    label: 'Val',
    prompt_context: 'COO of Ethiks360. This is John\'s lab — jp-system is where things are tested before they become Ethiks360 products. Val needs to know: what has graduated or is graduating (validated/authorised/live projects), operational health of what is running, compliance gaps that need addressing before anything goes to market, cost, and who is active. Operational framing — what is ready to run, what still needs work, what needs Val\'s attention. No deep technical detail. Flag anything approaching market-ready.',
    severity_weights: { info: 1, warning: 1, critical: 1 },
    source_weights: { github: 0, stripe: 1, auth0: 1, hubspot: 1, proof360: 1, system: 1, aws: 1 },
    max_components: 5,
  },
};

function getLens(lensId) {
  return LENSES[lensId] || null;
}

module.exports = { LENSES, getLens };
