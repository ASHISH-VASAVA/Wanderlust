if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js")
const Session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
const { error } = require("console");

// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dburl=process.env.ATLASDB_URL;


main()
.then(() =>{
    console.log("Connected DB");
})
    .catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dburl);
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store=MongoStore.create({
    mongoUrl:dburl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7 ,// 7 days
        httpOnly: true,
    }   
}

app.get("/",(req,res)=>{
    res.redirect("/listings");
});


app.use(Session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());   

app.use((req,res,next) =>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         username: "demoUser111",
//         email: "demo@111example.com"
//     });
//     let registeredUser=await  User.register(fakeUser, "Helloword");
//     res.send(registeredUser);
// });

app.use("/listings",listingRouter);      
app.use("/listings/:id/reviews",reviewRouter    );
app.use("/",userRouter);


app.all("*",(req,res,next) =>{
    next(new ExpressError(404,"Page not Found!"));
});

app.use((err,req,res,next) =>{
    let{statusCode=505,message="Something went wrong!"}=err;
    res.status(statusCode).render("error.ejs" ,{message})
    //res.status(statusCode).send(message);
});

app.listen(8080, ()=>{
    console.log("Server is listenig on port 8080");
});