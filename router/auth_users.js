const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

regd_users.post("/login", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };

    console.log(req.session);
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
  next();
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;
  // Check login
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Check book existence
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or modify the review for this user
  books[isbn].reviews[username] = review;

  return res.json({
    message: "Review added/modified successfully",
    book: books[isbn],
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username; // ✅ logged-in user

  // Check if user is logged in
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if this user has posted a review for the book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user" });
  }

  // Delete only this user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    book: books[isbn],
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
