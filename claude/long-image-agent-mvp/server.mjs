import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(join(__dirname, 'output')));
app.listen(3456, () => console.log('Server running on http://localhost:3456'));
