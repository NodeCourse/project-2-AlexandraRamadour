const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const COOKIE_SECRET = 'cookie secret';

const db = new Sequelize('sql2238278', 'sql2238278', 'yT1!cS7*', {
    host: 'sql2.freemysqlhosting.net',
    dialect: 'mysql'
});
const Survey = db.define('survey', {
    title: { type: Sequelize.STRING },
    q1: { type: Sequelize.TEXT },
    q2: { type: Sequelize.TEXT },
    q3: { type: Sequelize.TEXT },
    q4: { type: Sequelize.TEXT },
    q5: { type: Sequelize.TEXT }
});
const User = db.define('user', {
    username: { type: Sequelize.STRING },
    mdp: { type: Sequelize.TEXT }
});

passport.use(new LocalStrategy((username, mdp, cb) => {
    User
        .findOne({
            where: {
                username: username,
                mdp: mdp
            }
        })
        .then((user) => {
            if (user){
                cb(null, user);
            } else {
                cb(null, false);
            }
        });
}));


passport.serializeUser((user, cb) => {
    cb(null, user.username);
});

passport.deserializeUser((username, cb) => {
    User
        .findOne({
            where: {
                username: username
            }
        })
        .then((user) => {
            cb(null, user);
        });
});

const app = express();

app.use(express.static("public"));
app.set('view engine', 'pug');
app.use(cookieParser(COOKIE_SECRET));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

db.sync();

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/', (req, res) => {
    Survey
        .findAll()
        .then((surveys) => {
            res.render('index', { surveys });
        });
});

app.get('/inscription', (req, res) => {
    User
    .findAll()
    .then((users) => {
        res.render('inscription', { users:users });
    });
});

app.get('/survey/:id', (req, res) => {
    Survey.findById(req.params.id)
        .then((survey) => {
            res.render('survey', {survey:survey});
        }) 
});


app.get('/login', (req, res) => {
    res.render('login');
});
                
        
app.post('/', (req, res) => {
    const { title, q1, q2, q3, q4, q5 } = req.body;
    Survey
        .sync()
        .then(() => Survey.create({ title, q1, q2, q3, q4, q5}))
        .then(() => res.redirect('/'));
});

app.post('/inscription', (req, res) => {
    const username = req.body.username;
    const mdp = req.body.mdp;
    User
        .create({
            username: username,
            mdp: mdp
        })
        .then((user) => {
            req.login(user, () => {
                res.redirect('/');
            });
        });
});

app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

app.listen(3000, () => {
    console.log('Listening on port 3000');
});