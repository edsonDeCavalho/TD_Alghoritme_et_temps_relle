const chatForm = document.getElementById('chat-form');
const chatMessage = document.getElementById('chat-message');
const romm_name = document.getElementById('room-name');
const socket = io();

var demandeDeChangemmentDePointReunion = false;
const phraseDeChangement = document.getElementById('phrase');
var pointDeRencontres
    /*****Points*******/
var distance1 = 0;
var distance2 = 0;

let myMap = L.map('myMap').setView([48.86507744158935, 2.341180105622733], 12)

const maPositionActuelle = { lat: 51.705, long: -0.09 };
var LmaPositionActuelle;

var couleur = []
couleur['versRestaurant'] = 'red'
couleur['versPointDeRnecontre'] = 'blue'


var pointA = new L.LatLng(0, 0);
var pointB = new L.LatLng(0, 0);
var pointList = [pointA, pointB];

var monRestaurant = 1

var flightPath = new L.Polyline(pointList, {
    color: couleur,
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1
});



/***Restaurants***/





//Recuperation de l'user

const { username, room, latitud_Debut, longitud_Debut } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
    ignoreTrailingSlash: true
})
outputNomRoom(room);

socket.emit('joinRoom', { username, room });
changeMentDeMaPosition(latitud_Debut, longitud_Debut);


//console.log( username+" "+room);

socket.on('nouveauPointDeRencotre_DS', ({ lat, lon }) => {
    pointDeRencontres = { latitud: lat, lonitud: lon }
    setPointDerencontre_DS(lat, lon)
});






//Envoie de message 

chatForm.addEventListener('click', (e) => {

    e.preventDefault();

    const message = document.getElementById('msg')
    console.log(message.value);

    //Envoe de message au serveur

    socket.emit('chatMessage', message.value);
});



/**
 * Création d'une boule message dans le dom 
 * @param {String} message 
 * 
 */

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = "<p class='meta'> " + message.username + " <span style='color:white;'>" + message.time + "</span></p><p class='text' style='color:white;'>" + message.message + "</p>";
    document.querySelector('.chat-messages').appendChild(div);
}

function outputNomRoom(rroom) {
    romm_name.innerHTML = rroom
}

/*********************Points*************************/

let pointDeRencontre = L.marker(51.5, -0.09)
    //setPointDerencontre(51.5, -0.09)
const constprovider = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

/**
 * Création de la carte 
 */




L.tileLayer(`https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png`, {
    maxZoom: 18,
}).addTo(myMap);

/**
 * Icones des marqueurs
 */

let iconPositionActuelle = L.icon({
    iconUrl: './panda1.png',
    iconSize: [60, 60],
    iconAnchor: [30, 60]
})

let iconpointDeRencontre = L.icon({
    iconUrl: './meeting2.png',
    iconSize: [60, 60],
    iconAnchor: [30, 60]
})

let iconRestaurant = L.icon({
    iconUrl: './restaurant.png',
    iconSize: [60, 60],
    iconAnchor: [30, 60]
})

let iconUser = L.icon({
    iconUrl: './user.png',
    iconSize: [60, 60],
    iconAnchor: [30, 60]
})



/**
 * Ajoutes de marqueurs avec des icones
 */

var pointA = new L.LatLng(51.5, -0.09);
var pointB = new L.LatLng(51.51, -0.09);
/*
let marker = L.marker(pointA)
marker.bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
marker.addTo(myMap)

let marker2 = L.marker(pointB)
marker2.bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
marker2.addTo(myMap)
/**
*
* Création d'un nouveau marqueur 
* Control de zoom sur les marqueurs  
* position de marqueurs s
*
**/

myMap.doubleClickZoom.disable()
myMap.on('dblclick', e => {
    if (demandeDeChangemmentDePointReunion) {
        let latLng = myMap.mouseEventToLatLng(e.originalEvent);
        setPointDerencontre(latLng.lat, latLng.lng)
        switchOptionsetPointDeRencontre()
    }
})

