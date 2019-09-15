const fs = require('fs')
const fileUpload = require('express-fileupload');
//const variables
const createRepo = "CR";
const checkin = "CH";

module.exports = function (app) {
   app.get('/', function (req, res) {
      res.render('index.html')
   });
   app.get('/about', function (req, res) {
      res.render('about.html');
   });
   app.use(fileUpload());
   app.post('/submit-Command-data', function (req, res) {
    
      var commandName = req.body.command;
      parseCommand(commandName,req, res);
         res.send(commandName + ' success!');
         
   });

   var parseCommand = function (fcommand,req,res) {
      var cmdArray = fcommand.split(" ");

      var cmd = cmdArray[0].toUpperCase();
      var folderName = "./";
      folderName = folderName.concat(cmdArray[1])
      if (cmdArray.length == 2) {
         if (cmd == createRepo) {
            //create folder
            createFolder(folderName);
         } if (cmd == checkin) {
            if (Object.keys(req.files).length == 0) {
               return res.status(400).send('No files were uploaded.');
             }
             var fileObj = req.files.filetocheckin;
             var fileName = folderName.concat('/');
             fileName = fileName.concat(req.files.filetocheckin.name);
             fileObj.mv(fileName, function(err) {
               if (err)
                 return res.status(500).send(err);
               res.send('File uploaded!');
             });
         }
      }
   }
   var createFolder = function (fpath) {
      try {
         if (!fs.existsSync(fpath)) {
            fs.mkdirSync(fpath)
            console.log('Repo created successfully.')
            // writeFile function with filename, content and callback function
            fs.writeFile(fpath.concat('/manifest .txt'), 'Creating manifest file', function (err) {
               if (err) throw err;
               console.log('Manifest File is created successfully.');
            });
         }
      } catch (err) {
         console.error(err)
      }
   }
}