# Cloud-Firestore-Collection-Renamer

A script that help to rename collection name in Cloud Firestore



# Requirements
You need NODE or something that can run JavaScript (JS) file.

Get serviceAccount JSON file from Project Setting > SERVICE ACCOUNTS in Firebase Console

Change the databaseURL when initializeApp with your own

# Setting Up
Download or clone this repository:

`git clone https://github.com/Aosanori/Cloud-Firestore-Collection-Renamer.git`


Install npm packages:

`npm install`

# Rename database in Firestore
This will help you rename your collection name of Firestore.

`node script.js <before-root-collection-name> <after-root-collection-name>`

__This doesn't support chaging only the name of subCollection yet. Sorry.__

If you have any recommendation or question, please create an issue. Thanks.