/*

var pointList = [pointA, pointB];

var firstpolyline = new L.Polyline(pointList, {
    color: 'red',
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1
});
firstpolyline.addTo(myMap);

*/

$("#demandeDeChangemmentDePointReunion").on("click", function() {
    switchOptionsetPointDeRencontre()
});


function switchOptionsetPointDeRencontre() {
    if (demandeDeChangemmentDePointReunion == true) {
        demandeDeChangemmentDePointReunion = false;
        phraseDeChangement.innerHTML = "";
    } else {
        demandeDeChangemmentDePointReunion = true;
        phraseDeChangement.innerHTML = "<span style='text-align:center'>Faites double click pour Selectionne un nouveau point de réunion</span>";
    }
}


function setPointDerencontre(lat, lon) {
    myMap.removeLayer(pointDeRencontre)
    pointDeRencontre = new L.marker([lat, lon]);
    pointDeRencontre.bindPopup("<b>Point de rencontre!</b><br/>").openPopup();
    pointDeRencontre.addTo(myMap)
    socket.emit('nouveauPointDeRencotre', ({ lat, lon }));
}

function setPointDerencontre_DS(lat, lon) {
    myMap.removeLayer(pointDeRencontre)
    pointDeRencontre = new L.marker([lat, lon], { icon: iconpointDeRencontre });
    pointDeRencontre.bindPopup("<b>Point de rencontre!</b><br/>").openPopup();
    pointDeRencontre.addTo(myMap)
}

function changeMentDeMaPosition(lat, lon) {
    socket.emit('changeMentDeMaPosition', ({ lat, lon }));
}



socket.on('changeMentDeMaPosition_DS', ({ lat, lon }) => {
    console.log("Client : " + lat + "  " + lon);
    maPositionActuelle.latitud = lat;
    maPositionActuelle.longitud = lon;
    printMyPostion();
});


socket.on('listDeRestaurantsChoisies', function(data) {
    console.log(data)
});

function printMyPostion() {
    //myMap.removeLayer(LmaPositionActuelle)
    LmaPositionActuelle = new L.marker([maPositionActuelle.latitud, maPositionActuelle.longitud], { icon: iconPositionActuelle });
    LmaPositionActuelle.bindPopup("<b>Votre position actuelle!</b>").openPopup();
    LmaPositionActuelle.addTo(myMap)
}


/** 
navigator.geolocation.getCurrentPosition(
    (pos) => {
        const { coords } = pos
        const { latitude, longitude } = coords
        L.marker([latitude, longitude]).addTo(myMap)
        setTimeout(() => {
            changeMentDeMaPosition(latitude, longitude)
        }, 5000)
    },
    (error) => {
        console.log(error)
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
**/



const position_usa = { lat: 8.851423451468996, lng: 2.272889495767388 };
const position_canada = { lat: 48.869071974408044, lng: 2.4042258120718563 };
const position_france = { lat: 48.83592595377961, lng: 2.3638053006768582 };
const position_germany = { lat: 48.85310072800269, lng: 2.304206288379729 };




var usa = new L.marker(new L.LatLng(48.851423451468996, 2.272889495767388), { icon: iconRestaurant });
var canada = new L.marker(new L.LatLng(48.869071974408044, 2.4042258120718563), { icon: iconRestaurant });
var france = new L.marker(new L.LatLng(48.83592595377961, 2.3638053006768582), { icon: iconRestaurant });
var germany = new L.marker(new L.LatLng(48.85310072800269, 2.304206288379729), { icon: iconRestaurant });



printRestaurant(usa)
printRestaurant(canada)
printRestaurant(france)
printRestaurant(germany)

function printRestaurant(restaurant) {
    restaurant.addTo(myMap)
}

const selectElement = document.getElementById('countries');

selectElement.addEventListener('change', (event) => {
    console.log(`You like ${event.target.value}`);
    monRestaurant = event.target.value;
    changemmentDeRestoPerso()
    socket.emit('chengemmentDeRestaurant', monRestaurant);
});

