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

Struktura JSON zapisa je v vseh datotekah (slika \ref{fig:testni_podatki}) enaka.

```json
[{
	"ime": "Luka",	
	"priimek": "Andrejak",
	"status": 1,
	"smer": "racunalniski sistemi",
	"starost": 29
}, ...]
```

Podatke pridobimo z AJAX poizvedbo, za prikaz podatkov pa pripravimo HTML tabelo z razširjenimi podatkovnimi atributi

```html
<table id="uporabniki">
	<thead>
		<tr>
			<th data-pt-name="ime">Ime</th>
			<th data-pt-name="priimek">Priimek</th>
			<th data-pt-name="status" 
				data-pt-choices="0:pavzer;1:dodiplomski;2:podiplomski">Status</th>
			<th data-pt-name="smer">Smer</th>
			<th data-pt-name="starost">Starost</th>
		</tr>	
	</thead>	
</table>

$.ajax({
	url: "/vrni/uporabnike/",
	success: function (data) {
		pType.loadData(
			$('#users'), 
			data			
		);
	}
});
```


