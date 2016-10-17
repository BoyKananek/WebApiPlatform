
module.exports = function(app){
    //render page
    app.get('/',function(req,res){
        res.render('index');
    })
}