const { initializeApp } = require('./app');

async function startServer() {
  const app = await initializeApp();
  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
