var dict = {
    'division': 'Division',
    'class': 'Class',
    'yoa' : 'Year of Account',
    'gwp': 'Gross Written Premium',
    'claim_attr_ult': 'Ultimate Attritional Claims',
    'claim_ll_ult': 'Ultimate Large Loss Claims',
    'claim_cat_ult': 'Ultimate Catastrophe Claims',
    'claim_total_ult': 'Ultimate Total Claims',
    'claim_attr_inc': 'Incurred Attritional Claims',
    'claim_ll_inc': 'Incurred Large Loss Claims',
    'claim_cat_inc': 'Incurred Catastrophe Claims',
    'claim_total_inc': 'Incurred Total Claims'
};

var invdict = _.invert(dict);

var ndx;
var allDim;

// Data file
var policyDataFile = 'data/lm_overview.csv';

var config = {
    transition: 1500,
    opacity: 0.75,
    spinOpts: {
        lines: 9,
        length: 45,
        width: 21,
        radius: 42,
        scale: 1.0,
        corners: 1,
        trail: 60,
        shadow: true
    },
};

//Spinner while loading
var loadSpinner = new Spinner(config.spinOpts).spin();

$(".application").append(loadSpinner.el);
//Spinner while loading

//Clean Json data
var dateFormat = d3.time.format("%Y-%m-%d");
var commasFormat = d3.format(",.0f");
var currencyFormat = d3.format(",.2f");
var latlngFormat = d3.format(".4f");

//Charts
var divisionChart = dc.rowChart("#division-row-chart");
var classChart = dc.rowChart("#class-row-chart");
var yoaChart = dc.rowChart("#yoa-row-chart");
var gwp_NumDisplay = dc.numberDisplay("#total-gwp-nd");
var claim_attr_ultNumDisplay = dc.numberDisplay("#claim_attr_ult-nd");
var claim_ll_ultNumDisplay = dc.numberDisplay("#claim_ll_ult-nd");
var claim_cat_ultNumDisplay = dc.numberDisplay("#claim_cat_ult-nd");
var claim_total_ultNumDisplay = dc.numberDisplay("#claim_total_ult-nd");
var claim_attr_incNumDisplay = dc.numberDisplay("#claim_attr_inc-nd");
var claim_ll_incNumDisplay = dc.numberDisplay("#claim_ll_inc-nd");
var claim_cat_incNumDisplay = dc.numberDisplay("#claim_cat_inc-nd");
var claim_total_incNumDisplay = dc.numberDisplay("#claim_total_inc-nd");
var dynatable;

queue()
    .defer(d3.csv, policyDataFile)
    .await(makeGraphs);

