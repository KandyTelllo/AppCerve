let db;

const request = indexedDB.open("CervecentroDB", 1);

request.onupgradeneeded = function (e) {
db = e.target.result;
const store = db.createObjectStore("ventas", { keyPath: "id", autoIncrement: true });
store.createIndex("producto", "producto", { unique: false });
};

request.onsuccess = function (e) {
db = e.target.result;
console.log("Base de datos abierta con éxito");
mostrarVentas();
calcularTotales();
};

request.onerror = function (e) {
console.error("Error al abrir la base de datos", e);
};

function agregarVenta(venta) {
const tx = db.transaction("ventas", "readwrite");
const store = tx.objectStore("ventas");
store.add(venta);
tx.oncomplete = () => {
    mostrarVentas();
    calcularTotales();
};
}

function obtenerVentas(callback) {
const tx = db.transaction("ventas", "readonly");
const store = tx.objectStore("ventas");
const ventas = [];

store.openCursor().onsuccess = function (e) {
    const cursor = e.target.result;
    if (cursor) {
    ventas.push(cursor.value);
    cursor.continue();
    } else {
    callback(ventas);
    }
};
}

