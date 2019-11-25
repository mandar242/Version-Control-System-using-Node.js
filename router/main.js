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
const checkout = "CHECK-OUT"
const mergeout = "MERGE-OUT"
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
            var repName = cmdArray[1];
            createFolder(folderName, repName);
         }
         if (cmd == list) {
            //function to list snapshots
            listReop(folderName, res, fields);
         }
      }
      if (cmdArray.length == 3) {
         if (cmd == checkin) {
            //upload file
            var userComment = cmdArray[2].toUpperCase();
            uploadFile(folderName, fields, res, files, userComment)
         }

      }

      if (cmdArray.length == 4) {
         if (cmd === checkout) {

            const tragetFolder = './' + cmdArray[2];
            const snapshotName = cmdArray[3].toUpperCase();
            //check out snapshot
            checkoutFolder(cmdArray[1], tragetFolder, snapshotName, fields)
         }

         if (cmd === checkin) {
            const sourceAdd = cmdArray[2].toUpperCase();
            const userComment = cmdArray[3].toUpperCase();
            uploadFile2(folderName, fields, res, files, userComment, sourceAdd);
         }
      }
      //Merge out
      if (cmdArray.length == 5) {
         if (cmd == mergeout) {
            const sourceSnapshot = cmdArray[2];
            const targetSnapshot = cmdArray[3];
            const targetFolder = cmdArray[4];
            const LCA = findLCA(folderName, sourceSnapshot, targetSnapshot);
            console.log("LCA: " + LCA);
            console.log("calling mergout");
            mergeoutFiles(fields, folderName, sourceSnapshot, targetSnapshot, LCA, targetFolder)
         }
      }
   }

   //Function Merge out
   var mergeoutFiles = function (fields, repoName, sourceSnapshot, targetSnapshot, common, target) {
      console.log("inside mergout")
      const manifestpath = getmanifestpath(repoName);
      const contents = fs.readFileSync(manifestpath, { encoding: 'utf-8' });
      const sourceSanpshotData = parseManifest(contents, sourceSnapshot);
      console.log(sourceSanpshotData);
      const destinationSanpshotData = parseManifest(contents, targetSnapshot);
      const commonSanpshotData = parseManifest(contents, common);
      const destinationSanpshotLocation = [];
      for (i = 0; i < destinationSanpshotData.length; i++) {
         destinationSanpshotLocation.push(destinationSanpshotData[i].location);
      }
      //merge files from source to target
      for (i = 0; i < sourceSanpshotData.length; i++) {
         var relative_pathSource = sourceSanpshotData[i].location;
         if (destinationSanpshotLocation.indexOf(relative_pathSource) == -1) {
            console.log("Actual path " + i + ": " + sourceSanpshotData[i].actual_path);
            var prepDestPath = sourceSanpshotData[i].actual_path.split('./')[1];
            prepDestPath = prepDestPath.substring(prepDestPath.indexOf("/"));
            const flieName = prepDestPath.substring(0, prepDestPath.indexOf("."));
            const filetype = prepDestPath.substring(prepDestPath.indexOf("."));
            prepDestPath = flieName + "_MR" + filetype;
            var destinationpath = "./" + target + prepDestPath;
            console.log("destination path: " + i + ": " + destinationpath);


            var repopath = ".";
            var relative_path = destinationpath.split('/');
            for (j = 1; j < relative_path.length - 1; j++) {
               repopath = repopath + '/' + relative_path[j]
               console.log('---' + repopath)
               if (!fs.existsSync(repopath)) {
                  fs.mkdirSync(repopath)
               }
            }
            //rename file in Destination folder "_MT"
            const oldFileName = "./" + target + flieName + filetype;
            const newFileName = "./" + target + flieName + "_MT" + filetype;
            renameFileInDestindation(oldFileName, newFileName);
            fs.copyFile(sourceSanpshotData[i].location, destinationpath, (err, callback) => {
               if (err) throw err;
            });
         }
         console.log("calling manifest ");
         checkoutmanifestentry(repoName, fields, sourceSanpshotData[i].location, destinationpath, "");
         console.log(sourceSanpshotData[i].location + ' was copied to ', destinationpath);

      }

      //merge files from LCA to target
      for (i = 0; i < commonSanpshotData.length; i++) {
         var relative_pathSource = commonSanpshotData[i].location;
         if (destinationSanpshotLocation.indexOf(relative_pathSource) == -1) {
            console.log("Actual path " + i + ": " + commonSanpshotData[i].actual_path);
            var prepDestPath = commonSanpshotData[i].actual_path.split('./')[1];
            prepDestPath = prepDestPath.substring(prepDestPath.indexOf("/"));
            const flieName = prepDestPath.substring(0, prepDestPath.indexOf("."));
            const filetype = prepDestPath.substring(prepDestPath.indexOf("."));
            prepDestPath = flieName + "_MG" + filetype;
            console.log("prep destpath" + i + ": " + prepDestPath);
            var destinationpath = "./" + target + prepDestPath;
            console.log("destination path: " + i + ": " + destinationpath);
            var repopath = ".";
            var relative_path = destinationpath.split('/');
            for (j = 1; j < relative_path.length - 1; j++) {
               repopath = repopath + '/' + relative_path[j]
               console.log('---' + repopath)
               if (!fs.existsSync(repopath)) {
                  fs.mkdirSync(repopath)
               }
            }

            //rename file in Destination folder "_MT"
            const oldFileName = "./" + target + flieName + filetype;
            const newFileName = "./" + target + flieName + "_MT" + filetype;
            renameFileInDestindation(oldFileName, newFileName);

            //Copy files to ddestination
            fs.copyFile(commonSanpshotData[i].location, destinationpath, (err, callback) => {
               if (err) throw err;
            });
         }
         checkoutmanifestentry("./" + repoName, fields, commonSanpshotData[i].location, destinationpath, "");
         console.log(commonSanpshotData[i].location + ' was copied to ', destinationpath);

      }
   }

   // function to create new repo
   var createFolder = function (fpath, repName) {
      try {
         if (!fs.existsSync(fpath)) {
            fs.mkdirSync(fpath)
            console.log(repName + ' repo created successfully.')
            const craeteRepoContent = createRepo + '\t' + repName + '\n'
            // writeFile function with filename, content and callback function
            fs.writeFile(fpath.concat('/manifest.txt'), craeteRepoContent, function (err) {
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
      folderName = folderName.concat('/', fname[0])
      var final_fileName = folderName.concat('/' + filenamewithAFID);
      final_fileName = final_fileName.concat('.')
      final_fileName = final_fileName.concat(fname[1])
      return final_fileName;
   }

   // function to first upload file name
   var uploadFile = function (folderName, fields, res, files, userComment) {
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
            var fname = fname[fname.length - 1].split(".");
            x = relativePath.concat('/', fname[0])
            if (!fs.existsSync(x)) {
               fs.mkdirSync(x)
            }
            var final_fileName = generateFileName(fileObj, relativePath);
            fs.copyFile(fileObj.path, final_fileName, (err) => {
               if (err) throw err;
               console.log(fileObj.path + ' was copied to ' + final_fileName);
            });

            // add maifest Entry
            var manifestpath = getmanifestpath(folderName)
            var manifestdata = "";
            var dateTime = getdateTime();
            manifestdata = manifestdata.concat(fields.command[0] + '\t')
            var filepath = fileObj.originalFilename.split("/")
            relativePath = relativePath.concat('/' + filepath[filepath.length - 1])
            manifestdata = manifestdata.concat('\t' + relativePath)
            manifestdata = manifestdata.concat('\t' + dateTime)
            manifestdata = manifestdata.concat('\t' + final_fileName)
            manifestdata = manifestdata.concat('\t' + userComment)
            manifestdata = manifestdata.concat('\n')

            fs.appendFile(manifestpath, manifestdata, function (err) {
               if (err) throw err;
               console.log('Saved!');
            });
            manifestdata = "";

         });
      }
   }

   // function to second+ upload file name
   var uploadFile2 = function (folderName, fields, res, files, userComment, sourceAdd) {
      if (Object.keys(files).length == 0) {
         return res.status(400).send('No files were uploaded.');
      }
      if ((files.filetocheckin).length >= 1) {
         // multiple files upload      
         _.forEach(_.keysIn(files.filetocheckin), (key) => {
            let fileObj = files.filetocheckin[key];
            var fname = fileObj.originalFilename.split("/");
            var relativePath = "";
            relativePath = relativePath.concat(folderName)
            for (i = 0; i < fname.length - 1; i++) {
               relativePath = relativePath.concat('/' + fname[i]);
               if (!fs.existsSync(relativePath)) {
                  fs.mkdirSync(relativePath)
               }
            }
            var fname = fname[fname.length - 1].split(".");
            x = relativePath.concat('/', fname[0])
            if (!fs.existsSync(x)) {
               fs.mkdirSync(x)
            }
            var final_fileName = generateFileName(fileObj, relativePath);
            fs.copyFile(fileObj.path, final_fileName, (err) => {
               if (err) throw err;
               console.log(fileObj.path + ' was copied to ' + final_fileName);
            });

            // add maifest Entry
            var manifestpath = getmanifestpath(folderName)
            var manifestdata = "";
            var dateTime = getdateTime();
            manifestdata = manifestdata.concat(fields.command[0] + '\t')
            var filepath = fileObj.originalFilename.split("/")
            relativePath = relativePath.concat('/' + filepath[filepath.length - 1])
            manifestdata = manifestdata.concat('\t' + relativePath)
            manifestdata = manifestdata.concat('\t' + dateTime)
            manifestdata = manifestdata.concat('\t' + final_fileName)
            manifestdata = manifestdata.concat('\t' + userComment)
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
   var listReop = function (folderName, res, fields) {
      try {
         if (fs.existsSync(folderName)) {
            const manifestFilepath = getmanifestpath(folderName);
            var contents = fs.readFileSync(manifestFilepath, { encoding: 'utf-8' });
            var contentNewLines = contents.split('\n');
            var snapshots = new Map()
            var snapshotsList = []
            for (i = 1; i < contentNewLines.length; i++) {
               line = contentNewLines[i]
               if (line != '') {
                  words = line.split('\t');
                  command = words[0].split(' ')
                  console.log(command)
                  if (command[0].toUpperCase() == checkin) {
                     var key = words[words.length - 1]
                     if (!snapshots.has(key)) {
                        snapshots.set(key, 1)
                        snapshotsList.push(key)
                     }
                  }
               }
            }
            if (snapshotsList.length) {
               res.json({
                  "list": {
                     reponame: folderName,
                     snapshotsList: snapshotsList
                  }
               });
               listmanifestentry(folderName, fields)
               res.status(200).send("list of snapshot");
            } else {
               res.error('List command Error!');
            }

         }

      } catch (err) {
         console.error(err)
      }
   }

   // function to add list entry in manifest file
   var listmanifestentry = function (folderName, fields) {
      var manifestpath = getmanifestpath(folderName)
      var manifestdata = "";
      var dateTime = getdateTime();
      manifestdata = manifestdata.concat(fields.command[0] + '\t')
      manifestdata = manifestdata.concat('\t' + dateTime)
      manifestdata = manifestdata.concat('\n')

      fs.appendFile(manifestpath, manifestdata, function (err) {
         if (err) throw err;
         console.log('updated manifest file!');
      });
      manifestdata = "";

   }

   // function to check out sanpshot
   var checkoutFolder = function (folderName, tragetFolder, snapshotName, fields) {
      const manifestpath = getmanifestpath(folderName);
      const contents = fs.readFileSync(manifestpath, { encoding: 'utf-8' });
      const sanpshotData = parseManifest(contents, snapshotName)
      copyFiles(folderName, sanpshotData, tragetFolder, fields)

   }

   // function to add Entry in manifest file 
   var checkoutmanifestentry = function (folderName, fields, srcfilepath, destinationpath, tragetFolder) {
      // add maifest Entry
      var manifestpath = getmanifestpath(folderName)
      var manifestdata = "";
      var dateTime = getdateTime();
      manifestdata = manifestdata.concat(fields.command[0] + '\t')
      manifestdata = manifestdata.concat('\t' + srcfilepath)
      manifestdata = manifestdata.concat('\t' + dateTime)
      manifestdata = manifestdata.concat('\t' + destinationpath)
      manifestdata = manifestdata.concat('\t' + tragetFolder)
      manifestdata = manifestdata.concat('\n')

      fs.appendFile(manifestpath, manifestdata, function (err) {
         if (err) throw err;
         console.log('updated manifest file!');
      });
      manifestdata = "";
   }

   // function to copy files
   var copyFiles = function (folderName, sanpshotData, tragetFolder, fields) {
      for (i = 0; i < sanpshotData.length; i++) {
         //create target folder

         if (!fs.existsSync(tragetFolder)) {
            fs.mkdirSync(tragetFolder)
         }


         //create main repo folder
         //var repopath = tragetFolder + '/' + folderName
         var repopath = tragetFolder
         if (!fs.existsSync(repopath)) {
            fs.mkdirSync(repopath)
         }

         //create internal folders if any
         var relative_path = sanpshotData[i].actual_path.split('/');
         for (j = 2; j < relative_path.length - 1; j++) {
            repopath = repopath + '/' + relative_path[j]
            console.log('---' + repopath)
            if (!fs.existsSync(repopath)) {
               fs.mkdirSync(repopath)
            }
         }

         //copy files
         var dest = sanpshotData[i].actual_path.split('./' + folderName)[1];
         console.log(dest)

         //var destinationpath = tragetFolder + '/' + sanpshotData[i].actual_path.split('./')[1];
         var destinationpath = tragetFolder + dest;
         fs.copyFile(sanpshotData[i].location, destinationpath, (err, callback) => {
            if (err) throw err;
         });
         console.log(sanpshotData[i].location + ' was copied to ', destinationpath);
         checkoutmanifestentry('./' + folderName, fields, sanpshotData[i].location, destinationpath, tragetFolder)
      }
   }


   // function to parse manifest file
   var parseManifest = function (contents, snapshotName) {
      var contentNewLines = contents.split('\n');
      var sanpshotData = []
      for (i = 1; i < contentNewLines.length; i++) {
         line = contentNewLines[i]
         if (line != '') {
            words = line.split('\t');
            command = words[0].split(' ')
            if ((words[words.length - 1] == snapshotName) && command[0].toUpperCase() == checkin) {
               {
                  sanpshotData.push({
                     actual_path: words[2],
                     location: words[4]
                  })

               }
            }
         }
      }
      return sanpshotData
   }


   // function to get manifest file path of repository
   var getmanifestpath = function (folderName) {
      return folderName.concat('/manifest.txt');

   }

   // function to get datetime string 
   var getdateTime = function () {
      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + ' ' + time;
      return dateTime;
   }

   // function to find LCA for merge-out and merge-in
   var findLCA = function (folderName, sourceSnapshotName, targetSanpshotName) {
      var manifestpath = getmanifestpath(folderName);
      const contents = fs.readFileSync(manifestpath, { encoding: 'utf-8' });
      var contentNewLines = contents.split('\n');
      var linesLength = contentNewLines.length;
      var targetCheckin = false;
      var targetCheckout = false;
      var targetParentSanpshot = '';
      var sourceCheckin = false;
      var sourceCheckout = false;
      var sourceParentSanpshot = '';
      linesLength = linesLength - 1;
      while (linesLength >= 0) {
         lineContent = contentNewLines[linesLength];

         //parse manifest from bottom to top
         if (lineContent !== '' && lineContent !== undefined) {
            lineContent = lineContent.split('\t');
            const cmd = lineContent[0].split(' ');

            //find checkin for target sanpshort
            if (cmd[0].toUpperCase() == checkin) {
               if (cmd.length == 4) {
                  if (cmd[3].toUpperCase() == targetSanpshotName.toUpperCase()) {
                     targetCheckin = true;
                  }
               } else {
                  if (cmd[2].toUpperCase() == targetSanpshotName.toUpperCase()) {
                     targetCheckin = true;
                  }
               }

            }

            // if checkin for target sanpshort is found then find checkout for it
            if (targetCheckin) {
               if (cmd[0].toUpperCase() == checkout) {
                  targetCheckout = true;
                  targetParentSanpshot = cmd[3];
                  console.log('targetParentSanpshot - ' + targetParentSanpshot)
               }
            }

            //find checkin for source sanpshort
            if (cmd[0].toUpperCase() == checkin) {
               if (cmd.length == 4) {
                  if (cmd[3].toUpperCase() == sourceSnapshotName.toUpperCase()) {
                     sourceCheckin = true;
                  } else {
                     if (cmd[2].toUpperCase() == sourceSnapshotName.toUpperCase()) {
                        sourceCheckin = true;
                     }
                  }
               }
            }

            // if checkin for source sanpshort is found then find checkout for it
            if (sourceCheckin) {
               if (cmd[0].toUpperCase() == checkout) {
                  sourceCheckout = true;
                  sourceParentSanpshot = cmd[3];
                  console.log('sourceParentSanpshot - ' + sourceParentSanpshot)
               }
            }

            // if both check out is same then return LCA
            if (targetCheckout && sourceCheckout) {
               if (targetParentSanpshot == sourceParentSanpshot) {
                  console.log('LCA Found - ' + sourceParentSanpshot)
                  return sourceParentSanpshot;
               }
            }

         }
         linesLength = linesLength - 1;
      }

   }
}
