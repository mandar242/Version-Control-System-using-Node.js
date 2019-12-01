###Version Control System

##Pre-requsites:
1. Install Node: 
    -> step: npm i

##command details  <br />

######1.create repo<br />
    cr #RepoName <br />

######2.checkin file<br />
    a. first checkin<br />
        ch #RepoName #snapshotName<br />
        select file/folder based on radio button status from file browser<br />

    b.after first checkin<br />
        ch #RepoName #sourceFolderName #snapshortName<br />
        select file/folder based on radio button status from file browser<br />


######3.list repo<br />
    list #RepoName <br />

######4.check-out repo<br />
    check-out #RepoName #targetFolderName #snapshotName<br />

######5.merge-out repo<br />
    merge-out #RepoName #sourceSanpshortName #targetSnapshortName #targetFolderName

######6.merge-in repo<br />
    merge-in #RepoName #sourceSnapshortName #targetSnapshortName #targetFolderName #snapshortName

##steps to execute
browserify views/client.js -o bundle.js
node server.js
localhost://3000

