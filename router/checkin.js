/**
 * This file is used by parse.js as a module.
 * It contains function which handles checkin command handler.
 *  
 * Authors :
 * Neha Bhoi (Neha.Bhoi@student.csulb.edu)
 * Ashwini Ukarde (ashwiniganesh.ukarde@student.csulb.edu)
 * Mandar Kuklarni (mandarvijay.kulkarni@student.csulb.edu)
 * Mayank Pidiha (mayank.pidiha@student.csulb.edu) 
 * 
 **/


var comman_module = require('./comman.js');
const fs = require('fs')
const _ = require('lodash');

module.exports.checkin = {

    // function to first upload file name
    checkinFirstTime: function (folderName, fields, res, files, userComment) {
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
                var final_fileName = comman_module.comman.generateFileName(fileObj, relativePath);
                fs.copyFile(fileObj.path, final_fileName, (err) => {
                    if (err) throw err;
                    console.log(fileObj.path + ' was copied to ' + final_fileName);
                });

                // add maifest Entry
                var manifestpath = comman_module.comman.getmanifestpath(folderName)
                var manifestdata = "";
                var dateTime = comman_module.comman.getdateTime();
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
    },

    // function to second+ upload file name
    CheckinAfterFirstTime: function (folderName, fields, res, files, userComment, sourceAdd) {
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
                var final_fileName = comman_module.comman.generateFileName(fileObj, relativePath);
                fs.copyFile(fileObj.path, final_fileName, (err) => {
                    if (err) throw err;
                    console.log(fileObj.path + ' was copied to ' + final_fileName);
                });

                // add maifest Entry
                var manifestpath = comman_module.comman.getmanifestpath(folderName)
                var manifestdata = "";
                var dateTime = comman_module.comman.getdateTime();
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
}