function changemmentDeRestoPerso() {
    switch (monRestaurant) {
        case "1":
            //clearMap()
            printLine(maPositionActuelle.latitud, maPositionActuelle.longitud, position_usa.lat, position_usa.lng, couleur['versPointDeRnecontre'])
            printLine(pointDeRencontres.latitud, pointDeRencontres.lonitud, position_usa.lat, position_usa.lng, couleur['versRestaurant'])
            distance1 = distance_calcul(maPositionActuelle.latitud, maPositionActuelle.longitud, position_usa.lat, position_usa.lng, "K").toFixed(4);
            distance2 = distance_calcul(pointDeRencontres.latitud, pointDeRencontres.lonitud, position_usa.lat, position_usa.lng, "K").toFixed(4);
            break;
        case "2":
            //clearMap()
            printLine(maPositionActuelle.latitud, maPositionActuelle.longitud, position_canada.lat, position_canada.lng, couleur['versPointDeRnecontre'])
            printLine(pointDeRencontres.latitud, pointDeRencontres.lonitud, position_canada.lat, position_canada.lng, couleur['versRestaurant'])
            distance1 = distance_calcul(maPositionActuelle.latitud, maPositionActuelle.longitud, position_canada.lat, position_canada.lng, "K").toFixed(4);
            distance2 = distance_calcul(pointDeRencontres.latitud, pointDeRencontres.lonitud, position_canada.lat, position_canada.lng, "K").toFixed(4);
            break;
        case "3":
            //clearMap()
            printLine(maPositionActuelle.latitud, maPositionActuelle.longitud, position_france.lat, position_france.lng, couleur['versPointDeRnecontre'])
            printLine(pointDeRencontres.latitud, pointDeRencontres.lonitud, position_france.lat, position_france.lng, couleur['versRestaurant'])
            distance1 = distance_calcul(maPositionActuelle.latitud, maPositionActuelle.longitud, position_france.lat, position_france.lng, "K").toFixed(4);
            distance2 = distance_calcul(pointDeRencontres.latitud, pointDeRencontres.lonitud, position_france.lat, position_france.lng, "K").toFixed(4);
            break;
        case "4":
            //clearMap()
            printLine(maPositionActuelle.latitud, maPositionActuelle.longitud, position_germany.lat, position_germany.lng, couleur['versPointDeRnecontre'])
            printLine(pointDeRencontres.latitud, pointDeRencontres.lonitud, position_germany.lat, position_germany.lng, couleur['versRestaurant'])
            distance1 = distance_calcul(maPositionActuelle.latitud, maPositionActuelle.longitud, position_germany.lat, position_germany.lng, "K").toFixed(4);
            distance2 = distance_calcul(pointDeRencontres.latitud, pointDeRencontres.lonitud, position_germany.lat, position_germany.lng, "K").toFixed(4);
            break;
        default:
            console.log("Vleur de restaurant pas réconue")
            break;
    }
    calc()
}


function printLine(lat1, lon1, lat2, lon2, couleur) {
    var pointA = new L.LatLng(lat1, lon1);
    var pointB = new L.LatLng(lat2, lon2);
    var pointList = [pointA, pointB];

    var firstpolyline = new L.Polyline(pointList, {
        color: couleur,
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
    });
    firstpolyline.addTo(myMap);
}


function printLineVersRestaurant(lat1, lon1, lat2, lon2, couleur) {
    var pointA = new L.LatLng(lat1, lon1);
    var pointB = new L.LatLng(lat2, lon2);
    var pointList = [pointA, pointB];

    myMap.removeLayer(flightPath)

    flightPath = new L.Polyline(pointList, {
        color: couleur,
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
    });
    firstpolyline.addTo(myMap);
}

function clearMap() {
    for (i in myMap._layers) {
        if (myMap._layers[i]._path != undefined) {
            try {
                myMap.removeLayer(myMap._layers[i]);
            } catch (e) {
                console.log("problem with " + e + myMap._layers[i]);
            }
        }
    }
}

