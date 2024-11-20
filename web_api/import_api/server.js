const express = require('express');
const cors = require('cors');
const Swagger2Apipost = require('swagger2apipost');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('.'));

app.post('/convert', async (req, res) => {
    try {
        const swaggerJson = req.body;
        const converter = new Swagger2Apipost();
        const result = await converter.convert(swaggerJson);
        res.json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
