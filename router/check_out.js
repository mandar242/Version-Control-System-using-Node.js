/**
 * This file is used by parse.js as a module.
 * It contains function which handles checkout command handler.
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
module.exports.checkout = {

    // function to check out sanpshot
    checkoutFolder: function (folderName, tragetFolder, snapshotName, fields) {
        const manifestpath = comman_module.comman.getmanifestpath(folderName);
        const contents = fs.readFileSync(manifestpath, { encoding: 'utf-8' });
        const sanpshotData = comman_module.comman.parseManifest(contents, snapshotName)
        this.copyFiles(folderName, sanpshotData, tragetFolder, fields)

    },

    // function to copy files
    copyFiles: function (folderName, sanpshotData, tragetFolder, fields) {
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
            comman_module.comman.checkoutmanifestentry('./' + folderName, fields, sanpshotData[i].location, destinationpath, tragetFolder)
        }
    }
}