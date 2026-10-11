const express = require('express');
const fs = require('fs-extra');
const paths = require('path');
const multer  = require('multer');

const SearchIndex = require('./SearchIndex');
const Repository = require('./Repository');

const config = fs.readJsonSync('./config.json');

const PORT = 3000;
const BASE = config.repositoryBase || './_repository';

const app = express();
const search = new SearchIndex(BASE);
const repo = new Repository(BASE);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + paths.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.sendFile(paths.join(__dirname, '/webapp/index.html'));
});

app.get('/api/list', (req, res) => {
  let filter = null;
  if (Object.keys(req.query).length != 0) filter = req.query;

  search.listAll(filter).then((rv) => {
    res.send(rv);
  });
});

app.get('/api/search', (req, res) => {
  let text = req.query.query;
  let filter = null;
  if (Object.keys(req.query).length != 0) filter = req.query;

  search.searchText(text, filter).then((rv) => {
    res.send(rv);
  });
});

app.get('/api/groups', (req, res) => {
  search.listGroups().then((rv) => {
    res.send(rv);
  });
});

app.post('/api/capture', upload.single('datafile'), (req, res) => { 
  let ts = req.body.modified;
  let gn = req.body.groupname;

  if (!ts) ts = new Date().toISOString();
  if (ts.length < 24) ts += ':00.000Z';
  
  if (req.file) {
    let info = {
      type: 'Document File',
      group: gn,
      title: req.body.filename.replace(/\.[0-9a-z_-]+$/, ''),
      comments: req.body.textcontent,
      resource: escape(req.body.filename),
      timestamp: ts
    };

    repo.createFragment(info, req.file.path).then((rv) => {
      if (rv) {
        search.indexPath(rv);
      }
      console.log('done');
    });
  }
  else {
    let info = {
      type: 'Text Comment',
      group: gn,
      title: req.body.filename,
      comments: req.body.textcontent,
      timestamp: ts
    };

    console.log(info);
    repo.createFragment(info).then((rv) => {
      console.log('done');
    });
  }

  res.redirect('/webapp/capture.html');
});

app.get('/webapp*filepath', (req, res) => {
  let name = req.params.filepath.join('/');

  res.sendFile(paths.join(__dirname, '/webapp/'+name));
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

