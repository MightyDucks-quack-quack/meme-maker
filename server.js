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
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static('./public'));



app.get ('/', handleIndexPage);
app.get('/new', searchMemes);
app.get('/searches', resultsFromAPI);
app.post('/add', addNewMeme);
// app.get('/onememe/:id', handleOneMeme);
// app.put('/update-meme/:id', handleUpdate);



// function handleUpdate(request, response){
//     let SQL = 'UPDATE memes set name = $1, url= $2, width= $3, height = $4, box_count= $5 WHERE id = $6';
//     let VALUES = [
//       request.body.name, 
//       request.body.url, 
//       request.body.width, 
//       request.body.height, 
//       request.body.box_count, 
//       request.params.id,
//     ];
    
//     client.query(SQL, VALUES)
//       .then(results => {
//         response.status(200).redirect(`/onememe/${request.params.id}`)
//       })
  
  
//   }
  


function handleIndexPage (request, response)  {
    response.status(200).render('pages/index');
  }




  // function handleOneMeme( request, response) {
  //   const SQL = `SELECT * FROM memes WHERE id = $1`;
  //   const VALUES = [request.params.id];
  //   client.query(SQL, VALUES)
  //     .then( results => {
  //       response.status(200).render('pages/onememe', {memes:results.rows[0]});
  //     })
  //     .catch(error => {
  //       console.error(error.message);
  //     });
    
  // }



  function addNewMeme (request, response) {
    // console.log('Book to be added: ', request.body);
    let SQL = `
      INSERT INTO memes (name, url, width, height, box_count)
      VALUES($1, $2, $3, $4, $5)
    `;
  
  let VALUES = [
    request.body.name,
    request.body.url,
    request.body.width,
    request.body.height,
    request.body.box_count,
  ];
  
  if ( ! (request.body.name || request.body.url || request.body.width || request.body.height || request.body.box_count) ) {
    throw new Error('invalid input');
  }
  
  client.query(SQL, VALUES)
    .then(data => {
      response.status(200).redirect('/');
    })
    .catch( error => {
      console.error( error.message );
    });
  }



  function searchMemes(request, response) {
    response.status(200).render('pages/searches/new')
  };
  
  
  // function handleOneBook( request, response) {
  //   const SQL = `SELECT * FROM memes WHERE id = $1`;
  //   const VALUES = [request.params.id];
  //   client.query(SQL, VALUES)
  //     .then( results => {
  //       response.status(200).render('pages/onememe', {memes:results.rows[0]});
  //     })
  //     .catch(error => {
  //       console.error(error.message);
  //     });
    
  // }


  function resultsFromAPI (request, response) {
    let url = 'http://api.imgflip.com/get_memes';
    

    superagent.get(url)
    .then(results => {
      console.log(results);
      let meme = results.body.data.memes.map(memes => new Memes(memes));
      response.status(200).render('pages/searches/show', {meme:meme});
    });
  };


  function Memes(data) {
    this.name = data.name;
    this.url = data.url;
    this.width = data.width;
    this.height = data.height;
    this.box_count = data.box_count;
  }



  // This will force an error
app.get('/badthing', (request,response) => {
    throw new Error('bad request???');
  });
  
  // 404 Handler
  app.use('*', (request, response) => {
    response.status(404).send(`Can't Find ${request.path}`);
  });
  
  // Error Handler
  app.use( (err,request,response,next) => {
    console.error(err);
    response.status(500).render('pages/error', {err})
  });
  
  // Startup
  function startServer() {
    app.listen( PORT, () => console.log(`Server running on ${PORT}`));
  }
  
  //connecting the client to the databse//
  client.connect()
    .then( () => {
      startServer(PORT);
    })
    .catch(err => console.error(err));


//     superagent.post(urlGoesHere).send( {} ) … and that object is an object where you’d have the user/pass props
// In your server file you’d do that
