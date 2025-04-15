const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const Review = require("../models/review.js");
const Listing = require("../models/Listing.js");
const { isLoggedIn ,isReviewAuthor} = require("../middleware.js");



// Middleware to validate review body

// Create a new review and add to listing
router.post("/", isLoggedIn, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    // Debugging line
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", " review Added");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete a review
router.delete("/:reviewId", isLoggedIn,isReviewAuthor,wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove review reference from listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the actual review
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
