/** @type {import('stylelint').Config} */
export default {
  plugins: ['stylelint-scss', 'stylelint-order'],
  extends: [
    'stylelint-config-recommended',
    'stylelint-config-recommended-scss',
    'stylelint-config-recess-order', // 使用推荐的属性顺序配置
  ],
};
