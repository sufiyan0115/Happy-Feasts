const Campground = require('../models/campground');
const mbxGeocoding =  require("@mapbox/mapbox-sdk/services/geocoding");
const { query } = require('express');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('restaurants/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('restaurants/new');
}

module.exports.createCampground = async (req, res, next) => {
  const geoData =   await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    req.body.campground.geometry = geoData.body.features[0].geometry;
    const shit = geoData.body.features[0].geometry;
    console.log(shit);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    console.log(campground);
    await campground.save();
    req.flash('success', 'Successfully added a new restaurant!');
    res.redirect(`/restaurants/${campground._id}`)
}

module.exports.showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that restaurant!');
        return res.redirect('/restaurants');
    }
    res.render('restaurants/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that restaurant!');
        return res.redirect('/restaurants');
    }
    res.render('restaurants/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const geoData =   await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    req.body.campground.geometry = geoData.body.features[0].geometry;
    const { id } = req.params;
    console.log(req.body.campground);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated the restaurant!');
    res.redirect(`/restaurants/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the restaurant')
    res.redirect('/restaurants');
}