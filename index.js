const express = require('express');
const app = express();

const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const fetch = require('node-fetch');

app.get('/', async function (req, res) {
    if (req.query.id) {
        res.header('Access-Control-Allow-Origin', '*');
        return res.send(await getWeather(req.query.id));
    }

    if (req.query.lat && req.query.long) {
        res.header('Access-Control-Allow-Origin', '*');
        return res.send(await getWeather("?lat=" + req.query.lat + "&lon=" + req.query.long));
    }


    res.header('Access-Control-Allow-Origin', '*');
    res.send(await getWeather());
});

app.get("/searchCity", async function (req, res) {
    if (req.query.name) {
        res.header('Access-Control-Allow-Origin', '*');
        return res.send(await searchCityByName(req.query.name));
    }
})

app.listen(3000, async function () {
    console.log("Misty Backend started")
})

async function getWeather(id = "") {
    return fetch(`https://yandex.ru/pogoda/${id}`)
        .then(res => {
            if (res.status !== 404)
                return res.text()
        })
        .then(html => {
            if (!html)
                return

            const dom = new JSDOM(html);

            const placeNames = dom.window.document.querySelectorAll(".breadcrumbs__title")
            const weatherState = dom.window.document.querySelector(".link__condition").innerHTML
            const currentTemp =
                dom.window.document.querySelectorAll(".temp__value")[1].innerHTML;
            const feelsLikeTemp =
                dom.window.document.querySelectorAll(".temp__value")[2].innerHTML
            const wind = dom.window.document.querySelector(".fact__wind-speed").textContent
            const humidity = dom.window.document
                .getElementsByClassName("term term_orient_v fact__humidity")[0]
                .getElementsByClassName("term__value")[0]
                .textContent;
            const pressure = dom.window.document
                .getElementsByClassName("term term_orient_v fact__pressure")[0]
                .getElementsByClassName("term__value")[0]
                .textContent;

            return {
                locationName: placeNames[placeNames.length - 1].textContent,
                weatherState: weatherState,
                currentTemp: currentTemp,
                feelsLikeTemp: feelsLikeTemp,
                wind: wind,
                humidity: humidity,
                pressure: pressure
            }
        });
}

async function searchCityByName(city) {
    let html
    await fetch(encodeURI('https://yandex.ru/pogoda/search?request=' + city))
        .then(res => res.text())
        .then(text => {
            html = text
        });

    const dom = new JSDOM(html);
    const cities = []

    for (const city of dom.window.document.getElementsByClassName("link place-list__item-name"))
        cities.push({name: city.innerHTML, link: "https://yandex.ru" + city.getAttribute("href")})

    console.log(cities)

    return cities
}



