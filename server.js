const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 3000;

// Enable gzip compression
app.use(compression());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist/fitsense')));

// Handle Angular routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/fitsense/index.html'));
});

app.listen(port, () => {
  console.log(`Fitsense server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
