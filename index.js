const express = require('express');
const db = require('./database');
db.connect();
const app = express();
app.set('view engine', 'ejs');

//Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ENVs
const PORT = process.env.PORT || 5500;
app.listen(PORT, () =>
    console.log(`server started at ${PORT}`));

//Requests
const router = express.Router();

app.use('/',router);
router.get('/', (req, res) => {
    res.render('index');
});

//This have 2 arguments a route and a function with three arguments, request, response and next.
router.post('/login', (req, res) => {
    db.query('select * from users where uname =' + db.escape(req.body.username) + ';',
        (error, result, fields) => {
            let crypto = require('crypto');
            const hash = crypto.createHash('sha256').update(req.body.password).digest('base64');
            if (error) {
                return res.redirect('notUser');
            }
            else {
                if (result[0] != undefined && result[0].password === hash) {
                    return res.render('user');
                }
                else {
                    return res.render('notUser');
                }
            }
        });
});

router.post('/register', (req, res) => {
    let name = req.body.uname;
    let password = req.body.password;
    var crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(password).digest('base64');
    let passwordC = req.body.passwordC;
    db.query("select * from users where uname = " + db.escape(name) + ";",
        (error, result, field) => {
            if (result[0] === undefined) {
                if (name && (password == passwordC)) {
                    db.query("INSERT INTO USERS VALUES(" + db.escape(name) + ",'" + hash+"');");
                    res.render(`user`, { data: name });
                }
                else if (password !== passwordC) {
                    res.send("Passwords didn't match");
                }
                else {
                    res.send("password must not be emply");
                }
            }
            else {
                console.log(result);
                res.send("Username is not unique");
            }
        });
});

router.get('/register', (req, res) => {
    res.render(`register`);
});

