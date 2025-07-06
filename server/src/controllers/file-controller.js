const fs = require('fs');

const uploadFile =  async (req, res)=>{
    const file = req.file;
    if (!file) return res.status(400).send('No file uploaded.');

    const content = fs.readFileSync(file.path, 'utf-8');
    fs.unlinkSync(file.path); // Clean up after reading
    res.send({ content });
}

module.exports ={ uploadFile };