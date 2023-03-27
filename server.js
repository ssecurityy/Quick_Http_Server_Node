const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


app.get('/favicon.ico', (req, res) => {
  res.sendFile(__dirname + '/favicon.ico');
});

// endpoint for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// endpoint for file upload
app.post('/upload', upload.single('file'), (req, res) => {
  let file = req.file;
  let fileName = file.originalname;
  let filePath = file.destination + fileName;
  let counter = 1;
  while (fs.existsSync(filePath)) {
    fileName = `${counter}-${file.originalname}`;
    filePath = file.destination + fileName;
    counter++;
  }
  fs.renameSync(file.path, filePath);
  res.send(`File uploaded successfully. Filename: ${fileName}`);
});

// endpoint for file download
app.get('/download/:file(*)', (req, res) => {
  let file = req.params.file;
  let fileLocation = path.join(__dirname + '/uploads/', file);
  if (fs.existsSync(fileLocation)) {
    res.download(fileLocation, file);
  } else {
    res.status(404).send('File not found.');
  }
});

app.get('/files', (req, res) => {
  fs.readdir('./uploads/', (err, files) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send(files);
  });
});

app.use(express.static('public'));

//const options = {
  //key: fs.readFileSync('server.key'),
  //cert: fs.readFileSync('server.crt')
//};

//https.createServer(options, app)
//  .listen(3000, () => {
  //  console.log('Server started on port 3000');
  //});


// start the server
app.listen(3000, () => {
  console.log('Server started on port 3000.');
});
