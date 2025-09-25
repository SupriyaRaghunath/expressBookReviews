const express = require("express");
let books = require("./booksdb.js");
const { default: axios } = require("axios");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.send(JSON.stringify({ books }, null, 4));
});

public_users.get("/books", async function (req, res) {
  //Write your code here
  try {
    let books = await axios.get(
      "https://supriyaraghu-8080.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/"
    );
    return res.status(200).json(books.data);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching books", error: err.message });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  let { isbn } = req.params;

  return res.send(books[isbn]);
});

//get book details based on ISBN using async await

public_users.get("/isbnaxios/:isbn", function (req, res) {
  let { isbn } = req.params;

  axios
    .get(
      `https://supriyaraghu-8080.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/isbn/${isbn}`
    )
    .then((resp) => {
      return res.status(200).json(resp.data);
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ message: "Error fetching books", error: err.message });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  let { author } = req.params;

  author = author.split("_").join("").toLowerCase();

  let wantedBook = Object.keys(books).filter((book) => {
    return books[book].author.split(" ").join("").toLowerCase() === author;
  });
  wantedBook.length
    ? res.send(books[wantedBook])
    : res.send("Couldn't find the book");
});
//get books based on author using axios

public_users.get("/authoraxios/:author", async function (req, res) {
  //Write your code here
  let { author } = req.params;
  author = author.split("_").join("").toLowerCase();

  try {
    let books = await axios.get(
      "https://supriyaraghu-8080.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/"
    );

    let wantedBook = Object.keys(books.data.books).filter((book) => {
      return (
        books.data.books[book].author.split(" ").join("").toLowerCase() ===
        author
      );
    });
    wantedBook.length
      ? res.send(books.data.books[wantedBook])
      : res.send("Couldn't find the book");
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching books", error: err.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let { title } = req.params;

  title = title.split("_").join("").toLowerCase();

  let wantedBook = Object.keys(books).filter((book) => {
    return books[book].title.split(" ").join("").toLowerCase() === title;
  });
  wantedBook.length
    ? res.send(books[wantedBook])
    : res.send("Couldn't find the book");
});

// Get all books based on title

public_users.get("/titleaxios/:title", async function (req, res) {
  let { title } = req.params;

  title = title.split("_").join("").toLowerCase();

  try {
    let books = await axios.get(
      "https://supriyaraghu-8080.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/"
    );

    let wantedBook = Object.keys(books.data.books).filter((book) => {
      return (
        books.data.books[book].title.split(" ").join("").toLowerCase() === title
      );
    });
    wantedBook.length
      ? res.send(books.data.books[wantedBook])
      : res.send("Couldn't find the book");
  } catch (err) {}
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  let { isbn } = req.params;

  return res.send(books[isbn].reviews);
});

module.exports.general = public_users;
