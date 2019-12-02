/**
 * This file is used by parse.js as a module.
 * It contains function which handles create repository command handler.
 *  
 * Authors :
 * Neha Bhoi (Neha.Bhoi@student.csulb.edu)
 * Ashwini Ukarde (ashwiniganesh.ukarde@student.csulb.edu)
 * Mandar Kuklarni (mandarvijay.kulkarni@student.csulb.edu)
 * Mayank Pidiha (mayank.pidiha@student.csulb.edu) 
 * 
 **/

const fs = require('fs')
module.exports.create = {

   // function to create new repo
   createFolder: function (fpath, repName,createRepo) {
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
}