function makeGraphs(error, policyCSV) {

    policyCSV.forEach(function (d) {
        d['gwp'] = currencyFormat(d['gwp']);
        d['claim_attr_ult'] = currencyFormat(d['claim_attr_ult']);
        d['claim_ll_ult'] = currencyFormat(d['claim_ll_ult']);
        d['claim_cat_ult'] = currencyFormat(d['claim_cat_ult']);
        d['claim_total_ult'] = currencyFormat(d['claim_total_ult']);
        d['claim_attr_inc'] = currencyFormat(d['claim_attr_inc']);
        d['claim_ll_inc'] = currencyFormat(d['claim_ll_inc']);
        d['claim_cat_inc'] = currencyFormat(d['claim_cat_inc']);
        d['claim_total_inc'] = currencyFormat(d['claim_total_inc']);
    });

    //Create a Crossfilter instance with policy data
    ndx = crossfilter(policyCSV);

    allDim = ndx.dimension(function(d) {return d;});

    //Define Dimensions
    var divisionDim = ndx.dimension(function (d) {
        return d['division'];
    });
    var classDim = ndx.dimension(function (d) {
        return d['class'];
    });
    var yoaDim = ndx.dimension(function (d) {
        return d['yoa'];
    });

    //Calculate metrics
    var divisionGroup = divisionDim.group();
    var classGroup = classDim.group();
    var yoaGroup = yoaDim.group();

    var all = ndx.groupAll();

    var total_gwp = ndx.groupAll().reduceSum(function (d) {
         return d["gwp"];
    });

    var total_claim_attr_ult = ndx.groupAll().reduceSum(function (d) {
         return d['claim_attr_ult'];
    });

    var total_claim_ll_ult = ndx.groupAll().reduceSum(function (d) {
         return d['claim_ll_ult'];
    });

    var total_claim_cat_ult = ndx.groupAll().reduceSum(function (d) {
         return d['claim_cat_ult'];
    });

    var total_claim_total_ult = ndx.groupAll().reduceSum(function (d) {
         return d['claim_total_ult'];
    });

    var total_claim_attr_inc = ndx.groupAll().reduceSum(function (d) {
         return d['claim_attr_inc'];
    });

    var total_claim_ll_inc = ndx.groupAll().reduceSum(function (d) {
         return d['claim_ll_inc'];
    });

    var total_claim_cat_inc = ndx.groupAll().reduceSum(function (d) {
         return d['claim_cat_inc'];
    });

    var total_claim_total_inc = ndx.groupAll().reduceSum(function (d) {
         return d['claim_total_inc'];
    });

    gwp_NumDisplay
         .formatNumber(d3.format(".3s"))
         .valueAccessor(function (d) {
             return d;
         })
         .group(total_gwp);

    claim_attr_ultNumDisplay
        .formatNumber(d3.format(".3s"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(total_claim_attr_ult);

    claim_ll_ultNumDisplay
        .formatNumber(d3.format(".3s"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(total_claim_ll_ult);

    claim_cat_ultNumDisplay
        .formatNumber(d3.format(".3s"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(total_claim_cat_ult);

    claim_total_ultNumDisplay
        .formatNumber(d3.format(".3s"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(total_claim_total_ult);

    claim_attr_incNumDisplay
        .formatNumber(d3.format(".3s"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(total_claim_attr_inc);

    claim_ll_incNumDisplay
        .formatNumber(d3.format(".3s"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(total_claim_ll_inc);

    claim_cat_incNumDisplay
        .formatNumber(d3.format(".3s"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(total_claim_cat_inc);

    claim_total_incNumDisplay
        .formatNumber(d3.format(".3s"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(total_claim_total_inc);

    classChart
        .width(900)
        .height(500)
        .dimension(classDim)
        .group(classGroup)
        .transitionDuration(config.transition)
        .elasticX(true)
        .title(function(d){
            return "Class: " + d.key + "\nTotal Policies: " + (d.value ? commasFormat(d.value) : 0);
        })
        .xAxis().ticks(4);

    divisionChart
        .width(900)
        .height(200)
        .dimension(divisionDim)
        .group(divisionGroup)
        .transitionDuration(config.transition)
        .elasticX(true)
        .title(function(d){
            return "Division: " + d.key + "\nTotal Policies: " + (d.value ? commasFormat(d.value) : 0);
        })
        .xAxis().ticks(4);

    yoaChart
        .width(900)
        .height(240)
        .dimension(yoaDim)
        .group(yoaGroup)
        .transitionDuration(config.transition)
        .elasticX(true)
        .title(function (d) {
            return "Year of Account: " + d.key + "\nTotal Policies: " + (d.value ? commasFormat(d.value) : 0);
        });

    $('#data-table').dynatable({
        features: {
            pushState: false
        },
        dataset: {
            records: allDim.top(Infinity),
            perPageDefault: 50,
            perPageOptions: [50, 100, 200, 500]
        }
    });

    dynatable = $('#data-table').data('dynatable');

    dc.renderAll();

    loadSpinner.stop();

}

function RefreshTable() {

    dynatable.settings.dataset.originalRecords = allDim.top(Infinity);

    dynatable.process();

};

function ResetChart(d) {

    //if used without chart resets everything
    if (!arguments.length) {
        d = dc;
    }

    d.filterAll();

    dc.redrawAll();

}

Ladda.bind('button', {
    timeout: config.transition
});
