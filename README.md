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

## Avtomatično vstavljanje podatkov v HTML ##

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

## Generiranje naključnih podatkov ##

Glavni izziv pri generiranju naključnih podatkov je v zmožnosti generiranja čim bolj realnih podatkov. Hitro lahko ugotovimo, da tabela, ki prikazuje seznam uporabnikov z naključnimi nizi, ki predstavljajo imena, priimke in email naslove, ni dovolj dober prototip. Modul pType za generiranje podatkov uporablja knjižnico Chance, ki zna poleg osnovnih tipov generirati naključne entitete kot so osebe, naslovi, mobilne naprave, spletni profili oseb ipd. Da poenostavimo uporabo knjižnice, moramo HTML elemente, ki jih  želimo napolniti z naključnimi podatki, opremiti z dodatnimi podatkovnimi atributi. Ti atributi modulu zagotovijo potrebne podatke za ustrezne klice Chance knjižnice.

```html
<input type="text" data-pt-randomize="true" data-pt-type="integer" />
```

Z atributom `data-pt-randomize` določimo element, ki bo vseboval naključne podatke. V zgornjem primeru želimo v vnosno polje vnesti naključno celo število. Tip podatka definiramo z atributom `data-pt-type`. Če želimo biti bolj natančni in generiran podatek podrobneje definirati, mu dodamo atribut data-pt-options`. Vrednost atributa je poenostavljen zapis JSON objekta, s katerim se kliče izbrano Chance metodo za generiranje podatka.

```html
<input type="text" dta-pt-randomize="true" data-pt-type="integer" data-pt-options="{min: 100, max: 1000}" 
/>
```

Ko želimo prikazati eno izmed vrednosti v končni množici, uporabimo atribut `data-pt-choices`. Vrednost atributa je z znakom "," ločen seznam vseh možnih vrednosti:

```html
<input type="text" data-pt-randomize="true" data-pt-choices="modra,zelena,bela,rumena" />
```

### Generiranje podatkov za sestavljene HTML elemente ###

Ko generiramo naključne podatke za kompleksnejše HTML elemente ali sestavljene strukture, moramo atribut `data-pt-randomize` določiti hierarhično najvišjemu elementu v strukturi. Za primer lahko vzamemo tabelo:

```html
<table data-pt-randomize="100">
	<thead>
		<tr>
			<th data-pt-type="first">Ime</th>
			<th data-pt-type="last">Priimek</th>
			<th data-pt-type="gender">Spol</th>
			<th data-pt-type="phone">Telefon</th>
		</tr>	
	</thead>
	
	<tbody>		
	</tbody>
</table>
```
 
Vrednost atributa \textit{data-pt-randomize} je v tem primeru število vrstic. Generiranje podatkov se izvede nekako takole:

```javascript
var data = [];
for(var i = 0; i < 100; i++) {	
	data.push([
		chance.first(),
		chance.last(),
		chance.gender(),
		chance.phone()
	]);
}
```

Pozoren bralec bo opazil, da ima zgornji primer za generiranje podatkov o uporabnikih pomanjkljivost. Generiranje podatkov posamezne osebe ne upošteva medsebojno odvisnih podatkov. Klica metod `chance.first()` in `chance.gender()` lahko vrneta nasprotujoča si podatka. Osebi z imenom Janez bi lahko določili ženski spol. Modul pType take situacije avtomatično prepozna in zagotovi usklajenost podatkov. Podobno se modul obnaša pri generiranju email naslovov in EMŠO številk. Pravilnejši prikaz generiranja podatkov:

```javascript
data = [];
for(var i = 0; i < n; i++) {	
	var spol = chance.gender();
	data.push([
		chance.first({ gender: spol }),
		spol
	]);
}
```
