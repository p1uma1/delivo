const net = require('net');
const dns = require('dns');

const PROXY_PORT = 4650;
const TARGET_HOST = 'smtp.gmail.com';
const TARGET_PORT = 465;

dns.resolve6(TARGET_HOST, (err, addresses) => {
  if (err || addresses.length === 0) {
    console.error('Failed to resolve IPv6 for ' + TARGET_HOST, err);
    process.exit(1);
  }
  
  const targetIPv6 = addresses[0];
  console.log(`Starting proxy on port ${PROXY_PORT} -> [${targetIPv6}]:${TARGET_PORT}`);

  const server = net.createServer((clientSocket) => {
    const targetSocket = net.connect(TARGET_PORT, targetIPv6, () => {
      clientSocket.pipe(targetSocket);
      targetSocket.pipe(clientSocket);
    });

    targetSocket.on('error', (e) => {
      console.error('Target socket error:', e.message);
      clientSocket.end();
    });

    clientSocket.on('error', (e) => {
      console.error('Client socket error:', e.message);
      targetSocket.end();
    });
  });

  server.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log(`Proxy listening on 0.0.0.0:${PROXY_PORT}`);
  });
});
