const {
  override,
  fixBabelImports,
  addLessLoader,
  addDecoratorsLegacy,
  adjustStyleLoaders,
} = require('customize-cra');

module.exports = override(
  addDecoratorsLegacy(),
  fixBabelImports('antd', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: {
        '@primary-color': '#1890ff',
      },
    },
  }),
  adjustStyleLoaders(({ use: [, , postcss] }) => {
    const postcssOptions = postcss.options;
    postcss.options = { postcssOptions };
  })
);
