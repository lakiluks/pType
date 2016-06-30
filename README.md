# pType #

Modul pType je bil razvit za namen diplomske naloge. Omogoča hitrejšo gradnjo dinamičnih prototipov z uporabo mehanizmov za generiranje nalkjučnih podatkov, simulacijo zalednega sistema ter avtomatično populacijo podatkov v HTML.

Za generiranje naključnih podatkov je uporabljena knjižnica [Chance](http://chancejs.com)

Za simulacijo zalednega sistema je uporabljen jQuery modul [Mockajax](https://github.com/jakerella/jquery-mockjax)

## Namestitev ##

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- dependencies -->
    <script src="lib/chance.js"></script>
    <script src="lib/jquery-2.2.2.min.js"></script>
    <script src="lib/jquery.mock.js"></script>
    
    <script src="src/ptype.js"></script>
  </head>
<body>
  ...
</body>
</html>
```

## Uporaba ##

Pri nadgrajevanju statičnih prototipov v dinamične ponavadi še nimamo izdelanega zalednega sistema. Denimo, da si, za namen testiranja prototipa, pripravimo nekaj testnih podatkov v obliki JSON datotek

```
uporabniki1.json (1005kb)
uporabniki2.json (250kb)
uporabniki2.json (420kb)
```

Za zajem podatkov simuliramo klic poizvedbe na zaledni sistem z uporabo modula Mockajax:

```javascript
$.mockjax({
	url: "/vrni/uporabnike/*",
	proxy: "/uporabniki1.json"
});
```

Ker je prikaz podatkov v uporabniškem vmesniku odvisen od količine zajetih podatkov, smo pripravili več datotek z različnimi količinami podatkov. Večja kot je datoteka, več podatkov vsebuje. Simulacijo zalednega sistema lahko nadgradimo tako, da datoteko s podatki izberemo naključno:

```javascript
$.mockjax({
	url: "/vrni/uporabnike/*",
	proxy: chance.pick(["uporabniki1.json",
		"uporabniki2.json","uporabniki3.json"])
});
```

Simulacijo naredimo bolj realno tako, da ji določimo časovno zakasnitev. Ker so datoteke različnih velikosti, morajo biti tudi zakasnitve različne. Z dodajanjem ustrezne zakasnitve primer \ref{randomDataProxy} nadgradimo:

```javascript
var mockData = chance.pickone[{
	file: "uporabniki.json",
	time: 1500
}, {
	file: "uporabniki2.json",
	time: 200
},{
	file: "uporabniki3.json",
	time: 800
}];

$.mockjax({
	url: "/vrni/uporabnike/*",
	proxy: mockData.file,
	responseTime: mockData.time
});
```
