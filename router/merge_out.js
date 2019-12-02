/**
 * This file is used by parse.js as a module
 * It contains function which handles merge out command handler.
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

module.exports.mergeout = {

    //Function Merge out
    mergeoutFiles: function (fields, repoName, sourceSnapshot, targetSnapshot, common, target) {
        console.log("inside mergout")
        const manifestpath = comman_module.comman.getmanifestpath(repoName);
        const contents = fs.readFileSync(manifestpath, { encoding: 'utf-8' });
        const sourceSanpshotData = comman_module.comman.parseManifest(contents, sourceSnapshot);
        console.log(sourceSanpshotData);
        const destinationSanpshotData = comman_module.comman.parseManifest(contents, targetSnapshot);
        const commonSanpshotData = comman_module.comman.parseManifest(contents, common);
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
                this.renameFileInDestindation(oldFileName, newFileName);
                fs.copyFile(sourceSanpshotData[i].location, destinationpath, (err, callback) => {
                    if (err) throw err;
                });
                console.log("calling manifest ");
                comman_module.comman.checkoutmanifestentry(repoName, fields, sourceSanpshotData[i].location, destinationpath, "");
                console.log(sourceSanpshotData[i].location + ' was copied to ', destinationpath);
                destinationpath = ''
            }


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
                this.renameFileInDestindation(oldFileName, newFileName);

                //Copy files to ddestination
                fs.copyFile(commonSanpshotData[i].location, destinationpath, (err, callback) => {
                    if (err) throw err;
                });
                comman_module.comman.checkoutmanifestentry("./" + repoName, fields, commonSanpshotData[i].location, destinationpath, "");
                console.log(commonSanpshotData[i].location + ' was copied to ', destinationpath);
                destinationpath = '';
            }


        }
    },

    // rename file in destination
    renameFileInDestindation: function (oldFileName, newFileName) {
        fs.rename(oldFileName, newFileName, function (err) {
            if (err) { console.log(err); return; }

            console.log('The file has been re-named from: ' + oldFileName + " from :" + newFileName);
        });
    },

}