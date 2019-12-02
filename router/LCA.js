/**
 * This file is used by merge feature.
 * It contains function which defines Least Common Ancesstor feature.
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
const checkin = "CH";
const checkout = "CHECK-OUT";

module.exports.LCA = {
    // function to find LCA for merge-out and merge-in
    findLCA: function (folderName, sourceSnapshotName, targetSanpshotName) {
        var manifestpath = comman_module.comman.getmanifestpath(folderName);
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
