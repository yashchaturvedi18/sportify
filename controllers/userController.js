const model = require("../models/user");
const product = require("../models/product");

exports.new = (req, res) => {
  res.render("./user/new");
};

exports.create = (req, res, next) => {
  let user = new model(req.body);
  user
    .save()
    .then((user) => {
      req.flash("success", "You have successfully registered");
      res.redirect("/users/login");
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("/users/new");
      }

      if (err.code === 11000) {
        req.flash("error", "Email has already been used");
        return res.redirect("/users/new");
      }

      next(err);
    });
};

exports.getUserLogin = (req, res, next) => {
  res.render("./user/login");
};

exports.login = (req, res, next) => {
  let email = req.body.email;
  let password = req.body.password;

  model
    .findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Wrong email address");
        res.redirect("/users/login");
      } else {
        user
          .comparePassword(password)
          .then((result) => {
            if (result) {
              req.session.user = user._id;
              req.session.firstName = user.firstName;
              req.session.lastName = user.lastName;
              req.flash("success", "You have successfully logged in");
              res.redirect("/users/profile");
            } else {
              req.flash("error", "Wrong password");
              res.redirect("/users/login");
            }
          })
          .catch((err) => next(err));
      }
    })
    .catch((err) => next(err));
};

/*exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id), product.find({seller: id})]) 
    .then(results=>{
        const [user, products] = results;
        res.render('./user/profile', {user, products})
    })
    .catch(err=>next(err));
};
*/

exports.profile = (req, res, next) => {
  let id = req.session.user;

  Promise.all([model.findById(id), product.find({ seller: id })])
    .then((response) => {
      const [user, products] = response;

      product
        .find({
          $or: [
            { tradeOfferedBy: id, status: "Offer Pending" },
            { watchList: id },
          ],
        })
        .then((recvProducts) => {
          const watchList = recvProducts.filter(
            (i) => i.watchList.indexOf(id) !== -1
          );
          const offers = recvProducts.filter(
            (i) => i.tradeOfferedBy == id && i.status === "Offer Pending"
          );
          res.render("./user/profile", { user, products, offers, watchList });
        });
    })
    .catch((err) => next(err));
};

exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    else res.redirect("/");
  });
};
