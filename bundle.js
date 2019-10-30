(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * This file is used at client side.
 * It contains function which creates ajax POST request to the nodejs server.
 * It also handles dynamic visibility of some HTML elememts
 * Minified version oh this file is bundle.js
 *  
 * Authers :
 * Neha Bhoi (Neha.Bhoi@student.csulb.edu)
 * Ashwini Ukarde (ashwiniganesh.ukarde@student.csulb.edu)
 * Mandar Kuklarni (mandarvijay.kulkarni@student.csulb.edu)
 * Mayank Pidiha (mayank.pidiha@student.csulb.edu) 
 * 
**/



// function execute after index.html load in DOM
window.onload = function () {
    // function to update file list on HTML Page
    let picker = document.getElementById('picker');
    let listing = document.getElementById('listing');

    //add event listener on folder upload input element
    picker.addEventListener('change', e => {
        var fileList = [];
        for (let file of Array.from(e.target.files)) {
            let item = document.createElement('li');
            item.textContent = file.webkitRelativePath;
            var jsonObj = {
                name: file.name,
                relativePath: file.webkitRelativePath
            }
            fileList.push(jsonObj);
            listing.appendChild(item);
        };
    });

    // Function excutes after form submit action
    var submitFunction1 = function () {
        var form = $('form')[0];
        var fd = new FormData(form);

        let picker = document.getElementById('picker');
        let picker1 = document.getElementById('picker1');
        var group = $('input[name=x]:checked').val()
        if (group == 'folder') {
            var ins = picker.files.length;
            fd.set('filetocheckin', {});
            for (var x = 0; x < ins; x++) {
                fd.append('filetocheckin', document.getElementById('picker').files[x]);
            }
        } else if (group == 'file') {
            var ins = picker1.files.length;
            fd.set('filetocheckin', {});
            for (var x = 0; x < ins; x++) {
                fd.append('filetocheckin', document.getElementById('picker1').files[x]);
            }
        }
        $.ajax({
            url: '/submit-Command-data',
            data: fd,
            type: 'POST',
            contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
            processData: false, // NEEDED, DON'T OMIT THIS
            success: function (msg) {
                
                if(msg.list){
                    let snapshotList = document.getElementById('snapshotList');
                    let list_title = document.getElementById('list_title');
                    list_title.textContent = 'List of snapshot in '+ msg.list.reponame;
                    for (let itemList of msg.list.snapshotsList) {
                        let item = document.createElement('li');
                        item.textContent = itemList
                        snapshotList.appendChild(item);
                    }
                    console.log()
                    alert("list success!")
                } else {
                    alert(msg)
                    location.reload();
                }
            }

        });
    }

    // add submit function on form submit action
    var form = document.getElementById("uploadForm");
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitFunction1();
    });

    // add radio button handler on the click of folder upload radio button
    document.getElementById('checkFolder').onclick = function () {
        if (this.checked) {
            document.getElementById("picker1").style.visibility = "hidden";
            document.getElementById("picker").style.visibility = "visible";
        }
    };

    //add radio button handler on the click of file upload radio button   
    document.getElementById('checkFiles').onclick = function () {
        if (this.checked) {
            document.getElementById("picker").style.visibility = "hidden";
            document.getElementById("picker1").style.visibility = "visible";
        }
    };

}



},{}]},{},[1]);