function ajoutDeUsersDansCarte(user, restaurant, lat, lon) {
    var userName = user;
    var restaurant = restaurant;
    var latitud = lat;
    var longitud = lon;

    console.log("user : " + user + " restaurant : " + restaurant + " lat : " + lat + " lon : " + lon);

    const position = { lat, lon };
    var positionRestaurant;
    var marker = new L.marker(new L.LatLng(position), { icon: iconUser });
    marker.bindPopup("<b>Je suis ${userName}</b>").openPopup();
    marker.addTo(myMap);
    //pointDeRencontre



    /*
    switch (restaurant) {
        case "1":
            var positionRestaurant = { lat: 48.851423451468996, lng: 2.272889495767388 };
            break;
        case "2":
            var positionRestaurant = { lat: 48.869071974408044, lng: 2.4042258120718563 };
            break;
        case "3":
            var positionRestaurant = { lat: 48.83592595377961, lng: 2.3638053006768582 };
            break;
        default:
            var positionRestaurant = { lat: 8.851423451468996, lng: 2.272889495767388 };
            break;
    }
   */
    //printLine(lat, lon, positionRestaurant.lat,positionRestaurant.lng,couleur['versRestaurant']);
}



socket.on('AjoutDeAssociationRestaurantETUser', ({ user, userName, restautant, lat, lon }) => {
    console.log("arrive")
    console.log("user: " + user + "restautant: " + restautant + "lat: " + lat + "lon: " + lon)
    let marker2 = L.marker([lat, lon], { icon: iconUser }).addTo(myMap)
    marker2.bindPopup(userName).openPopup();
    //iconUser
    //latitud:lat, lonitud:lon

    switch (restautant) {
        case "1":
            var positionRestaurant = { lat: 48.851423451468996, lng: 2.272889495767388 };
            printLine(pointDeRencontres.latitud, pointDeRencontres.lonitud, positionRestaurant.lat, positionRestaurant.lng, couleur['versRestaurant'])

            break;
        case "2":
            var positionRestaurant = { lat: 48.869071974408044, lng: 2.4042258120718563 };
            printLine(pointDeRencontres.latitud, pointDeRencontres.lonitud, positionRestaurant.lat, positionRestaurant.lng, couleur['versRestaurant'])
            break;
        case "3":
            var positionRestaurant = { lat: 48.83592595377961, lng: 2.3638053006768582 };
            printLine(pointDeRencontres.latitud, pointDeRencontres.lonitud, positionRestaurant.lat, positionRestaurant.lng, couleur['versRestaurant'])
            break;
        default:
            var positionRestaurant = { lat: 48.85310072800269, lng: 2.304206288379729 };
            printLine(pointDeRencontres.latitud, pointDeRencontres.lonitud, positionRestaurant.lat, positionRestaurant.lng, couleur['versRestaurant'])
            break;
    }

    printLine(lat, lon, positionRestaurant.lat, positionRestaurant.lng, couleur['versPointDeRnecontre'])

    calc()
});


socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //Centrage de message

    ///chatMessage.scrollTop = chatMessage.scrollHeight;

    //Nettoyage de input mesage
    document.getElementById('msg').value = '';
    document.getElementById('msg').focus();
});


socket.emit('miseAjour', 'miseAjour');


socket.on('clean', message => {
    clearMap()
});


function calc() {
    distanceTotal = distance1 + distance2
    console.log("Distance : " + distanceTotal + " km")
    console.log("Temps : " + calculTemps(distance1, 4).toFixed(2) + " heures")
    document.getElementById('distanceARestaurant').innerHTML = distanceTotal + " km";
    document.getElementById('tempsRestantAPointDeRencontre').innerHTML = calculTemps(distance1, 4.2) + " heures"
}

function distance_calcul(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        return dist;
    }
}

function calculTemps(distance, vitesse) {
    //The formula of time is Time = Distance ÷ Speed
    return distance / vitesse;
}