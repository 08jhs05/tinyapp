const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const { generateRandomString, getTemplateVars, getUserByEmail, urlsForUser } = require('./helpers');

const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const hashIteration = 10;

const urlDatabase = {
  sgq3y6: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}))

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const filteredUrls = urlsForUser(req.session.user_id, urlDatabase);
  res.render('urls_index', getTemplateVars(filteredUrls, users[req.session.user_id], req));
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {};
  urlDatabase[newShortURL].longURL = req.body.longURL;
  urlDatabase[newShortURL].userID = req.session.user_id;
  res.redirect('/urls/' + newShortURL);
});

app.get("/urls/new", (req, res) => {
  if(!req.session.user_id) res.redirect("/login");
  res.render("urls_new", getTemplateVars(urlDatabase, users[req.session.user_id], req));
});

app.get("/urls/:shortURL", (req, res) => {
  res.render("urls_show", getTemplateVars(urlDatabase, users[req.session.user_id], req));
});

app.get("/register", (req, res) => {
  res.render("register", getTemplateVars(urlDatabase, users[req.session.user_id], req));
});

app.post("/register", (req, res) => {

  if(!req.body.email || !req.body.password){
    res.send('Password/email cannot be blank')
    res.sendStatus(400);
  }

  if(getUserByEmail(req.body.email, users)){
    res.send('email already exists in database')
    res.sendStatus(400);
  }

  const user = { id: generateRandomString(),
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, hashIteration)
  };

  users[user.id] = user;

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.send('you do not have permission to delete/edit this url.');
    res.sendStatus(400);
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  urlDatabase[req.params.shortURL].userID = req.session.user_id;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if(urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.send('you do not have permission to delete/edit this url.');
    res.sendStatus(400);;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  res.render("login", getTemplateVars(urlDatabase, users[req.session.user_id], req));
});

app.post("/login", (req, res) => {
  if(!getUserByEmail(req.body.email, users)) {
    res.send('email you entered does not exist')
    res.sendStatus(403);
  }

  const currentUser = users[getUserByEmail(req.body.email, users)];
  if(!bcrypt.compareSync(req.body.password, currentUser.password)) {
    res.send('wrong password!!!');
    res.sendStatus(403);
  }

  req.session.user_id = currentUser.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});
