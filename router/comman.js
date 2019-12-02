/**
 * This file is used by all module.
 * It contains function which defines common functions.
 *  
 * Authors :
 * Neha Bhoi (Neha.Bhoi@student.csulb.edu)
 * Ashwini Ukarde (ashwiniganesh.ukarde@student.csulb.edu)
 * Mandar Kuklarni (mandarvijay.kulkarni@student.csulb.edu)
 * Mayank Pidiha (mayank.pidiha@student.csulb.edu) 
 * 
 **/

const fs = require('fs')
const checkin = "CH";

module.exports.comman = {

   // function to calculate Artifact Id.
   calculateChecksum: function (fileObj) {
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
   },

   // function to generate file name
   generateFileName: function (fileObj, folderName) {
      var fname = fileObj.originalFilename.split('/')
      fname = fname[fname.length - 1].split('.')
      var filenamewithAFID = this.calculateChecksum(fileObj);
      folderName = folderName.concat('/', fname[0])
      var final_fileName = folderName.concat('/' + filenamewithAFID);
      final_fileName = final_fileName.concat('.')
      final_fileName = final_fileName.concat(fname[1])
      return final_fileName;
   },

   // function to get manifest file path of repository
   getmanifestpath: function (folderName) {
      return folderName.concat('/manifest.txt');

   },

   // function to get datetime string 
   getdateTime: function () {
      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + ' ' + time;
      return dateTime;
   },

   // function to parse manifest file
   parseManifest: function (contents, snapshotName) {
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
   },

   // function to add Entry in manifest file 
   checkoutmanifestentry: function (folderName, fields, srcfilepath, destinationpath, tragetFolder) {
      // add maifest Entry
      var manifestpath = this.getmanifestpath(folderName)
      var manifestdata = "";
      var dateTime = this.getdateTime();
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

}