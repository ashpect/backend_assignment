const express = require('express');
const db = require('./database');
db.connect();
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));

// //SESSION_MANAGEMENT
const cookieParser= require("cookie-parser");
const sessions = require("express-session");
var session;

//Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let secretkey = process.env.secretkey;
//SESSION_MANAGEMENT
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: `${secretkey}`,
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));


//ENVs
const PORT = process.env.PORT || 5500;
app.listen(PORT, () =>
    console.log(`server started at ${PORT}`));


const router = express.Router();
app.use('/',router);
router.get('/', (req, res) => {
    res.render('index')
});
router.get('/register', (req, res) => {
    res.render('register');
});
router.get('/login', (req, res) => {
    // HOW TO CHECK FOR UNDEFINED ??
    // if(session.userid == undefined)
    // {
    //     return res.send('You are not logged in');
    // }
    db.query('select chekouts.*, books.* from chekouts inner join books on chekouts.book_id = books.id where user_id = "'+ session.userid +'"and admin_id is not null;',
    (error1, result1, fields) => {
        if (error1) {
            console.log(error1);
            return res.send("YOU ARE NOT A USER");
        }
        db.query('select chekouts.*, books.* from chekouts inner join books on chekouts.book_id = books.id where user_id = "'+ session.userid +'"and admin_id is null;',
        (error2, result2, fields) => {
            if (error2) {
                console.log(error2);
                return res.send("YOU ARE NOT A USER");
            }
        return res.render(`user_homepage`,{bookissued : result1 , username : session.userid , bookpending : result2}); 
        }); 
    });
});
router.get('/adminlogin',(req, res) => {
    db.query('select * from admin where username = ' + session.userid+ ';',
        (error, result, fields) => {
            if (error) {
                console.log(error);
                return res.send("SORRY..YOU ARE NOT AN ADMIN");
            }
            db.query('select * from books;',
                (error1, result1, fields) => {
                    if (error1) 
                    {
                        console.log(error1);
                    }
                    return res.render(`ad_homepage`,{adminid : result[0].id, booklist:result1});    
                });
        });
})
router.get('/ad_homepage',(req,res) => {
    res.render('ad_homepage');
})
//logout request
router.get('/logout', (req, res) => {
    delete req.session;
    session = null;
    console.log(req.session)
    console.log("OMG");
    //console.log(session.userid);
    res.redirect('/');
});

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
                    session=req.session;
                    session.userid=req.body.username;
                    console.log("ohayo");
                    console.log(req.session);
                    console.log("O");
                    console.log(session.userid);
                    console.log("k");
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
    db.query('select * from admin where username = ' + db.escape(req.body.username)+ ';',
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
                    session=req.session;
                    session.userid=req.body.username;
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
                    res.render(`index`, { data : name });
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
    db.query('select * from books where numberofbooks != 0',
    (error, result, fields) => {
        if (error) {
            console.log(error);
        }
        return res.render(`user_allbooks`,{booklist : result , username : session.userid})
    });
})

