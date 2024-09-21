if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config(); 
}

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const { User, Task } = require('./config');

const app = express(); // Create Express application

// Middleware for parsing URL-encoded data (from forms)
app.use(express.urlencoded({ extended: true })); 

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Flash messages middleware
app.use(flash());

// Passport configuration
const initializePassport = require('./passport-config');
initializePassport(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Method override middleware
app.use(methodOverride('_method'));

// Static files middleware
app.use(express.static(path.join(__dirname, 'public')));

// JSON parsing middleware
app.use(express.json()); 

// View engine setup
app.set('view-engine', 'ejs');

// Middleware for setting local flash messages
app.use((req, res, next) => {
    res.locals.message = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    next();
});

app.get("/", checkAuthenticated, async (req, res) => {
    const tasks = await Task.find({ userId: req.user._id });
    res.render('index.ejs', { name: req.user.name, email: req.user.email, githubId: req.user.githubId, details: tasks });
});

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
});

app.post('/tasks', checkAuthenticated, async (req, res) => {
    try {
        const { daysAvailable, daysLeft } = calculateDays(req.body.startdate, req.body.duedate);

        const newTask = {
            task: req.body.task,
            startdate: req.body.startdate,
            duedate: req.body.duedate,
            daysAvailable,
            daysLeft,
            userId: req.user._id
        };

        await Task.create(newTask);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating task');
    }
});

app.delete('/tasks/:id', checkAuthenticated, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting task');
    }
});

app.post('/tasks/:id/edit', checkAuthenticated, async (req, res) => {
    const taskId = req.params.id;
    const { task, startdate, duedate } = req.body;
    try {
        await Task.findByIdAndUpdate(taskId, {
            task,
            startdate: new Date(startdate),
            duedate: new Date(duedate)
        });

        res.redirect('/');
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).send("An error occurred while updating the task.");
    }
});

app.post('/login', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            //console.log("Login error message 1: ", info.message); 
            req.flash('error', info.message);
            // console.log("Flash message set: ", req.flash('error')); 
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    //console.log("Flash object: ", req.flash()); 
    const errorMessage = req.flash('error'); 
    //console.log("Flash error message 2: ", errorMessage);
    res.render('login.ejs', { message: { error: errorMessage } });
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        };
        // console.log("got here 1");
        const existingUser = await User.findOne({ email: data.email });
        // console.log("got here 2");
        if (existingUser) {
            req.flash('error', 'User already exists. Please choose a different email.');
            return res.redirect('/register');
        } else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);

            data.password = hashedPassword;
            //console.log("Creating new user:", data);
            const newUser = await User.create(data);
            //console.log("User created:", newUser);
        }

        await res.redirect('/login');
    } catch (error) {
        console.error("Error during user registration:", error);
        req.flash('error', 'Error during user registration. Please try again.');
        res.redirect('/register');
    }
});

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);

app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

function calculateDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const daysAvailable = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    let daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) {
        daysLeft = 0;
    }
    return { daysAvailable, daysLeft };
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
