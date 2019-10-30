/**
 * This file is used by server for computation.
 * It contains function which handles POST request and file manipulation.
 *  
 * Authers :
 * Neha Bhoi (Neha.Bhoi@student.csulb.edu)
 * Ashwini Ukarde (ashwiniganesh.ukarde@student.csulb.edu)
 * Mandar Kuklarni (mandarvijay.kulkarni@student.csulb.edu)
 * Mayank Pidiha (mayank.pidiha@student.csulb.edu) 
 * 
**/

const fs = require('fs')
const path = require('path');
// use to parse form data object in request body
const multiparty = require('multiparty');
const createRepo = "CR";
const checkin = "CH";
const list = "LIST"
const _ = require('lodash');


module.exports = function (app) {
   // route to send index.html to client
   app.get('/', function (req, res) {
      res.render('index.html')
   });

   // route to handle POST request
   app.post('/submit-Command-data', function (req, res) {
      var form = new multiparty.Form();
      form.parse(req, function (err, fields, files) {
         var commandName = fields.command[0];
         parseCommand(commandName, fields, res, files);
         if (err) {
            res.error(commandName + ' Error!');
         }
         res.status(200).send(commandName + ' success!');
      });
   });


   // route to send bundel.js to client
   app.get('/bundle.js', function (req, res) {
      res.sendfile('bundle.js', { root: path.join(__dirname, '../') })
   });

   // Function to parse commamd
   var parseCommand = function (fcommand, fields, res, files) {
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
            uploadFile(folderName, fields, res, files)
         } if (cmd == list) {
            //function to list snapshots
            listReop(folderName,res);
         }
      }
   }

   // function to create new repo
   var createFolder = function (fpath) {
      try {
         if (!fs.existsSync(fpath)) {
            fs.mkdirSync(fpath)
            console.log('Repo created successfully.')
            // writeFile function with filename, content and callback function
            fs.writeFile(fpath.concat('/manifest.txt'), 'Creating manifest file!\n', function (err) {
               if (err) throw err;
               console.log('Manifest File is created successfully.');
            });
         }
      } catch (err) {
         console.error(err)
      }
   }

   // function to calculate Artifact Id.
   var calculateChecksum = function (fileObj) {
      var data = fs.readFileSync(fileObj.path, 'utf-8');
      const weightedValues = [1, 3, 7, 11, 13];
      const modVal = 2147483647;
      const separatorString = '-L';
      var checksum = 0;
      var file_lenght = 0;
      var i = 0;
      for (var j = 0; j < data.length; j++) {
         checksum = checksum + (data.charCodeAt(j) * weightedValues[i]);
         i = i + 1;
         file_lenght = file_lenght + 1;
         if (i == 5) {
            i = 0;
         }
      }
      checksum = checksum % modVal;
      var checksumHex = checksum.toString(16);
      var filenamewithAFID = checksumHex.concat(separatorString);
      filenamewithAFID = filenamewithAFID.concat(file_lenght);
      return filenamewithAFID
   }

   // function to generate file name
   var generateFileName = function (fileObj, folderName) {
      var fname = fileObj.originalFilename.split('/')
      fname = fname[fname.length - 1].split('.')
      var filenamewithAFID = calculateChecksum(fileObj);
      folderName = folderName.concat('/',fname[0])
      var final_fileName = folderName.concat('/' + filenamewithAFID);
      final_fileName = final_fileName.concat('.')
      final_fileName = final_fileName.concat(fname[1])
      return final_fileName;
   }

   // function to upload file name
   var uploadFile = function (folderName, fields, res, files) {
      if (Object.keys(files).length == 0) {
         return res.status(400).send('No files were uploaded.');
      }
      if ((files.filetocheckin).length >= 1) {
         // multiple files upload      
         _.forEach(_.keysIn(files.filetocheckin), (key) => {
            let fileObj = files.filetocheckin[key];
            console.log(fileObj);
            var fname = fileObj.originalFilename.split("/");
            var relativePath = "";
            relativePath = relativePath.concat(folderName)
            for (i = 0; i < fname.length - 1; i++) {
               relativePath = relativePath.concat('/' + fname[i]);
               if (!fs.existsSync(relativePath)) {
                  fs.mkdirSync(relativePath)
               }
            }
            var fname = fname[fname.length-1].split(".");
            x = relativePath.concat('/',fname[0])
            if (!fs.existsSync(x)) {
               fs.mkdirSync(x)
            }
            var final_fileName = generateFileName(fileObj, relativePath);
            fs.copyFile(fileObj.path, final_fileName, (err) => {
               if (err) throw err;
               console.log(fileObj.path + ' was copied to ' + final_fileName);
            });

            // add maifest Entry
            var manifestpath = folderName.concat('/manifest.txt')
            var manifestdata = "";
            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + ' ' + time;
            manifestdata = manifestdata.concat(fields.command[0] + '\t')
            relativePath = relativePath.concat('/' + fname[fname.length - 1])
            manifestdata = manifestdata.concat('\t' + relativePath)
            manifestdata = manifestdata.concat('\t' + dateTime)
            manifestdata = manifestdata.concat('\t' + final_fileName)
            manifestdata = manifestdata.concat('\n')

            fs.appendFile(manifestpath, manifestdata, function (err) {
               if (err) throw err;
               console.log('Saved!');
            });
            manifestdata = "";

         });
      }
   }

   // function to list snapshots
   var listReop = function (folderName,res) {
      try {
         if (fs.existsSync(folderName)) {
            const manifestFilepath = folderName + '/manifest.txt'
            var contents = fs.readFileSync(manifestFilepath, {encoding: 'utf-8'});
            var contentNewLines = contents.split('\n');
            var snapshots = new Map()
            var snapshotsList = []
            for(i=1;i<contentNewLines.length;i++){
               line = contentNewLines[i]
               if(line != ''){
                  words = line.split('\t');
                  var key = words[words.length-1]
                  if(!snapshots.has(key)){
                     snapshots.set(key,1)
                     snapshotsList.push(key)
                  }
               }
            }
            if(snapshotsList.length){
               res.json(
                  { "list" : {
                     reponame : folderName,
                     snapshotsList : snapshotsList
                  } });
               res.status(200).send("list of snapshot");
            }else {
               res.error('List command Error!');
            }
            
         }

      } catch (err) {
         console.error(err)
      }
   }
}
