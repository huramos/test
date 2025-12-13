const PROXY_CONFIG = [
  {
    context: ['/api/**'],
    target: 'https://api-sandbox.y.uno/v1',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/api': ''
    },
    onProxyReq: function(proxyReq, req, res) {
      console.log('\n🔄 PROXY REQUEST:');
      console.log('📍 Original URL:', req.url);
      console.log('🎯 Target URL:', proxyReq.path);
      console.log('📝 Method:', proxyReq.method);
      console.log('───────────────────────────────────────');
    },
    onProxyRes: function(proxyRes, req, res) {
      console.log('\n✅ PROXY RESPONSE:');
      console.log('📊 Status:', proxyRes.statusCode);
      console.log('📋 Status Message:', proxyRes.statusMessage);
      console.log('───────────────────────────────────────');
    },
    onError: function(err, req, res) {
      console.log('\n❌ PROXY ERROR:');
      console.log('📍 URL:', req.url);
      console.log('🚨 Error:', err.message);
      console.log('📊 Error Code:', err.code);
      console.log('───────────────────────────────────────');
    }
  }
];

module.exports = PROXY_CONFIG;