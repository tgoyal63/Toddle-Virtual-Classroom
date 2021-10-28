module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-console': 'off',
    // 'allowForLoopAfterthoughts': true,
    'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
    'no-underscore-dangle': 'off',
  },
};
