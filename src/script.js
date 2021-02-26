const admin = require("firebase-admin");
const serviceAccount = require("<your key>.json");
const Spinner = require("cli-spinner").Spinner;

let collectionName = process.argv[2];
let afterCollectionName = process.argv[3];

// You should replace databaseURL with your own
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://<your databse url>.firebaseio.com",
});

const db = admin.firestore();
db.settings({timestampsInSnapshots: true});

let data = {};
data[collectionName] = {};

async function getSubCollection(dt) {
	for (let [key] of Object.entries([dt[collectionName]][0])) {
		const collections = await db
			.collection(collectionName)
			.doc(key)
			.listCollections();
		collections.forEach(async (subCollection) => {
			const subCollectionName = subCollection.path.split("/").slice(-1)[0];
			data[collectionName][key][subCollectionName] = {};
			await addSubCollection(
				key,
				data[collectionName][key][subCollectionName],
				subCollectionName,
			);
		});
	}
}

function addSubCollection(key, subData, subColName) {
	return new Promise((resolve) => {
		db.collection(collectionName)
			.doc(key)
			.collection(subColName)
			.get()
			.then((snapshot) => {
				if (snapshot.docs.length != 0) {
					snapshot.forEach((subDoc) => {
						subData[subDoc.id] = subDoc.data();
						resolve("Added data");
					});
				} else {
					resolve("Not Added data");
				}
			});
	});
}

function isCollection(data) {
	if (
		typeof data != "object" ||
		data == null ||
		data.length === 0 ||
		isEmpty(data) ||
		Array.isArray(data)
	) {
		return false;
	}

	for (const key in data) {
		if (typeof data[key] != "object" || data[key] == null) {
			// If there is at least one non-object item in the data then it cannot be collection.
			return false;
		}
	}

	return true;
}

// Checks if object is empty.
function isEmpty(obj) {
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			return false;
		}
	}
	return true;
}

async function upload(data, path) {
	await admin
		.firestore()
		.doc(path.join("/"))
		.set(data)
		.then(() => console.log(`Document ${path.join("/")} uploaded.`))
		.catch(() => console.error(`Could not write document ${path.join("/")}.`));
}

async function resolve_data(data, path = []) {
	if (path.length > 0 && path.length % 2 == 0) {
		// Document's length of path is always even, however, one of keys can actually be a collection.

		// Copy an object.
		const documentData = Object.assign({}, data);

		for (const key in data) {
			// resolve_data each collection and remove it from document data.
			if (isCollection(data[key], [...path, key])) {
				// Remove a collection from the document data.
				delete documentData[key];
				// resolve_data a colleciton.
				resolve_data(data[key], [...path, key]);
			}
		}

		// If document is empty then it means it only consisted of collections.
		if (!isEmpty(documentData)) {
			// Upload a document free of collections.
			await upload(documentData, path);
		}
	} else {
		// Collection's length of is always odd.
		for (const key in data) {
			// resolve_data each collection.
			await resolve_data(data[key], [...path, key]);
		}
	}
}

const results = db
	.collection(collectionName)
	.get()
	.then((snapshot) => {
		snapshot.forEach((doc) => {
			data[collectionName][doc.id] = doc.data();
		});
		return data;
	})
	.catch((error) => {
		console.log(error);
	});

const spinner = Spinner("Downloading.. %s");
spinner.setSpinnerString("|/-\\");
spinner.start();

results.then((dt) => {
	getSubCollection(dt)
		.then(async () => {
			const clone = (obj) => Object.assign({}, obj);
			const renameKey = (object, key, newKey) => {
				const clonedObj = clone(object);
				const targetKey = clonedObj[key];

				delete clonedObj[key];
				clonedObj[newKey] = targetKey;
				return clonedObj;
			};

			data = renameKey(data, collectionName, afterCollectionName);
			spinner.stop();
			await resolve_data(data);
		})
		.catch((err) => {
			console.log(err);
		});
});
