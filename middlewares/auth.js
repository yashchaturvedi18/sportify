const Product = require('../models/product');

//guest
exports.isGuest = (req, res, next)=>{
    if(!req.session.user){
        return next();
    } else {
        req.flash('error','You are already logged in');
        return res.redirect('/users/profile');
    }
};

//user  authenticated
exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user){
        return next();
    } else {
        req.flash('error','Please log in first');
        return res.redirect('/users/login');
    }
};

//user is host
exports.isHost = (req, res, next)=>{
    let id = req.params.id;
    Product.findById(id)
    .then(product => {
        if(product){
            if(product.seller == req.session.user){
                return next();
            } else {
                //let err = new Error('Unauthorized to access this resource');
                //err.status = 401;
                //return next(err);
                req.flash('error','Unauthorized to access this resource');
                return res.redirect('/');
            }
        }
    })
    .catch(err=>next(err));
};

exports.isValidTrade = (req, res, next) => {
    let tradeItem = req.params.tradeItem;
    let tradeWith = req.params.tradeWith;

    let userId = req.session.user;

    console.log("valtrade tradeItem => ", tradeItem , "tradedWith => ", tradeWith);

    Product.find({ $and: [{ _id: tradeItem }, { seller: userId }, { tradedWith: tradeWith }] })
        .then(product => {
            if (product.length > 0) {
                return next();
            }
            else {
                console.log("err => ");
                let err = new Error("Unauthorized access to the trade");
                err.status = 401;
                console.log(err);
                return next(err);
            }
        })
        .catch(err => next(err));
}

