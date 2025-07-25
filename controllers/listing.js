const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async (req,res) =>{
    const allListings= await  Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm=(req,res) =>{
    res.render("listings/new.ejs")
};

module.exports.showListing=async (req,res) =>{
    let {id} =req.params;
    const listing=await Listing.findById(id)
          .populate({path:"reviews",
               populate:{
                path:"author"},
              })
           .populate("owner");  
    if(!listing){
        req.flash("error","Cannot find that listing!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});              
};

module.exports.createListing=async (req,res) =>{

   let response=await geocodingClient.forwardGeocode({
   query:req.body.listing.location,
   limit: 1,
})
  .send()
 

    let url=req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the logged-in user
    newListing.image={url,filename};

    newListing.geometry= response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","Successfully created a new listing!");
    res.redirect("/listings");
};

module.exports.renderEditForm=async (req,res) =>{
    let {id} =req.params;
    const listing=await Listing.findByIdAndUpdate(id);
    if(!listing){
        req.flash("error","Cannot find that listing!");
        return res.redirect("/listings");
    }
    let originalImage= listing.image.url;
    originalImageUrl=originalImage.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    const response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    let listing = await Listing.findByIdAndUpdate(id, {
        ...req.body.listing,
        geometry: response.body.features[0].geometry
    });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
};


module.exports.deleteListing=async (req,res) =>{
    let {id} =req.params;
    let deleteListing= await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success","Successfully deleted the listing!");
    res.redirect("/listings");
};
