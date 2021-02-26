# Cloud-Firestore-Collection-Renamer

A script that help to export and import in Cloud Firestore



# Requirements
You need NODE or something that can run JavaScript (JS) file.

Get serviceAccount JSON file from Project Setting > SERVICE ACCOUNTS in Firebase Console

Change the databaseURL when initializeApp with your own

# Setting Up
Download or clone this repository

`git clone https://github.com/Aosanori/Cloud-Firestore-Collection-Renamer.git`


Install npm packages

`npm install`

# Rename database from Firestore
This will help you create a backup of your collection and subcollection from Firestore to a JSON file name firestore-export.json

`node script.js <before-collection-name> <after-collection-name>`

If you have any recommendation or question, please create an issue. Thanks