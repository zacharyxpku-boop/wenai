const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'output')));
app.listen(3456, () => console.log('Server running on http://localhost:3456'));