//SEARCH_BOOKS
router.post('/searchbooks',isUser, (req, res) => {
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
router.post('/issuebook',isUser,(req, res) => {
    db.query('select chekouts.*, books.* from chekouts inner join books on chekouts.book_id = books.id where user_id = "Ashish"and admin_id is not null and title = "'+req.body.book_naam+'";',
    (error6,result6,fields)=>{
        if(error6){
            console.log(IDDDKK);
            console.log(error6);
        }
        console.log("THIS>>");
        console.log(req.body.book_naam);
        console.log(result6);
        if(Object.keys(result6).length != 0){
            console.log("THIS IS IT>>");
            console.log(req.body.book_naam);
            console.log(result6);
            return res.send("YOU HAVE ALREADY REQUESTED FOR THIS BOOK");
        }
        console.log("WTFF");
        console.log(req.body.book_naam);
        db.query('update books set numberofbooks = numberofbooks-1 where title ="'+req.body.book_naam+'";',
        (error5,result5,fields) => {
            console.log("L LAG GYE");
            //console.log(result5);
        })
        db.query('select * from books where title = "'+req.body.book_naam+'";',
        (error,result,fields) => {
            if(error){
                console.log(error);
            }
            console.log("OK, AB YAHAN KYA HO RHA ?")
            //console.log(result);
            var bookid = result[0].id;
            if(result != undefined){
                db.query('insert into chekouts(user_id,book_id,checkout_time) value( "' + session.userid + '",' + bookid + ',current_timestamp);',
                (error1, result3, fields) => {
                    console.log("HOLA AMIGOS");
                    //console.log(result3);
                    console.log("KOI NAHI..")
                    return res.render(`user_completed`);
                });
           }
            else{
                console.log("BOOK NAHI HAI..");
                return res.send("CHOOSE A VALID BOOK.!!");
            }
    })
})
})

//returnbook
router.post('/returnbook',isUser,(req, res) => {
    console.log("CHAL RHA");
    db.query('delete from chekouts where book_id ='+req.body.reqid+' and user_id ="'+req.body.userkiid+'";',
    (error,result,fields) => {
        console.log("CHAL RHA1");
        console.log(result);
        if(error){
            console.log(error);
        }
        db.query('select chekouts.*, books.* from chekouts inner join books on chekouts.book_id = books.id where user_id = "'+ session.userid +'"and admin_id is not null;',
        (error1, result1, fields) => {
            console.log("CHAL RHA1");
            if (error1) {
                console.log(error1);
                return res.send("YOU ARE NOT A USER");
            }
            db.query('select chekouts.*, books.* from chekouts inner join books on chekouts.book_id = books.id where user_id = "'+ session.userid +'"and admin_id is null;',
            (error2, result2, fields) => {
                console.log("CHAL RHA3");
                if (error2) {
                    console.log(error2);
                    return res.send("YOU ARE NOT A USER");
                }
            return res.render(`user_homepage`,{bookissued : result1 , username : session.userid , bookpending : result2}); 
        }); 
    });
    });
});

//ADMIN_SIDE INTERFACE---------
//Add-remove page
router.post('/addremovebooks',isAdmin, (req, res) => {
    db.query('select * from books;',
        (error1, result1, fields) => {
            if (error1) 
            {
                console.log(error1);
            }
            return res.render(`ad_addbook`,{adminid : session.userid, booklist:result1});    
        });
});

//Add_books
router.post('/addbooks',isAdmin,(req, res) => {
    console.log("Addingbooks");
    db.query('insert into books(title,author,numberofbooks) values("'+req.body.title+'","'+req.body.author+'","'+req.body.copies+'");',
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
                return res.render(`ad_homepage`,{booklist : result , username : session.userid})
            }
            )
        }
    })
})
//Remove_books
router.post('/removebooks',isAdmin,(req, res) => {
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

router.post('/requests',isAdmin,(req, res) => {
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
router.post('/approverequests',isAdmin,(req, res) => {
    db.query('update chekouts set admin_id = 1 where id = '+req.body.reqid+' ;',
        (error,result,fields) => {
            if(error){
                console.log(error);
            }
            else{
                console.log("REQUEST APPROVED")
                db.query('select chekouts.id,chekouts.user_id,books.title from chekouts inner join books on chekouts.book_id = books.id where admin_id is null;',
                (error1,result1,fields) => {
                    if(error){
                        console.log(error1);
                    }
                    else{
                        db.query('update books set numberofbooks = numberofbooks-1 where title = '+req.body.title+';',
                        (error2,result2,fields) => {
                            if(error){
                                console.log(error2)
                            }
                            console.log(req.body.title);
                            console.log(result2);
                            return res.render(`ad_approve`,{ data : result1 })
                        });                
                    }
                });
            }
        });
})

//DENY REQUESTS
router.post('/denyrequests', isAdmin ,(req, res) => {
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

function isAdmin (req,res,next) {
    db.query('select username from admin;',
    (error,result,fields) => {
        var size = Object.keys(result).length;
        let flag = 0;
        for(let i = 0; i < size; i++) { 
            if(session.userid == result[i].username)
            {
                flag=1;
            }
        }
        if(session ==  null || flag == 0 ){
            res.status(403).send({ 'msg': 'Not Authenticated'});
        }
        else{
            next();
        }
    })
  
}

function isUser (req,res,next) {
    db.query('select username from user;',
    (error,result,fields) => {
        var size = Object.keys(result).length;
        let flag = 0;
        for(let i = 0; i < size; i++) { 
            if(session.userid == result[i].username)
            {
                flag=1;
            }
        }
        if(session ==  NULL || flag == 0 ){
            res.status(403).send({ 'msg': 'Not Authenticated'});
        }
        else{
            next();
        }
    })
  
}