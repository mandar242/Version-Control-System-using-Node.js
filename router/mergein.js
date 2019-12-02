/**
 * This file is used by parse.js as a module
 * It contains function which handles merge in command handler.
 *  
 * Authors :
 * Neha Bhoi (Neha.Bhoi@student.csulb.edu)
 * Ashwini Ukarde (ashwiniganesh.ukarde@student.csulb.edu)
 * Mandar Kuklarni (mandarvijay.kulkarni@student.csulb.edu)
 * Mayank Pidiha (mayank.pidiha@student.csulb.edu) 
 * 
 **/
const fs = require('fs')
var comman_module = require('./comman.js');
const mergeout = "MERGE-OUT";
const _ = require('lodash');
const checkin = "CH";

module.exports.merge = {

    //Function Merge in
    mergeinFiles: function (fields, rep, sourceSnapshot, targetSnapshot, LCA, targetFolder, targetSnapshotName, files, res) {
        console.log("inside mergein now 1");
        const manifestpath = comman_module.comman.getmanifestpath(rep);
        console.log("inside mergein now 2");
        const contents = fs.readFileSync(manifestpath, { encoding: 'utf-8' });
        console.log("inside mergein now 3");
        const targetFolderPath = this.searchForMergeOut(contents, rep, sourceSnapshot, targetSnapshot, targetFolder);
        console.log(targetFolderPath)
        this.uploadMergeinFile(rep, fields, res, files, targetSnapshotName, targetFolder);
        console.log("inside mergein now 4");
    },

    // function to parse manifest file to search for merge out entry
    searchForMergeOut : function(contents, rep, sourceSnapshot, targetSnapshot, targetFolder) {
        var contentNewLines = contents.split('\n');
        var sanpshotData = []
        isMergeout = false
        folderPath = './';
        var i = contentNewLines.length - 1
        while (i >= 0) {
            line = contentNewLines[i]
            if (line != '') {
                words = line.split('\t');
                command = words[0].split(' ')
                if (command[0].toUpperCase() == mergeout && command[1] == rep && command[2] == sourceSnapshot && command[3] == targetSnapshot && command[4] == targetFolder) {

                    console.log("FOUND IT, there is a merge-out indeed");
                    isMergeout = true
                    folderPath = folderPath + targetFolder
                    return folderPath;
                }
            }
            i = i - 1;
        }
    },

    // function to mergein upload file name
    uploadMergeinFile : function(folderName, fields, res, files, userComment, sourceAdd) {
        if (Object.keys(files).length == 0) {
            return res.status(400).send('No files were uploaded.');
        }
        if ((files.filetocheckin).length >= 1) {
            // multiple files upload      
            _.forEach(_.keysIn(files.filetocheckin), (key) => {
                let fileObj = files.filetocheckin[key];
                var fname = fileObj.originalFilename.split("/");
                var relativePath = "./";
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
                var final_fileName =  comman_module.comman.generateFileName(fileObj, relativePath);
                fs.copyFile(fileObj.path, final_fileName, (err) => {
                    if (err) throw err;
                    console.log(fileObj.path + ' was copied to ' + final_fileName);
                });

                // add maifest Entry
                var manifestpath =  comman_module.comman.getmanifestpath(folderName)
                var manifestdata = "";
                var dateTime =  comman_module.comman.getdateTime();
                manifestdata = manifestdata.concat(fields.command[0] + '\t')
                var filepath = fileObj.originalFilename.split("/")
                var relativePath = relativePath.split('/')
                relativePath[1] = sourceAdd
                relativePath = relativePath.join('/')
                relativePath = relativePath.concat('/' + filepath[filepath.length - 1])
                manifestdata = manifestdata.concat('\t' + relativePath)
                manifestdata = manifestdata.concat('\t' + dateTime)
                manifestdata = manifestdata.concat('\t' + final_fileName)
                manifestdata = manifestdata.concat('\t' + userComment)
                manifestdata = manifestdata.concat('\n')

                fs.appendFile(manifestpath, manifestdata, function(err) {
                    if (err) throw err;
                    console.log('Saved!');
                });

                // add menifest entry for checkin command to support LCA functionality
                var manifestdata1 = manifestdata
                var cmd = fields.command[0].split(' ')
                var check_in_cmd = checkin + " " + cmd[1] + ' ' + cmd[4] + ' ' + cmd[5]
                manifestdata1 = manifestdata1.split('\t');
                manifestdata1[0] = check_in_cmd
                manifestdata1 = manifestdata1.join('\t')
                fs.appendFile(manifestpath, manifestdata1, function(err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
                manifestdata = "";
                manifestdata1 = "";

            });
        }
    }
}