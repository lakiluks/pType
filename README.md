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

Podatke, ki jih želimo prikazati v uporabniškem vmesniku, vedno pridobimo v neki v naprej določeni strukturi. Navadno gre za XML dokument ali pa JSON objekt. Zaradi enostavnosti se bomo osredotočili na JSON obliko zapisa podatkov. Enostaven primer JSON objekta je seznam uporabnikov:

```json
[{
	"firstName": "Luka",	
	"lastName": "Andrejak",	
	"email": "luka.andrejak@gmail.com",
	"status": 1
},{
	"firstName": "Janez",	
	"email": "j.novak@gmail.com",
	"lastName": "Novak",
	"status": 1
},{
	"email": "doe.john@yahoo.com",
	"firstName": "John",	
	"lastName": "Doe",
	"status": 0
}]
```

Če hočemo podatke iz take strukture pravilno prikazati, moramo vedeti, v katerem HTML elementu naj določeni podatek prikažemo. HTML elemente enolično označimo z atributom `data-pt-name`. Za tabelaričen prikaz podatkov, bi pripravili HTML tabelo:


```html
<table class="users">
	<thead>
		<th data-pt-name="firstName">Ime</th>
		<th data-pt-name="lastName">Priimek</th>
		<th data-pt-name="email">Email</th>
		<th data-pt-name="status" 
			data-pt-choices="1:aktiven,0:neaktiven">Status</th>
	</thead>
	
	<tbody>	
	</tbody>
</table>
```

Imena stolpcev tabele se ujemajo s podatkovno strukturo JSON objekta, zato lahko vsako vrstico tabele ustrezno napolnimo s pravimi podatki. Posebnost je stolpec za prikaz statusa. V podatkovni strukturi je vrednost statusa lahko 0 ali 1. Iz vidika uporabniške izkušnje je predstavitev statusa uporabnika veliko boljša, če v polju piše \textit{aktiven} ali \textit{neaktiven}, kot 1 ali 0. Ta stolpec dodatno opremimo z atributom \textit{data-pt-choices}, ki definira preslikavo podatka. 

Podatke prikažemo s klicem metode `pType.loadData()`:

```javascript
$.ajax({
	url: "/uporabniki/seznam",
	success: function (data) {
		pType.loadData($('table.users'), data);
	}
});
```

ali pa HTML element, ki ga želimo napolniti s podatki, opremimo z atributom \textit{data-pt-source}. Vrednost atributa je URL naslov poizvedbe, ki bo priskrbela želene podatke. V tem primeru se bo metoda \textit{pType.loadData()} izvedla avtomatično.

```html
<table data-pt-source="/uporabniki/seznam">
	...
</table>
```

