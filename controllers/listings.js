const Listing = require("../models/Listing.js");
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const mapToken = process.env.MAP_TOKEN;
// const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
    const listings = await Listing.find();
    res.render("listings", { listings });
};

module.exports.renderNewFOrm = (req, res) => {
    res.render("new.ejs");
};


module.exports.showListing = async (req, res) => {
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
};

module.exports.createListing = async (req, res) => {
    // let response = await geocodingClient 
    // .forwardGeocode({
    //     query: req.body.listing.location,
    //     limit: 1,
    // })
    // .send();
    let url = req.file.path;
    let filename = req.file.filename;   
    const { title, description, location, country, price, imageUrl, } = req.body;
    const newListing = new Listing({ title, description, location, country, price, image: { url: imageUrl } });
    newListing.owner = req.user._id;
    newListing.image = { url: url, filename: filename };     
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    return res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }

    // Resize image with Cloudinary transformations
    let originalImageUrl = listing.image.url;
    // originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250/blur:300");

    // Pass both listing and image URL to the view
    res.render("edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { title, description, location, country, price } = req.body;

    const updatedData = {
        title,
        description,
        location,
        country,
        price
    };

    // If new image is uploaded, update image as well
    if (req.file) {
        updatedData.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
        runValidators: true
    });

    if (!updatedListing) {
        throw new ExpressError(404, "Listing not found");
    }

    req.flash("success", "Listing updated!");
    return res.redirect(`/listings/${req.params.id}`);
};



module.exports.destroyListing = async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted!");
    return res.redirect("/listings");
}

