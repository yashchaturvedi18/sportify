const { body } = require('express-validator');
const { validationResult } = require('express-validator');


//check if the route parameter is valid ObjectId type value
exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else {
        let err = new Error('Invalid product  id');
        err.status = 400;
        return next(err);
    }
};

exports.validateSignUp = [body('firstName', 'First name cannot be empty!!!').notEmpty().trim().escape(),
body('lastName', 'Last name cannot be empty!!!').notEmpty().trim().escape(),
body('email', 'Invalid Email Address!!!').isEmail().trim().escape().normalizeEmail(),
body('password', 'Invalid Password (must between 8-64 chars)!!!').isLength({ min: 8, max: 64 })];

exports.validateLogin = [body('email', 'Invalid Email Address!!!').isEmail().trim().escape().normalizeEmail(),
body('password', 'Invalid Password (must between 8-64 chars)!!!').isLength({ min: 8, max: 64 })];

exports.validateResult = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else return next();
};

exports.validateProduct = [body('title', 'Title cant be empty').notEmpty().trim().escape(),
body('sport', 'Sport cant be empty!!!').notEmpty().trim().escape(),
body('desc', 'Description should atleast contain 10 chars').isLength({ min: 10 }).trim().escape(),
body('title', 'Title cant be empty!!!').notEmpty().trim().escape(),
body('imgPath', 'Image Path  cant be empty').notEmpty()];