/**
 * This file is used by parse.js as a module
 * It contains function which which handles list command handler.
 *  
 * Authors :
 * Neha Bhoi (Neha.Bhoi@student.csulb.edu)
 * Ashwini Ukarde (ashwiniganesh.ukarde@student.csulb.edu)
 * Mandar Kuklarni (mandarvijay.kulkarni@student.csulb.edu)
 * Mayank Pidiha (mayank.pidiha@student.csulb.edu) 
 * 
 **/


var comman_module = require('./comman.js');
const fs = require('fs');
const checkin = "CH";
module.exports.list = {

    // function to list snapshots
   listReop : function (folderName, res, fields) {
    try {
       if (fs.existsSync(folderName)) {
          const manifestFilepath = comman_module.comman.getmanifestpath(folderName);
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
             this.listmanifestentry(folderName, fields)
             res.status(200).send("list of snapshot");
          } else {
             res.error('List command Error!');
          }

       }

    } catch (err) {
       console.error(err)
    }
 },

 // function to add list entry in manifest file
 listmanifestentry :function (folderName, fields) {
    var manifestpath = comman_module.comman.getmanifestpath(folderName)
    var manifestdata = "";
    var dateTime = comman_module.comman.getdateTime();
    manifestdata = manifestdata.concat(fields.command[0] + '\t')
    manifestdata = manifestdata.concat('\t' + dateTime)
    manifestdata = manifestdata.concat('\n')

    fs.appendFile(manifestpath, manifestdata, function (err) {
       if (err) throw err;
       console.log('updated manifest file!');
    });
    manifestdata = "";

 }


}