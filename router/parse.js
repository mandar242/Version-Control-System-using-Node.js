/**
 * This file is used by main.js as a module
 * It contains function which defines parese input cammand feature module.
 *  
 * Authors :
 * Neha Bhoi (Neha.Bhoi@student.csulb.edu)
 * Ashwini Ukarde (ashwiniganesh.ukarde@student.csulb.edu)
 * Mandar Kuklarni (mandarvijay.kulkarni@student.csulb.edu)
 * Mayank Pidiha (mayank.pidiha@student.csulb.edu) 
 * 
 **/
var ch_module = require('./checkin.js');
var create_module = require('./create.js');
var list_module = require('./list.js');
var checkout_module = require('./check_out.js');
var LCA_module = require('./LCA.js');
var mergeout_module = require('./merge_out.js');
var mergein_module = require('./mergein.js');
const createRepo = "CR";
const checkin = "CH";
const list = "LIST";
const checkout = "CHECK-OUT";
const mergeout = "MERGE-OUT";
const mergein = "MERGE-IN";
const _ = require('lodash');

// Function to parse commamd
module.exports.parseCommand = 
    function (fcommand, fields, res, files) {
        
        var cmdArray = fcommand.split(" ");

        var cmd = cmdArray[0].toUpperCase();
        var folderName = "./";
        folderName = folderName.concat(cmdArray[1])
        if (cmdArray.length == 2) {
            if (cmd == createRepo) {
                //create folder
                var repName = cmdArray[1];
                create_module.create.createFolder(folderName, repName,createRepo);
            }
            if (cmd == list) {
                //function to list snapshots
                list_module.list.listReop(folderName, res, fields);
            }
        }
        if (cmdArray.length == 3) {
            if (cmd == checkin) {
                //upload file
                var userComment = cmdArray[2].toUpperCase();
                ch_module.checkin.checkinFirstTime(folderName, fields, res, files, userComment)
            }

        }

        if (cmdArray.length == 4) {
            if (cmd === checkout) {

                const tragetFolder = './' + cmdArray[2];
                const snapshotName = cmdArray[3].toUpperCase();
                //check out snapshot
                checkout_module.checkout.checkoutFolder(cmdArray[1], tragetFolder, snapshotName, fields)
            }

            if (cmd === checkin) {
                // check-in after first time 
                const sourceAdd = cmdArray[2].toUpperCase();
                const userComment = cmdArray[3].toUpperCase();
                ch_module.checkin.CheckinAfterFirstTime(folderName, fields, res, files, userComment, sourceAdd);
            }
        }
         //Merge out
         if (cmdArray.length == 5) {
            console.log('newhr')
            if (cmd == mergeout) {
                const sourceSnapshot = cmdArray[2];
                const targetSnapshot = cmdArray[3];
                const targetFolder = cmdArray[4];
                const LCA = LCA_module.LCA.findLCA(folderName, sourceSnapshot, targetSnapshot);
                console.log("LCA: " + LCA);
                console.log("calling mergout");
                mergeout_module.mergeout.mergeoutFiles(fields, folderName, sourceSnapshot, targetSnapshot, LCA, targetFolder)
            }
        }
        // merge-in handler
        if (cmdArray.length == 6) {
            if (cmd == mergein) {
                console.log("calling mergein");
                console.log(cmdArray)
                const rep = cmdArray[1];
                const sourceSnapshot = cmdArray[2];
                const targetSnapshot = cmdArray[3];
                const targetFolder = cmdArray[4];
                const targetSnapshotName = cmdArray[5];
                const LCA = LCA_module.LCA.findLCA(folderName, sourceSnapshot, targetSnapshot);
                console.log("LCA: " + LCA);
                mergein_module.merge.mergeinFiles(fields, rep, sourceSnapshot, targetSnapshot, LCA, targetFolder, targetSnapshotName, files, res)
            }
        }
    }

