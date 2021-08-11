const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = function (req, res) {
  Genre.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_of_genres) {
      if (err) return err;

      //success so render
      res.render("genre_list", {
        title: "Genre List",
        genre_list: list_of_genres,
      });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_books: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // validate and sanitize the name field
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  // process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors froma request
    const errors = validationResult(req);

    // create a Genre object with escaped and trimmed data
    let genre = new Genre({
      name: req.body.name,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error msgs   }
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid
      // Check if Genre with same name alreafy exists

      Genre.findOne({ name: req.body.name }).exec(function (err, found_genre) {
        if (err) return next(err);

        if (found_genre) {
          // Genre exists, redirect to its detail page
          res.redirect(found_genre.url);
        } else {
          genre.save(function (err) {
            if (err) return next(err);
            // Genre saved. Redirect to genre detail page
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_books: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);

      if (results.genre == null) {
        // No result return to genres
        res.redirect("/catalog/genres");
      }

      res.render("genre_delete", {
        title: "Genre delete",
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res) {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_books: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);

      if (results.genre == null) {
        // No result return to genres
        res.redirect("/catalog/genres");
      }

      // If there are books in the selected genre
      if (results.genre_books.length > 0) {
        res.render("genre_delete", {
          title: "Genre delete",
          genre: results.genre,
          genre_books: results.genre_books,
        });
      } else {
        Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
          if (err) return err;

          res.redirect("/catalog/genres");
        });
      }
    }
  );
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).populate("book").exec(callback);
      },
    },
    function (err, results) {
      if (err) next(err);
      if (results == null) {
        let err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }

      res.render("genre_form", {
        title: "Update Genre",
        genre: results.genre,
      });
    }
  );
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res, next) {
  // Validate and sanitize fields
  body("name", "Genre must not be empty").trim().isLength({ min: 1 }).escape();
  const errors = validationResult(req);
  let genre = new Genre({
    name: req.body.name,
    _id: req.params.id,
  });
  // if there are errors
  if (!errors.isEmpty()) {
    res.render("genre_form", {
      title: "Update genre",
      genre: res.genre,
      errors: errors.array(),
    });
    return;
  } else {
    console.log(req.params.id, "params");
    // data is valid, so we can update
    Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, thegenre) {
      if (err) {
        return next(err);
      }

      // success
      res.redirect(thegenre.url);
    });
  }
};
