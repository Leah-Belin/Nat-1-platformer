'use strict';

// ── Nat 1 Publishing Board Members ───────────────────────────────────────────
const CHARS = [
  // ── Voting Board ─────────────────────────────────────────────────────
  {
    id: 'brandan',
    name: 'Brandan Roberts',
    tagline: 'Board President',
    shirt:      '#1a5c8a',  // blue/teal
    pants:      '#1a1a2a',
    skin:       '#d4956a',
    hair:       '#1a1a1a',
    shoe:       '#1a1a1a',
    hasGlasses: true,
    hasBeard:   true,
    hasHat:     false,
  },
  {
    id: 'dahlia',
    name: 'Dahlia Thomas',
    tagline: 'Board Director',
    shirt:      '#3a0a5a',  // dark purple
    pants:      '#1a0a2a',
    skin:       '#c8956c',
    hair:       '#1a1a1a',
    shoe:       '#0a0a0a',
    hasGlasses: false,
    hasBeard:   false,
    hasHat:     false,
  },
  {
    id: 'jason',
    name: 'Jason Willard',
    tagline: 'Creative Director',
    shirt:      '#2a3a7a',  // dark navy suit
    pants:      '#1a2a5a',
    skin:       '#d4a070',
    hair:       '#1a0a00',
    shoe:       '#0a0a0a',
    hasGlasses: true,
    hasBeard:   true,
    hasHat:     false,
  },
  {
    id: 'jennifer',
    name: 'Jennifer Weigel',
    tagline: 'Board Director, Artist',
    shirt:      '#3a2a5a',  // dark purple
    pants:      '#1a1a2a',
    skin:       '#e8c4a0',
    hair:       '#1a1a1a',
    shoe:       '#0a0a0a',
    hasGlasses: true,
    hasBeard:   false,
    hasHat:     true,
    hat:        '#4a2a5a',
  },
  {
    id: 'kathleen',
    name: 'Kathleen Locke',
    tagline: 'Board Director, Editor',
    shirt:      '#2a1a0a',  // dark brown
    pants:      '#1a1a1a',
    skin:       '#c8956c',
    hair:       '#5a2a0a',
    shoe:       '#0a0a0a',
    hasGlasses: true,
    hasBeard:   false,
    hasHat:     false,
  },
  {
    id: 'michaela',
    name: 'Michaela Butler',
    tagline: 'Webmaster, Editor',
    shirt:      '#5a0a1a',  // dark maroon
    pants:      '#2a0a0a',
    skin:       '#c8a080',
    hair:       '#1a1a1a',
    shoe:       '#0a0a0a',
    hasGlasses: true,
    hasBeard:   false,
    hasHat:     false,
  },
  // ── Probationary Members ─────────────────────────────────────────────
  {
    id: 'cj',
    name: 'CJ the Tall Poet',
    tagline: 'Probationary Member',
    shirt:      '#5a3010',  // brown
    pants:      '#3a2008',
    skin:       '#d4a070',
    hair:       '#1a1a1a',
    shoe:       '#2a1008',
    hasGlasses: false,
    hasBeard:   false,
    hasHat:     true,
    hat:        '#2a1808',
  },
  {
    id: 'francis',
    name: 'Francis Wiget',
    tagline: 'Probationary Member',
    shirt:      '#3a5060',  // blue-grey
    pants:      '#2a3848',
    skin:       '#d4b090',
    hair:       '#6a5040',
    shoe:       '#1a1a2a',
    hasGlasses: false,
    hasBeard:   true,
    hasHat:     true,
    hat:        '#2a3848',
  },
];
