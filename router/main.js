module.exports = function(app)
{
     app.get('/',function(req,res){
        res.render('index.html')
     });
     app.get('/about',function(req,res){
        res.render('about.html');
    });
    app.post('/submit-Command-data', function (req, res) {
      var commandName = req.body.command;
      res.send(commandName + ' success!');
  });
}