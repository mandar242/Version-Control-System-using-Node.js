const fs = require('fs')

//const variables
const createRepo = "CR";

module.exports = function (app) {
   app.get('/', function (req, res) {
      res.render('index.html')
   });
   app.get('/about', function (req, res) {
      res.render('about.html');
   });
   app.post('/submit-Command-data', function (req, res) {
      var commandName = req.body.command;
      var result = parseCommand(commandName);
      if(result){
         res.send(commandName + ' success!');
      }else{
         res.send(commandName + ' Internal server error.')
      }
   });

   var parseCommand = function (fcommand) {
      var cmdArray = fcommand.split(" ");

      var cmd = cmdArray[0].toUpperCase();
      if (cmdArray.length == 2) {
         if (cmd == createRepo) {
            //create folder
            var folderName = "./";
            createFolder(folderName.concat(cmdArray[1]));
            return true;
         }
      }
   }
   var createFolder = function (fpath) {
      try {
         if (!fs.existsSync(fpath)) {
            fs.mkdirSync(fpath)
            console.log('Repo created successfully.')
            // writeFile function with filename, content and callback function
            fs.writeFile(fpath.concat('/menifest.txt'), 'creating menifest file', function (err) {
               if (err) throw err;
               console.log('Menifest File is created successfully.');
            });
         }
      } catch (err) {
         console.error(err)
      }
   }
}