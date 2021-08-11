const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  return this.family_name + ", " + this.first_name;
});

// Virtual for formatted author's birth date
AuthorSchema.virtual("birth").get(function () {
  let birthdate_string = "";
  if (this.date_of_birth) {
    birthdate_string = DateTime.fromJSDate(this.date_of_birth).toSQLDate();
  }
  return birthdate_string;
});

// Virtual for formatted author's death date
AuthorSchema.virtual("death").get(function () {
  let deathdate_string = "";
  if (this.date_of_death) {
    deathdate_string = DateTime.fromJSDate(this.date_of_death).toSQLDate();
  }
  return deathdate_string;
});

// Virtual for author's lifespan
AuthorSchema.virtual("lifespan").get(function () {
  let lifetime_string = "";
  if (this.date_of_birth) {
    lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(
      DateTime.DATE_FULL
    );
  }
  lifetime_string += " - ";
  if (this.date_of_death) {
    lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(
      DateTime.DATE_FULL
    );
  } else {
    lifetime_string += "Present";
  }
  return lifetime_string;
});

// Virtual for author's url
AuthorSchema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});

//Export model
module.exports = mongoose.model("Author", AuthorSchema);
