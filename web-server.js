const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Set the proper MIME types
app.use((req, res, next) => {
  if (req.url.endsWith('.js') || req.url.endsWith('.bundle') || req.url.includes('index.bundle')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

// Serve static assets from the web-build directory
app.use(express.static(path.join(__dirname, 'web-build')));

// Handle any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
