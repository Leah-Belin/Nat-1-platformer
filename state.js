'use strict';

const State = {
  phase: 'title',   // 'title' | 'select' | 'playing' | 'dead' | 'win' | 'gameover'
  score: 0,
  hearts: 3,
  maxHearts: 3,
  lives: 3,
  selectedChar: 0,
  deadTimer: 0,
  invTimer: 0,
  winTimer: 0,
  hiScore: +(localStorage.getItem('nat1_hi') || 0),

  addScore(n) {
    this.score += n;
    if (this.score > this.hiScore) {
      this.hiScore = this.score;
      try { localStorage.setItem('nat1_hi', this.hiScore); } catch (e) {}
    }
  },

  hit() {
    if (this.invTimer > 0) return false;
    this.hearts--;
    this.invTimer = 2.0;
    if (this.hearts <= 0) {
      this.lives--;
      this.hearts = 0;
      this.deadTimer = 2.5;
      this.phase = this.lives > 0 ? 'dead' : 'gameover';
    }
    return true;
  },

  respawn() {
    this.hearts = this.maxHearts;
    this.phase = 'playing';
    this.invTimer = 2.0;
  },

  resetFull() {
    this.score = 0;
    this.hearts = this.maxHearts;
    this.lives = 3;
    this.deadTimer = 0;
    this.invTimer = 0;
    this.winTimer = 0;
    this.phase = 'select';
  }
};
