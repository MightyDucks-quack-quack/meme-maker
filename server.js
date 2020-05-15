'use strict';

require('dotenv').config();
const cors = require('cors');

const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const pg = require('pg');
const methodOverride = require('method-override');
const app = express();

const client = new pg.Client(process.env.DATABASE_URL);
app.use(cors());

//brings in EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));



app.get('/', handleIndexPage);
app.get('/new', searchMemes);
app.get('/searches', resultsFromAPI);
app.post('/save', saveThisMeme);
app.post('/caption', captionMeme);
app.get('/fav', handleFav);

app.delete('/delete/:id', deleteMeme);

app.get('/aboutus', aboutUs);

// app.get('/onememe/:id', handleOneMeme);



function handleFav(request, response) {
  const SQL = `SELECT * FROM memes`;

  client.query(SQL)
    .then(results => {
      response.status(200).render('pages/save', { memes: results.rows });
    });
}

function handleIndexPage(request, response) {
  response.status(200).render('pages/index');
}

function aboutUs(request, response) {
  response.status(200).render('pages/aboutus')
}

function resultsFromAPI(request, response) {
  let url = 'http://api.imgflip.com/get_memes';


  superagent.get(url)
    .then(results => {
      let input = request.query.name
      let meme = results.body.data.memes
      let r = new RegExp(input, 'ig')
      let filt = meme.filter(v => r.test(v.name))
      let selection = filt.map(memes => new Memes(memes));
      response.status(200).render('pages/searches/show', { meme: selection });
    });
}
// v.name.includes(input) ? v : null
function captionMeme(request, response) {
  // console.log('Meme to be added: ', request.body);
  // let url = 'https://api.imgflip.com/caption_image';

  const queryStringParams = {
    username: process.env.IMGFLIP_API_USERNAME,
    password: process.env.IMGFLIP_API_PASSWORD,
    template_id: request.body.id,
    text0: request.body.text0,
    text1: request.body.text1,
    format: 'json',
    limit: 1,
  };
  console.log(queryStringParams)


  superagent.post('https://api.imgflip.com/caption_image')
    .type('form')
    .send(queryStringParams)
    .then(results => {
      let data = results.body.data.url;
      response.status(200).render('pages/onememe', { data });
    })
    .catch(error => {
      console.error(error.message);
    });
}

function saveThisMeme(request, response) {
  // console.log('Book to be added: ', request.body);
  let SQL = `
    INSERT INTO memes (name, url, text0, text1)
    VALUES($1, $2, $3, $4)
  `;

  let VALUES = [
    request.body.name,
    request.body.data,
    request.body.text0,
    request.body.text1,
  ];

  client.query(SQL, VALUES)
    .then(results => {
      response.status(200).redirect('/fav');
    })
    .catch(error => {
      console.error(error.message);
    });
}


function searchMemes(request, response) {
  response.status(200).render('pages/searches/new');
}



function Memes(data) {
  this.name = data.name;
  this.template_id = data.id;
  this.url = data.url;
  this.text0 = data.text0;
  this.text1 = data.text1;
  this.font = data.arial;
}

function deleteMeme(request, response) {
  let id = request.params.id;
  let SQL = `DELETE FROM memes WHERE id = $1`;
  let VALUES = [id];
  client.query(SQL, VALUES)
    .then(results => {
      response.status(200).redirect('/fav');
    });
}

// This will force an error
app.get('/badthing', (request, response) => {
  throw new Error('bad request???');
});

// 404 Handler
app.use('*', (request, response) => {
  response.status(404).send(`Can't Find ${request.path}`);
});

// Error Handler
app.use((err, request, response, next) => {
  console.error(err);
  response.status(500).render('pages/error', { err });
});

// Startup
function startServer() {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

//connecting the client to the databse//
client.connect()
  .then(() => {
    startServer(PORT);
  })
  .catch(err => console.error(err));


//     superagent.post(urlGoesHere).send( {} ) … and that object is an object where you’d have the user/pass props
// In your server file you’d do that
