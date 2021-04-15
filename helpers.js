// ===================================== helper functions =========================================

function generateRandomString() {
  let result           = [];
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( var i = 0; i < 6; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
 }
 return result.join('');
}

function getTemplateVars(urlDatabase, user, req){
  return { urls: urlDatabase,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] === undefined ? undefined : urlDatabase[req.params.shortURL].longURL,
    user: user
  }
}

function getUserByEmail(email, database){
  for(user in database){
    if(database[user].email === email) return user;
  }
  return undefined;
}

function urlsForUser(id, urlDatabase){
  const result = {};
  for(url in urlDatabase){
    if(urlDatabase[url].userID === id) {
      result[url] = {};
      result[url].longURL = urlDatabase[url].longURL;
      result[url].userID = urlDatabase[url].userID;
    }
  }
  return result;
}

module.exports = { generateRandomString, getTemplateVars, getUserByEmail, urlsForUser };