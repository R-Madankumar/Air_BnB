const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/Listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js"); // Import isOwner

// Home Route
router.get("/home", wrapAsync(async (req, res) => {
    res.render("home");
}));

// Fetch all listings
router.get("/", wrapAsync(async (req, res) => {
    const listings = await Listing.find();
    res.render("listings", { listings });
}));

// Render new listing form
router.get("/new", isLoggedIn, (req, res) => {
    res.render("new.ejs");
});

// Add new listing
router.post("/", isLoggedIn, wrapAsync(async (req, res) => {
    const { title, description, location, country, price, imageUrl } = req.body;
    const newListing = new Listing({ title, description, location, country, price, image: { url: imageUrl } });
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    return res.redirect("/listings");
}));

// Show listing
router.get("/:id", wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
    .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("show", { listing });
}));

// Edit listing form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("edit", { listing });
}));

// Update listing
router.put("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const { title, description, location, country, price, imageUrl } = req.body;
    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, {
        title, description, location, country, price, image: { url: imageUrl }
    }, { new: true, runValidators: true });

    if (!updatedListing) {
        throw new ExpressError(404, "Listing not found");
    }
    req.flash("success", "Listing updated!");
    return res.redirect(`/listings/${req.params.id}`);
}));

// Delete listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted!");
    return res.redirect("/listings");
}));

module.exports = router;
