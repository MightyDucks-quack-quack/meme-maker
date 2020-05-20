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
app.get('/searches', resultsFromAPI);
app.post('/save', saveThisMeme);
app.post('/caption', captionMeme);
app.get('/fav', handleFav);

app.delete('/delete/:id', deleteMeme);

app.get('/aboutus', aboutUs);

app.get('/gif', handleGif)

// https://api.giphy.com/v1/gifs/search?api_key=f6iwV5SctL1BoO472MJhB7N5dTuwIQnp&q=&limit=25&offset=0&rating=G&lang=en

function handleGif(req, res) {
  let url = `https://api.giphy.com/v1/gifs/search`

  let queryStringParams = {
    api_key: process.env.GIPHY_KEY,
    q: req.query.gifSearch,
    limit: 9,
  }

  console.log(queryStringParams)
  superagent.get(url)
    .query(queryStringParams)
    .then(results => {
      console.log(results.body.data.original)
      let selection = results.body.data.map(memes => new Gifs(memes));
      res.status(200).render('pages/searches/gif', { meme: selection });
    })


}

function Gifs(data) {
  this.name = data.name;
  this.template_id = data.id;
  this.url = data.images.original.url;
  this.text0 = data.text0;
  this.text1 = data.text1;
  this.font = data.arial;
  this.box_count = data.box_count
}



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

function captionMeme(request, response) {

  const queryStringParams = {
    username: process.env.IMGFLIP_API_USERNAME,
    password: process.env.IMGFLIP_API_PASSWORD,
    template_id: request.body.id,
    boxes: [
      {
        "text": request.body.text0,
      },
      {
        "text": request.body.text1,
      },
      {
        "text": request.body.text2,
      },
      {
        "text": request.body.text3,
      },
      {
        "text": request.body.text4,
      },
    ],
    format: 'json',
    limit: 1,
  };

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

function Memes(data) {
  this.name = data.name;
  this.template_id = data.id;
  this.url = data.url;
  this.text0 = data.text0;
  this.text1 = data.text1;
  this.font = data.arial;
  this.box_count = data.box_count
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
  response.status(404).render('pages/error');
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
