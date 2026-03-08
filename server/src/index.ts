import app from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const server = app.listen(PORT, () => {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event: 'server_start', port: PORT }));
});

process.on('SIGTERM', () => {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event: 'server_shutdown' }));
  server.close();
});
