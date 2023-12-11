// Get dependencies
const express    = require('express');
const path       = require('path');
const http       = require('http');
const https       = require('https');
const  fs         =  require('fs');


const app = express();


//app.use(require('prerender-node').set('prerenderServiceUrl', 'http://prerender.missio.io'));
app.use(require('prerender-node').set('prerenderToken', 'lxnlcfMqe1maOlDOvoob'));

/*
app.use(function(req, res, next) {
  if(!req.secure) {
    return res.redirect('http://' + req.headers.host + req.path);
  }
  next();
});
*/
console.log(path.join(__dirname, 'dist'));
// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));


// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});



/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '4050';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);
//let server = https.createServer(app).listen(9991);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`QA-DKF-FRONTEND ${port}`));

