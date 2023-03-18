const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const productRoutes = require('./routes/productRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

let port = 443;
let host = 'localhost';
app.set('view engine','ejs');


//DB connection 
//connect to database
mongoose.connect('mongodb://localhost:27017/demos', 
                {useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    //start app
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));


//middlewares
app.use(
    session({
        secret: "dfghsajkjljkddsds",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/demos'}),
        cookie: {maxAge: 60*60*1000}
        })
);
app.use(flash());
app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user||null;
    res.locals.firstName = req.session.firstName||null;
    res.locals.lastName = req.session.lastName||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//routes
app.use('/',mainRoutes);
app.use('/products',productRoutes);
app.use('/users',userRoutes);

app.use((req,res,next)=>{
    let err = new Error('The server can not locate url '+req.url);
    err.status=404;
    next(err);
});


app.use((err,req,res,next)=>{
if(!err.status){
    console.log(err.stack);
    err.status=500;
    err.message =("Internal Server Error");
}
res.status(err.status);
res.render('error',{error:err});
});
