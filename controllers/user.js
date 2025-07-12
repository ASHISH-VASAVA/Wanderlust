const User = require("../models/user"); 

module.exports.renderSignupForm=(req,res)=>{
    res.render("users/signup");
};

module.exports.renderNewForm=async(req,res) =>{
    try{
           let {username,email,password}=req.body;
           const  newUser=new User({username,email});
           const  registeredUser=await User.register(newUser,password);
           console.log(registeredUser);
           req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
             req.flash("success","Welcome to wanderlust!");
             res.redirect("/listings");
           })
          
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/signup");
    }
 
};

module.exports.renderLoginForm=(req,res)=>{
    res.render("users/login");
};

module.exports.renderLogin=async(req,res)=>{
    req.flash("success","Welcome back!");
    res.redirect(res.locals.redirectUrl || "/listings");
};

module.exports.renderLogout=(req,res)=>{
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/listings");
    });
};