# Version Control System

A version control system using Node.js. 
User can perform multiple functions such as create repository, check-in/check-out files, list repository contents, merge-out/merge-in project trees.

## Built With

1. [Node.js](https://nodejs.org/en/)
2. [npm](https://www.npmjs.com/get-npm)
3. [Express.js](https://expressjs.com/)

## Pre-requsites:

1. Editor (Visual Studio Code / Atom / other)
2. Node.js
3. npm

## Command Details  

###### 1. Creating a new Repository
    cr #RepoName 

###### 2. Check-in Files/Folder
    a. First Check-in
        ch #RepoName #snapshotName
        select file/folder based on radio button status from file browser

    b. Second + Check-in
        ch #RepoName #sourceFolderName #snapshortName
        select file/folder based on radio button status from file browser


###### 3. List Repository Content
    list #RepoName 

###### 4. Check-out Repository
    check-out #RepoName #targetFolderName #snapshotName

###### 5. Merge-out Repository
    merge-out #RepoName #sourceSanpshortName #targetSnapshortName #targetFolderName

###### 6. Merge-in Repository
    merge-in #RepoName #sourceSnapshortName #targetSnapshortName #targetFolderName #snapshortName

## Steps to execute
browserify views/client.js -o bundle.js<br />
node server.js<br />
localhost://3000<br />

