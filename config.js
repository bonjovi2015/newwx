
// config for production
let config = {
  API_URL: 'https://weixin.club'
};

try {
  let localConfig = require('./config.local.js');
  Object.assign(config, localConfig); //overwrite
} catch(e) {}

export default config;
