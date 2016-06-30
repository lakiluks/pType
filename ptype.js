var pType = (function () {

    var chance = new Chance(),
        elements = {},
        self = this;

    chance.init({nationality: 'si'});

    /**** UTILS ****/

    /**
     * Loads data into HTML element
     * @param el HTML element
     * @param data
     * */
    function load (el, data) {
        var e = null;

        if(typeof data != 'object') data = [data];
        for(var id in data) if(data.hasOwnProperty(id)) {
            e = el.querySelector('[data-pt-name="' + id + '"]')||el;

            if(e.hasAttribute('data-pt-formater')) {
                var fn = e.getAttribute('data-pt-formater');
                if(typeof window[fn] == 'function') data[id] = window[fn].call(null, data[id]);
            }

            if(e.tagName == 'INPUT' && (e.type == 'radio' || e.type == 'checkbox')) {
                if(el.querySelector('[data-pt-name="' + id + '"][value="' + data[id] + '"]')) {
                    el.querySelector('[data-pt-name="' + id + '"][value="' + data[id] + '"]').setAttribute('checked', true);
                } else {
                    el.querySelector('[data-pt-name="' + id + '"][value]').setAttribute('checked', false);
                }
            }
            else if(typeof e.value != 'undefined') e.value = data[id];
            else e.innerHTML = data[id];
        }
    }

    /**
     * Returns HTML element
     * @param el HTML element or jQuery object
     * */
    function getElement (el) {
        if(!el && !el.length) return {};

        if(typeof jQuery != 'undefined' && el instanceof jQuery) el = el[0];

        var element = {
            el: el,
            name: '',
            dependency: {},
            latency: 0
        };

        if(typeof el.ptID != 'undefined') {
            element = elements[el.ptID];
        } else {
            element.el.ptID =  chance.string({ length: 8, pool:'qwertzuiopasdfghjklyxcvbnm0123456789' });
        }

        if(element.el.hasAttribute('data-pt-name')) {
            element.name = element.el.getAttribute('data-pt-name');
        }

        if(element.el.hasAttribute('data-pt-latency')) {
            element.latency = element.el.getAttribute('data-pt-latency');
            if(isNaN(element.latency * 1)) {
                var bounds = element.latency.match(/\d+/g);
                if(bounds.length == 2) element.latency = chance.integer({ min: Number(bounds[0]), max: Number(bounds[1])});
                if(bounds.length == 1 && !isNaN(bounds[0] * 1)) element.latency = Number(bounds[0]);
            }
        }

        element.tag = element.el.tagName.toLowerCase();
        elements[element.el.ptID] = element;

        return element;
    }

    /**
     * RANDOM
     * */
    this.randomize = function (el) {
        var element = getElement(el);

        //console.debug('Generating random data:');
        //console.log(element);

        setTimeout(function () {
            if(element.tag == 'table') {
                randomizeTable(element);
            } else {
                load(element.el, getRandomValue(getRandomOptions(element.el)));
                if(element.dependency) {
                    for(var id in element.dependency) if(element.dependency.hasOwnProperty(id)) {
                        self.calculate(element.dependency[id].el);
                    }
                }
            }
        }, element.latency);
    };

    function getRandomValue (type) {
        var value = '';

        try {
            value = chance[type.fnName].call( chance, type.fnOptions );
        } catch (e) {
            //console.log(type);
            //console.log(e);
        }

        return typeof type.fnOptions.formater == 'function' ? type.fnOptions.formater.call(null, value) : value;
    }

    function getRandomOptions (el) {
        var cFun = el.getAttribute('data-pt-type')||"string",
            cOpts = {};

        // preveri, če obstaja predefiniran nabor podatkov
        if(el.hasAttribute('data-pt-choices')) {
            cFun = 'pick';
            cOpts = el.getAttribute('data-pt-choices').split(',');
        }

        if (el.hasAttribute('data-pt-options')) {
            var opts = el.getAttribute('data-pt-options'),
                parts = opts.match(/(\w*?)\:/g);

            for(var ip in parts) {
                opts = opts.replace(parts[ip], '"' + parts[ip].replace(':','":'));
            }

            cOpts = JSON.parse('{' + opts.replace(/^\{/, '').replace(/\}$/, '') + '}');
        }

        return { fnName: cFun, fnOptions: cOpts };
    }

    function randomizeTable (element) {
        var table = element.el,
            cells = table.querySelectorAll("tr:first-child th, tr:first-child td"),
            dataTypes = [],
            data = [],
            row = [];

        // pripravi nastavitve za generiranje podatkov v celicah
        for(var ci in cells) if(cells.hasOwnProperty(ci)) {
            dataTypes.push(getRandomOptions(cells[ci]));
        }

        var rows = 20;
        if(table.hasAttribute('data-pt-randomize')) {
            rows = table.getAttribute('data-pt-randomize');
        }

        for(var i = 0; i < rows; i++) {
            row = [];
            for(var j = 0; j < dataTypes.length; j++) {
                // generiranje podatka
                row.push(getRandomValue(dataTypes[j]));
            }
            data.push(row);
        }

        loadTable(table, data);
    }


    /**
     * CALCULATE
     * */
    this.calculate = function (el) {
        var element = getElement(el),
            formula = "",
            value = "";

        if(element.el.hasAttribute('data-pt-options')) {
            formula = element.el.getAttribute('data-pt-options');
        }

        value = calculateValue(formula, element);

        load(element.el, value);
    };

    function calculateValue (formula, element) {
        var parts = formula.match(/[a-z]+/g),
            e = null;

        for(var p in parts) if(parts.hasOwnProperty(p)) {
            e = document.querySelector('[data-pt-name="' + parts[p] + '"]');
            if(element && e.ptID) elements[e.ptID].dependency[element.el.ptID] = element;
            if(e) formula = formula.replace(parts[p], e.innerHTML);
        }

        try {
            return eval(formula);
        } catch (e) {
            //console.debug("Calculation error");
            //console.log(element);
        }

        return 0;
    }

    /**
     * INSERT DATA
     * */
    this.loadData = function (el, data) {
        var element = getElement(el);

        if(element.tag == 'table') {
            loadTable(element.el, data);
        } else {
            load(element.el, Array.isArray(data) ? data[0] : data);
        }
    };

    function remapObject2Array (o, map) {
        var a = [];
        for(var p in map) if(map.hasOwnProperty(p)) a[map[p]] = o[p]||"";
        return a;
    }

    function loadTable (table, data) {
        var cells = table.querySelectorAll("tr:first-child th, tr:first-child td"),
            cellMap = {},
            rowsHolder = table.querySelector('tbody') || table,
            row = null,
            cell = null,
            cellData = '';

        for(var ci in cells) if(cells.hasOwnProperty(ci)) {
            // mapiramo vrstni red polj glede na ime podatka
            if(cells[ci].hasAttribute('data-pt-name')) cellMap[cells[ci].getAttribute('data-pt-name')] = ci;
        }

        for(var i = 0; i < data.length; i++) {
            row = document.createElement('tr');
            cellData = Object.getOwnPropertyNames(cellMap).length ?  remapObject2Array(data[i], cellMap) : data[i];

            for(var j = 0; j < cellData.length; j++) {
                cell = document.createElement('td');
                load(cell, cellData[j]);
                row.appendChild(cell);
            }

            rowsHolder.appendChild(row);
        }
    }

    this.getElements = function () {
        return elements;
    };

    /**
     * Autogenerate data
     * */
    this.run = function () {
        /* random data */
        var randomData = document.querySelectorAll('[data-pt-randomize]');
        for(var ird in randomData) if(randomData.hasOwnProperty(ird)) this.randomize(randomData[ird]);

        /* calculated data */
        var  calculatedData = document.querySelectorAll('[data-pt-type="calculated"]');
        for(var icd in calculatedData) if(calculatedData.hasOwnProperty(icd)) this.calculate(calculatedData[icd]);
    };

    window.addEventListener('load', function () { self.run(); });

    return this;
})();