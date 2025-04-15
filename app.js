const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const homeRoute = require("./routes/home.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(bodyParser.urlencoded({ extended: true }));


const PORT = 8080;



// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/airbnb_clone")
 .then(() => console.log("✅ MongoDB Connected to airbnb_clone"))  
 .catch(err => console.error("❌ MongoDB Connection Error:", err)
);




const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // ✅ now a Date object
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
};


app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Add this before your route handlers to debug



app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error'); 
    res.locals.currUser = req.user;
    next();
});



app.use("/", homeRoute);

app.use("/listings", listingsRouter);

app.use("/listings/:id/reviews/",reviewsRouter);

app.use("/", userRouter);





// Catch-all for undefined routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});



// Global error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs",{err});
});



app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
