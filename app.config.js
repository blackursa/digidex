module.exports = {
  name: 'DigiDex',
  slug: 'digidex',
  version: '1.0.0',
  orientation: 'portrait',
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './store-assets/icon-templates/icon-spec.svg'
  },
  extra: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://ablack.github.io/digidex'
      : 'http://localhost:19006'
  }
};
