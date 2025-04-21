const Listing = require("../models/Listing.js");
const Review = require("../models/review.js");


module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    // Debugging line
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    const { rating = 1, comment } = req.body.review;

    const newReview = new Review({
        comment,
        rating: Number(rating),
        author: req.user._id
    });


    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", " review Added");
    res.redirect(`/listings/${listing._id}`);
}; 

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove review reference from listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the actual review
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
}