'use strict';

const q1   = require('./sat_math_q1_50');
const q2   = require('./sat_math_q51_100');
const q3   = require('./sat_math_q101_150');
const q4   = require('./sat_math_q151_200');

module.exports = {
  setId: '00000000-0000-0000-0000-000000000010',
  questions: [...q1, ...q2, ...q3, ...q4],
};
