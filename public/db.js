let db;
const request = indexedDB.open("budgetTracker", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
    console.log('Just created the store here is db again', db)
};

request.onsuccess = function (event) {
    db = event.target.result;
    // db.createObjectStore("pending", { autoIncrement: true });

    console.log('Just created the store here is db again ON SUCCES', db)

    if (navigator.onLine) {
        checkDatabase();
    }

};


request.onerror = function (event) {
    console.log("Woops! " + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
}

function checkDatabase() {
    console.log('this is our d b in', db)
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

window.addEventListener("online", checkDatabase);
