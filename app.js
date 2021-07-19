const express = require('express');
const session = require('express-session');
const { v4 } = require('uuid');
const fs = require("fs");
const path = require('path');
const app = express();
const PORT = 3000;

app.use(session({
  genid: function(req){
    return v4();
  },
  cookie: {expires: 1800000},
  secret: 'secret_key',
  name: 'uniqueSessionID',
  saveUninitialized: false
}))

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname) })
})

app.get(`/docs/:id`, (req, res) => {
  // console.log(req.session);
  if(req.session.loggedIn){
    if (req.params.id) {
      fs.readFile(`docs/${req.params.id}`, function (err, data) {
        if (err) {
          console.log(err);
        }
        res.contentType("application/pdf");
        res.send(data);
      });
    }
  }else{
    res.sendFile('login.html', {root: path.join(__dirname) })
  }
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: path.join(__dirname) })
})

app.post('/authenticate'
  , express.urlencoded({ extended: true })
  , (req, res, next) => {
    if (req.body.username == 'test' && req.body.password == 'test') {
      res.locals.username = req.body.username
      next()
    }
    else
      res.sendStatus(401)
  }
  , (req, res) => {
      const header = req.header('Referer');
      req.session.loggedIn = true
      req.session.username = res.locals.username
      console.log(req.session)
      if(header.includes('/docs/')){
        res.redirect(header);
      }else{
        res.redirect("/")
      }
  })

app.listen(PORT, () => { console.log(`Website is running on ${PORT}`) });

