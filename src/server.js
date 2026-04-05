const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const startServer = () => {
  try {
    server.listen(PORT, () => {
      console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = server;
