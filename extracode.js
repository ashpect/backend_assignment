db.query('select * from books where id = ' + '1' + ';',
(error, result, fields) => {
    //console.log(result[0].book_id);
    //console.log("HOLA..again");
    // if (error) {
    //     return res.redirect('books');
    // }
    // else {
    //     if (result[0].book_id === NULL) {
    //         return res.render('user');
    //     }
    //     else {
    //         return res.render('notUser');
    //     }
    // }
    return res.render('notUser');
});

// book list is result
// Show account details / data in last query
// Account details contains : 
//     Name : 
//     Books Issued :
//         Title :
//         Author :
//         Genre :
//         Publisher :
//         +++
//         Issue date :
//         Return date :
//     OPTION TO RETURN WHICH SEND ANOTHER REQUEST
// Implement fine system
//HI <%= data %>