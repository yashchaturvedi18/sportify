
const model = require('../models/product');
const userModel = require('../models/user');

exports.index = (req,res,next)=>{
    //return all products here
    let categories = [];
    model.distinct("sport", function(error, results){
        console.log("results "+results);
        categories = results;
        console.log("categories "+categories);
    });
    model.find()
    .then(temp => {
       let tmp = JSON.stringify(temp);
       let products = JSON.parse(tmp);
        res.render('./product/products', {products, categories})})
    .catch(err=>next(err));
}

exports.new = (req,res)=>{
   res.render('./product/newProduct');
}



exports.create = (req, res, next) => {
    req.body.status = 'available';
    let tmpSport = req.body.sport.toLowerCase();
    console.log('tmpSport '+tmpSport);
    req.body.sport = tmpSport;
    let insertData = new model(req.body);//create a new product
    console.log('reqBody '+JSON.stringify(req.body));
    insertData.seller = req.session.user;
    insertData.save()//insert the document to the database
    .then(insertData=> {
            req.flash('success', 'You have successfully created new product');
            res.redirect('./products')
        })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);
            res.redirect('back');
        }
        next(err);
    });
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    model.findById(id)
    .then(product=>{
        if(product) {
            return res.render('./product/editProduct', {product});
        } else {
            let err = new Error('Cannot find product with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};


exports.update = (req, res, next) => {
    let product = req.body;
    let id = req.params.id;
    model.findByIdAndUpdate(id, product, {useFindAndModify: false, runValidators: true})
    .then(product=>{
        if(product) {
            req.flash('success', 'Product successfully updated');
            res.redirect('/products/'+id);
        } else {
            let err = new Error('Cannot find product with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError')
        {
        req.flash('error', err.message);
        res.redirect('back');
        }
        else{
            next(err);
        }

        
    });
};






exports.update = (req, res, next) => {
    let product = req.body;
    let id = req.params.id;
    model.findByIdAndUpdate(id, product, {useFindAndModify: false, runValidators: true})
    .then(product=>{
        if(product) {
            req.flash('success', 'Product successfully updated');
            res.redirect('/products/'+id);
        } else {
            let err = new Error('Cannot find product with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError')
        {
        req.flash('error', err.message);
        res.redirect('back');
        }
        else{
            next(err);
        }

        
    });
};


exports.delete = (req, res, next) => {

    let id = req.params.id;

    model.findByIdAndDelete(id, { useFindAndModify: false })
        .then(product => {
            if (product) {

                let tradedWithId = product.tradedWith;

                if (product.status === 'Offer Pending' && tradedWithId) {

                    
                    let tradeUpdateValue = { $set: { status: 'available' }, $unset: { tradedWith: "", tradeOfferedBy: "" } };
                    let tradeQuery = model.find({ _id: tradedWithId });
                    model.updateOne(tradeQuery, tradeUpdateValue, { useFindAndModify: false, runValidators: true })
                        .then(prod => {
                            if (!prod)
                                {
                                let err = new Error('Cant Update product with id ' + tradedWithId);
                                err.status = 404;
                                next(err);
                                }
                        });
                }
            } else {
                let err = new Error('Cannot Delete product with id');
                err.status = 404;
                next(err);
            }
            res.redirect('/users/profile');
        }).catch(err => next(err));
};

exports.newTrade = (req, res) => {
    let id = req.session.user;
    let tradeWith = req.params.tradeWith;
     Promise.all([userModel.findById(id), model.find({ seller: id })])
         .then(results => {
             const [user, products] = results;
             res.render('./product/newTrade', { user, products, tradeWith })
         })
         .catch(err => next(err));
 };
 
 exports.newTradeUpdate = (req, res, next) => {
     let userId = req.session.user;
 
     let tradeItem = req.body.tradeItem;
     let tradeWith = req.params.tradeWith;
 
     let findYourTradeItem = { _id: tradeItem };
     let setYourTradeItemStatus = { $set: { tradedWith: tradeWith, status: 'Offer Pending' } };
 
     let findItemTradedWith = { _id: tradeWith };
     let setItemTradedWithStatus = { $set: { tradedWith: tradeItem, status: 'Offer Pending', tradeOfferedBy: userId } };
 
     return this.updateOfferQueries(findYourTradeItem, setYourTradeItemStatus, findItemTradedWith, setItemTradedWithStatus, res, next);
 };

/*exports.delete = (req, res, next) => {
    let id = req.params.id;
    model.findByIdAndDelete(id, {useFindAndModify: false})
    .then(product =>{
        if(product) {
            res.redirect('/products');
        } else {
            let err = new Error('Cannot find product with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};*/
exports.show = (req, res, next) => {
    let id = req.params.id;
    let user = req.session.user;
    model.findById(id).populate('seller', 'firstName lastName')
    .then(product=>{
        if(product) {
            console.log("product "+product);
            console.log("user "+user);
            return res.render('./product/productDetails', {user,product});
        } else {
            let err = new Error('Cannot find a product with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>next(err));
};

exports.manageOffer = (req, res) => {
    let user = req.session.user;
    let exchangeWithId = req.params.tradeWith;
    let exchangeItemId = req.params.tradeItem;
    

    model.find({ _id: { $in: [exchangeItemId, exchangeWithId] } })
        .then(products => {
            const tradeProduct = products.filter(i => i._id.equals(exchangeItemId))[0];
            const tradeWith = products.filter(i => i._id.equals(exchangeWithId))[0];
            console.log("Yash tradeProduct "+tradeProduct);
            console.log("Yash tradeWith "+tradeWith);
            console.log("Yash user "+user);
            res.render('./product/manageOffer', { tradeProduct, tradeWith,user });
        })
        .catch(err => next(err));
};

exports.cancelOffer = (req, res, next) => {
    let tradeWith = req.params.tradeWith;
    let tradeItem = req.params.tradeItem;
    

    let findTradeItem = { _id: tradeItem };
    let updateTradeItemStatus = { $set: { status: 'available' }, $unset: { tradedWith: ""} };

    let findItemTradedWith = { _id: tradeWith };
    let updateTradedWithStatus = { $set: { status: 'available' }, $unset: { tradedWith: "", tradeOfferedBy: "" } };

    return this.updateOfferQueries(findTradeItem, updateTradeItemStatus, findItemTradedWith, updateTradedWithStatus, res, next);
};

exports.acceptOffer = (req, res, next) => {

    let tradeItem = req.params.tradeItem;
    let tradeWith = req.params.tradeWith;

    let findTradeItem = { _id: tradeItem };
    let updateTradeItemStatus = { $set: { status: 'Traded' } };

    let findItemTradedWith = { _id: tradeWith };
    let updateTradedWithStatus = { $set: { status: 'Traded' } };

    return this.updateOfferQueries(findTradeItem, updateTradeItemStatus, findItemTradedWith, updateTradedWithStatus, res, next);
};

exports.updateOfferQueries = (firstFind, firstUpdate, secondFind, secondUpdate, res, next) => {

    model.updateOne(firstFind, firstUpdate, { useFindAndModify: false, runValidators: true })
        .then(resp => {

            if (resp) {
                model.updateOne(secondFind, secondUpdate, { useFindAndModify: false, runValidators: true })
                    .then(prod => {

                        if (prod){
                            return res.redirect('/users/profile');
                        
                        }else{
                        let err = new Error('Cant Update product');
                        err.status = 404;
                        next(err);
                        }
                    })
            }
            else {
                let err = new Error('Cant Update product');
                err.status = 404;
                next(err);
            }
        })
        .catch(err => {
            if(err.name === 'ValidationError') {
            req.flash('error', 'ValidationError');
            return res.redirect('back');
        }
        next(err)});
};

exports.watchlistOperation = (req, res, next) => {

    let userId = req.session.user;

    let productId = req.params.id;
    let operation = req.body.operation;

    let findQuery = { _id: productId };
    let updateQuery;

    if (operation == "Watch") {
        updateQuery = { $push: { watchList: userId } };
    }
    else if (operation == "Unwatch") {
        updateQuery = { $pull: { watchList: userId } };
    }

    model.updateOne(findQuery, updateQuery)
        .then(result => {
            if (!result){
                let err = new Error("Cant Update product with id ' + productId");
                err.status = 404;
                next(err);
            }
            return res.redirect('/products/' + productId);

        }).catch(err => {
            if(err.name === 'ValidationError') {
            req.flash('error', 'ValidationError');
            return res.redirect('back');
        }
        next(err)});
}


