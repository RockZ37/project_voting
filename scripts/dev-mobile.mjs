import { spawn } from 'child_process';
import net from 'net';
import localtunnel from 'localtunnel';

async function findOpenPort(startPort) {
  for (let port = startPort; port < startPort + 25; port += 1) {
    const isAvailable = await new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close(() => resolve(true));
      });
      server.listen(port, '0.0.0.0');
    });

    if (isAvailable) {
      return port;
    }
  }

  throw new Error('No free port found for the mobile preview.');
}

const port = await findOpenPort(Number(process.env.PORT ?? 3000));

const viteProcess = spawn('pnpm', ['exec', 'vite', '--host', '0.0.0.0', '--port', String(port), '--strictPort'], {
  stdio: 'inherit',
  env: process.env,
});

let tunnel = null;

try {
  tunnel = await localtunnel({ port });
  console.log('\nMobile preview URL: ' + tunnel.url);
  console.log('Open this HTTPS URL on your phone to allow camera access.');
  console.log('Local Vite server is running on port ' + port + '.\n');
} catch (error) {
  console.error('Failed to create a mobile tunnel:', error);
  viteProcess.kill('SIGTERM');
  process.exit(1);
}

const shutdown = async (signal) => {
  if (tunnel) {
    await tunnel.close();
  }
  viteProcess.kill(signal);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

viteProcess.on('exit', async (code) => {
  if (tunnel) {
    await tunnel.close();
  }
  process.exit(code ?? 0);
});