const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const ListingSchema = new mongoose.Schema({
  title: String,

  description: String,

  image: {
    filename: String,
    url: String
  },

  price: Number,

  location: String,

  country: String,

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  
});

// Delete reviews when a listing is deleted
ListingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;
