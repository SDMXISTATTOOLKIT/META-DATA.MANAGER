const {injectBabelPlugin} = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');
const getAntVarsOverrides = require('./src/styles/ant-vars-overrides');
const rewireReactHotLoader = require('react-app-rewire-hot-loader');
const path = require('path');


module.exports = function override(config, env) {
  config = injectBabelPlugin(['import', {libraryName: 'antd', style: true}], config);
  config = rewireLess.withLoaderOptions({
    javascriptEnabled: true,
    modifyVars: getAntVarsOverrides(),
  })(config, env);
  config = rewireReactHotLoader(config, env);
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      "@ant-design/icons/lib/dist$": path.resolve(__dirname, "./src/styles/ant-icons.js")
    }
  };
  return config;
};
