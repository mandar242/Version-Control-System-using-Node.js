  
const fs = require('fs')
const fileUpload = require('express-fileupload');
//const variables
const createRepo = "CR";
const checkin = "CH";
const _ = require('lodash');

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
      parseCommand(commandName, req, res);
      res.send(commandName + ' success!');

   });

   var parseCommand = function (fcommand, req, res) {
      var cmdArray = fcommand.split(" ");

      var cmd = cmdArray[0].toUpperCase();
      var folderName = "./";
      folderName = folderName.concat(cmdArray[1])
      if (cmdArray.length == 2) {
         if (cmd == createRepo) {
            //create folder
            createFolder(folderName);
         } if (cmd == checkin) {
            //upload file
            uploadFile(req,folderName,res)
         }
      }
   }

   //Author Neha : function to createFolder
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

   //Author Neha : function to calculate Artifact Id.
   var calculateChecksum = function (data) {
      const weightedValues = [1, 3, 7, 11, 13];
      const modVal = 2147483647;
      const separatorString = '-L';
      var checksum = 0;
      var file_lenght = 0;
      var i = 0;
      data.forEach(element => {
         checksum = checksum + (element * weightedValues[i]);
         i = i + 1;
         file_lenght = file_lenght + 1;
         if (i == 5) {
            i = 0;
         }
      });
      checksum = checksum % modVal;
      var checksumHex = checksum.toString(16);
      var filenamewithAFID = checksumHex.concat(separatorString);
      filenamewithAFID = filenamewithAFID.concat(file_lenght);
      return filenamewithAFID;
   }

   //Author Neha : function to generate file name
   var generateFileName = function (fileObj,folderName) {
      var fname = fileObj.name.split(".");
      var final_fileName = folderName.concat('/');
      var filenamewithAFID = calculateChecksum(fileObj.data);
      final_fileName = final_fileName.concat(filenamewithAFID);
      final_fileName = final_fileName.concat('.')
      final_fileName = final_fileName.concat(fname[1])
      return final_fileName;
   }

   //Author Neha : function to upload file name
   var uploadFile = function(req,folderName,res){
      if (Object.keys(req.files).length == 0) {
         return res.status(400).send('No files were uploaded.');
      }
      if((req.files.filetocheckin).length > 1){
         // multiple files upload      
      _.forEach(_.keysIn(req.files.filetocheckin), (key) => {
         let fileObj = req.files.filetocheckin[key];
         var fname = fileObj.name.split(".");
         var filePath=folderName.concat('/'+fname[0]);
         if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath)}
         var final_fileName = generateFileName(fileObj,filePath);
         fileObj.mv(final_fileName, function (err) {
            if (err)
               return res.status(500).send(err);
            res.send('File uploaded!');
         });
      });
      }else {
         let fileObj = req.files.filetocheckin;
         var fname = fileObj.name.split(".");
         var filePath=folderName.concat('/'+fname[0]);
         if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath)}
         var final_fileName = generateFileName(fileObj,filePath);
         fileObj.mv(final_fileName, function (err) {
            if (err)
               return res.status(500).send(err);
            res.send('File uploaded!');
         });
      }
      
   }
}
