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
            console.log(result);
            user_name = req.body.username;
            if (error) {
                return res.send("YOU ARE NOT A USER");
            }
            else {
                if ( !result[0]  )
                {
                    return res.send("YOU ARE NOT A USER");
                }
                if ( result[0].password != hash  )
                {
                    return res.send("INCORRECT PASSWORD");
                }
                if (result != undefined && result[0].password === hash) {
                    // session=req.session;
                    // session.userid=req.body.username;
                    // console.log(req.session)
                    db.query('select chekouts.*, books.* from chekouts inner join books on chekouts.book_id = books.id where user_id = "'+ req.body.username +'"and admin_id is not null;',
                        (error1, result1, fields) => {
                            if (error1) {
                                console.log(error1);
                                return res.send("YOU ARE NOT A USER");
                            }
                            console.log("OK");
                            //PRINTING WILL GIVE ERROR IF UNDEFINED/EMPTY SET;
                            //console.log(result1);
                            //console.log(result1[0].book_id);
                            
                            db.query('select chekouts.*, books.* from chekouts inner join books on chekouts.book_id = books.id where user_id = "'+ req.body.username +'"and admin_id is null;',
                            (error2, result2, fields) => {
                                if (error2) {
                                    console.log(error2);
                                    return res.send("YOU ARE NOT A USER");
                                }
                            //NOW GETTING BOOKS BY BOOK ID
                            return res.render(`user_homepage`,{bookissued : result1 , username : req.body.username , bookpending : result2}); 
                            }); 
                        });
                }
                else {
                    return res.send("YOU ARE NOT A USER");
                }
            }
        });
});

var globaladmin_id;
//ADMIN-LOGIN
router.post('/adminlogin', (req, res) => {
    db.query('select * from admin where username = "' + req.body.username + '";',
        (error, result, fields) => {
            let crypto = require('crypto');
            const hash = crypto.createHash('sha256').update(req.body.password).digest('base64');
            user_name = req.body.username;
            console.log(req.body.username);
            console.log(req.body.password);
            console.log(result);
            // if( !result[0] )
            // {
            //     console.log("ERRROR hai..");
            //     return res.send("HOLLLAAA");
            // }
            //console.log(result[0].username);
            if (error) {
                console.log(error);
                return res.send("ERROR IN CODE..SADGE ");
            }
            else {
                if ( !result[0]  )
                {
                    return res.send("YOU ARE NOT AN ADMIN");
                }
                if ( result[0].password != hash  )
                {
                    return res.send("INCORRECT PASSWORD");
                }
                console.log("okk");
                if (result != undefined && result[0].password === hash)
                {
                    db.query('select * from books;',
                        (error1, result1, fields) => {
                        if (error1) 
                        {
                            console.log(error1);
                        }
                        return res.render(`ad_homepage`,{adminid : result[0].id, booklist:result1});    
                    });
                }
                else 
                {
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

//ALL_BOOKS
router.post('/allbooks',(req, res) => {
    db.query('select * from books;',
    (error, result, fields) => {
        if (error) {
            console.log(error);
        }
        return res.render(`user_allbooks`,{booklist : result , user_name : user_name})
    }
    )
})

//SEARCH_BOOKS
router.post('/searchbooks', (req, res) => {
    db.query('select * from books where title = "'+req.body.bookname+'" ;',
    (error, result, fields) => {
        if (error) {
            console.log(error);
        }
        console.log("RUNNIN");
        return res.render(`user_searchresult`, {availbooks : result , user_name : user_name});
    });

});

//ISSUE_BOOK
router.post('/issuebook',(req, res) => {
    console.log("WTFFFFF");
    db.query('select * from books where title = "'+req.body.bookname+'";',
    (error,result,fields) => {
        console.log(result);
        console.log(user_name);
        var bookid = result[0].id;
        if(result != undefined){
            db.query('insert into chekouts(user_id,book_id,checkout_time) value( "' + user_name + '",' + bookid + ',current_timestamp);',
            (error, result3, fields) => {
                console.log("HOLA AMIGOS");
                console.log(result3);
                console.log("KOI NAHI..")
                return res.render(`user_completed`)
            });
        }
        else{
            console.log("BOOK NAHI HAI..");
            return res.send("CHOOSE A VALID BOOK.!!");
        }
    })
})

//ADMIN_SIDE INTERFACE---------

//Add_books
router.post('/addbooks',(req, res) => {
    console.log("Addingbooks");
    db.query('insert into books(title,author) values("'+req.body.title+'","'+req.body.author+'");',
    (error,result,fields) => {
        console.log(result);
        if (error) {
            console.log(error);
        }
        else{
            console.log("BOOK ADDED");
            db.query('select * from books;',
            (error, result, fields) => {
                if (error) {
                    console.log(error);
                }
                return res.render(`ad_homepage`,{booklist : result , user_name : user_name})
            }
            )
        }
    })
})
//Remove_books
router.post('/removebooks',(req, res) => {
    console.log("Removingbooks");
    db.query('delete from books where title = "'+req.body.title+'";',
    (error,result,fields) => {
        console.log(result);
        if (error) {
            console.log(error);
        }
        else{
            console.log("BOOK REMOVED");
            db.query('select * from books;',
            (error, result, fields) => {
                if (error) {
                    console.log(error);
                }
                return res.render(`ad_homepage`,{booklist : result , user_name : user_name})
            }
            )
        }
    })
})

router.post('/requests',(req, res) => {
    db.query('select chekouts.id,chekouts.user_id,books.title from chekouts inner join books on chekouts.book_id = books.id where admin_id is null;',
        (error,result,fields) => {
            if(error){
                console.log(error);
            }
            else{
                return res.render(`ad_approve`,{data : result});
            }
        }
    
    )
})

//APPROVE REQUESTS
router.post('/approverequests',(req, res) => {
    db.query('update chekouts set admin_id = 1 where id = '+req.body.reqid+' ;',
        (error,result,fields) => {
            if(error){
                console.log(error);
            }
            else{
                console.log("REQUEST APPROVED")
                db.query('select chekouts.id,chekouts.user_id,books.title from chekouts inner join books on chekouts.book_id = books.id where admin_id is null;',
                (error,result1,fields) => {
                    if(error){
                        console.log(error);
                    }
                    else{
                        return res.render(`ad_approve`,{ data : result1 })
                
                    }
                });
            }
        });
})

//DENY REQUESTS
router.post('/denyrequests',(req, res) => {
    console.log(req.body.reqid);
    db.query('delete from chekouts where id = '+req.body.reqid+' ;',
        (error,result,fields) => {
            if(error){
                console.log(error);
            }
            else{
                console.log("REQUEST DENIED")
                db.query('select chekouts.id,chekouts.user_id,books.title from chekouts inner join books on chekouts.book_id = books.id where admin_id is null;',
                (error,result1,fields) => {
                    if(error){
                        console.log(error);
                    }
                    else{
                        return res.render(`ad_approve`,{ data : result1 })
                    }
                });
            }
        });
});
