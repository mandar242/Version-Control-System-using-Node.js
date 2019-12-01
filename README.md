# Version Control System

## Pre-requsites:
Install Node:<br /> 
    execute command : npm i

## command details  

###### 1. create repo
    cr #RepoName 

###### 2. checkin file
    a. first checkin
        ch #RepoName #snapshotName
        select file/folder based on radio button status from file browser

    b.after first checkin
        ch #RepoName #sourceFolderName #snapshortName
        select file/folder based on radio button status from file browser


###### 3. list repo
    list #RepoName 

###### 4. check-out repo
    check-out #RepoName #targetFolderName #snapshotName

###### 5. merge-out repo
    merge-out #RepoName #sourceSanpshortName #targetSnapshortName #targetFolderName

###### 6. merge-in repo
    merge-in #RepoName #sourceSnapshortName #targetSnapshortName #targetFolderName #snapshortName

## steps to execute
browserify views/client.js -o bundle.js<br />
node server.js<br />
localhost://3000<br />

