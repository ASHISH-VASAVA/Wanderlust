const Listing = require("../models/listing.js");
const Review= require("../models/review.js");

module.exports.createReview=async (req,res) =>{
    let listing=await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id; // Set the author to the current user
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","Successfully created a new review!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview=async (req,res) =>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
    req.flash("success","Successfully deleted the review!");
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
};