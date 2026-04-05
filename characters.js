'use strict';

// ── Nat 1 Publishing Board Members ───────────────────────────────────────────
// To use portrait images: save each image to a portraits/ folder in the project
// (e.g. portraits/brandan.png) then set portrait: 'portraits/brandan.png'
const CHARS = [
  // ── Voting Board ─────────────────────────────────────────────────────
  {
    id: 'brandan',
    name: 'Brandan Roberts',
    tagline: 'Board President',
    portrait:   null,  // save image as portraits/brandan.png
    shirt:      '#2a62a0',  // blue shirt + tie
    pants:      '#1a1a2a',
    skin:       '#c8825a',
    hair:       '#2a1a10',  // dark brown, long-ish
    shoe:       '#1a1a1a',
    hasGlasses: true,
    hasBeard:   true,
    hasHat:     true,
    hat:        '#1a1a1a',  // flat dark cap
  },
  {
    id: 'dahlia',
    name: 'Dahlia Thomas',
    tagline: 'Board Director',
    portrait:   null,
    shirt:      '#2a2a3a',  // dark scarf/collar
    pants:      '#1a0a2a',
    skin:       '#e0b090',
    hair:       '#2a1008',  // rich dark brown, wavy
    shoe:       '#0a0a0a',
    hasGlasses: false,
    hasBeard:   false,
    hasHat:     false,
  },
  {
    id: 'jason',
    name: 'Jason Willard',
    tagline: 'Creative Director',
    portrait:   null,
    shirt:      '#2a3a7a',
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
    portrait:   null,
    shirt:      '#6a1a8a',  // purple
    pants:      '#4a0a6a',
    skin:       '#e8c4a0',
    hair:       '#6a4020',  // warm brown
    shoe:       '#2a0a3a',
    hasGlasses: true,
    hasBeard:   false,
    hasHat:     true,
    hat:        '#1a1a1a',  // large dark witch hat
  },
  {
    id: 'kathleen',
    name: 'Kathleen Locke',
    tagline: 'Board Director, Editor',
    portrait:   null,
    shirt:      '#2a4a6a',  // blue shirt
    pants:      '#1a2a3a',
    skin:       '#d4a880',
    hair:       '#6a3a18',  // warm curly brown
    shoe:       '#1a1a1a',
    hasGlasses: true,
    hasBeard:   false,
    hasHat:     false,
  },
  {
    id: 'michaela',
    name: 'Michaela Butler',
    tagline: 'Webmaster, Editor',
    portrait:   null,
    shirt:      '#2a0a18',  // very dark maroon/brown
    pants:      '#1a0808',
    skin:       '#c8907a',
    hair:       '#4a1a6a',  // purple hair!
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
    portrait:   null,
    // Cow onesie: white/cream with brown spots
    shirt:      '#ede8e0',  // off-white onesie
    pants:      '#ede8e0',
    skin:       '#4a2810',  // deeper skin tone
    hair:       '#1a0a00',
    shoe:       '#ede8e0',  // onesie feet
    hasGlasses: false,
    hasBeard:   false,
    hasHat:     true,
    hat:        '#ede8e0',  // cow-ear hood
  },
  {
    id: 'francis',
    name: 'Francis Wiget',
    tagline: 'Probationary Member',
    portrait:   null,
    shirt:      '#5a3a18',  // tan/brown duster coat
    pants:      '#3a2810',
    skin:       '#c8a878',
    hair:       '#4a3020',
    shoe:       '#2a1a08',
    hasGlasses: true,    // dark sunglasses
    hasBeard:   true,
    hasHat:     true,
    hat:        '#1e1e1e',  // very dark wide-brim hat
  },
];
