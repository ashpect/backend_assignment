const express = require('express');
const db = require('./database');
db.connect();
const app = express();
app.set('view engine', 'ejs');

//SESSION_MANAGEMENT
// const cookieParser= require("cookie-parser");
// const sessions = require("express-session");

//Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ENVs
const PORT = process.env.PORT || 5500;
app.listen(PORT, () =>
    console.log(`server started at ${PORT}`));


const router = express.Router();
app.use('/',router);
router.get('/', (req, res) => {
    res.render('index');
});

//SESSION_MANAGEMENT
// const oneDay = 1000* 60* 60;
// app.use(sessions({
//     secret: "Ok",
//     saveUninitialized:true,
//     cookie: {maxAge: oneDay},
//     resave:false
// }))
// app.use(cookieParser());
// var session;

//This have 2 arguments a route and a function with three arguments, request, response and next.
var user_name;
//USER-LOGIN
router.post('/login', (req, res) => {
    db.query('select * from user where username =' + db.escape(req.body.username) + ';',
        (error, result, fields) => {
            let crypto = require('crypto');
            const hash = crypto.createHash('sha256').update(req.body.password).digest('base64');
            user_name = req.body.name;
            let name = req.body.username;
            if (error) {
                return res.redirect('notUser');
            }
            else {
                if (result != undefined && result[0].password === hash) {
                    // session=req.session;
                    // session.userid=req.body.username;
                    // console.log(req.session)
                    db.query('select chekouts.*, books.* from chekouts inner join books on chekouts.book_id = books.id where user_id = "'+ req.body.username +'";',
                        (error1, result1, fields) => {
                            if (error1) {
                                console.log(error1);
                                //return res.redi1rect('notUser');
                            }
                            console.log("OK");
                            console.log(result1);
                            console.log(result1[0].book_id);
                            
                            //NOW GETTING BOOKS BY BOOK ID
                            return res.render(`user_homepage`,{data : result1 , username : req.body.username});  
                        });
                    // return res.render(`books`); 
                }
                else {
                    return res.render('notUser');
                }
            }
        });
});

//ADMIN-LOGIN
router.post('/ad_login', (req, res) => {
    db.query('select * from admin where username =' + db.escape(req.body.username) + ';',
        (error, result, fields) => {
            let crypto = require('crypto');
            const hash = crypto.createHash('sha256').update(req.body.password).digest('base64');
            console.log("check1");
            console.log(result);
            console.log("check2");
            console.log(result[0].password);
            console.log("check3");
            console.log(hash);
            console.log("check4");
            let name = req.body.uname;
            if (error) {
                return res.redirect('notUser');
            }
            else {
                if (result != undefined && result[0].password === hash) {
                    return res.render(`ad_homepage`,{data : name});
                    //return res.render('user',{ data : name });
                }
                else {
                    return res.render('notUser');
                }
            }
        });
});

//REGISTER
router.post('/user_register', (req, res) => {
    let name = req.body.uname;
    let password = req.body.password;
    var crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(password).digest('base64');
    let passwordC = req.body.passwordC;
    db.query("select * from user where uname = " + db.escape(name) + ";",
        (error, result, field) => {
            if (result === undefined) {
                if (name && (password == passwordC)) {
                    db.query("INSERT INTO USER VALUES(" + db.escape(name) + ",'" + hash+"');");
                    res.render(`user`, { data : name });
                }
                else if (password !== passwordC) {
                    res.send("Passwords didn't match");
                }
                else {
                    res.send("password must not be empty");
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

//ACCESSING ALL_BOOKS
router.post('/allbooks', (req, res) => {
    db.query('select title from books;',
    (error, result, fields) => {
        return res.render(`allbooks`, {data : result , user_name : user_name});
    });

});

//ISSUE_BOOK
router.post('/bookissue',(req, res) => {
    let user_name = req.body.username;
    console.log("WTFFFFF");
    db.query('select '+req.body.bookname+' from books;',
    (error,result,fields) => {
        if(result != undefined){
            db.query('insert into chekouts(user_id,book_id,checkout_time) value("' + user_name + '",' + req.body.bookname + ',current_timestamp);',
            (error, result3, fields) => {
                console.log("HOLA AMIGOS");
                console.log(result3);
                console.log("KOI NAHI..")
            });
        }
    })
})

//AFTER LOGGING IN
var bookid;
router.post('/booktest', (req, res) => {
    //db.query('select * from user where username =' + db.escape(req.body.username) + ';',)
    //db.query("select user.username, chekouts.book_id from user join chekouts on user.username = chekouts.user_id;",
    //select user.username, chekouts.book_id from user join chekouts on user.username = chekouts.user_id;
    db.query('select book_id from chekouts where user_id = "Ashish";',
        (error, result, fields) => {
            //console.log(result[0].book_id);
            // console.log(result[0].book_id);
            console.log("HOLA");
            var bookid = result[0].book_id;
            //bookid = 1;
            if (error) {
                return res.redirect('books');
            }
            else {
                db.query('select * from chekouts where book_id = "Ashish";',
                (error, result, fields) => {
                    
                });

                if (result[0].book_id === NULL) {
                    return res.render('user');
                }
                else {
                    return res.render('notUser');
                }
            }
            return res.render('notUser');
        });

});

router.post('/usersbook', (req, res) => {
    db.query('select * from chekouts where user_id = "Ashish";',
        (error, result, fields) => {
            console.log("HOLA");
            var bookid = result[0].book_id;
            if (error) {
                return res.redirect('books');
            }
            else {
                db.query('select * from chekouts where book_id = "Ashish";',
                (error, result, fields) => {
                    

                    return res.render('notUser');
                });
            }
            
        });

});
