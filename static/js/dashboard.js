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
var freezeToggle;

// Data file - git set to ignore json files
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


//var timeChart = dc.barChart("#time-chart");
var divisionChart = dc.rowChart("#division-row-chart");
var classChart = dc.rowChart("#class-row-chart");
var yoaChart = dc.rowChart("#yoa-row-chart");

// var genderChart = dc.pieChart("#gender-type-pie-chart");
// var numberPoliciesND = dc.numberDisplay("#number-policies-nd");
// var numberClaimsND = dc.numberDisplay("#number-claims-nd");
// var totalClaimsND = dc.numberDisplay("#total-claims-nd");
// var totalPremiumsND = dc.numberDisplay("#total-premiums-nd");
// var dynatable;

queue()
    .defer(d3.csv, policyDataFile)
    .await(makeGraphs);

function makeGraphs(error, policyCSV) {

    policyCSV.forEach(function (d) {
        /*d["initial_date"] = dateFormat.parse(d["initial_date"]);
        d["initial_date"].setDate(1);
        d['claim_tot'] = commasFormat(d['claim_tot']);
        d['prem'] = currencyFormat(d['prem']);*/
    });

    //Create a Crossfilter instance with policy data
    ndx = crossfilter(policyCSV);

    allDim = ndx.dimension(function(d) {return d;});

    //Define Dimensions
    var divisionDim = ndx.dimension(function (d) {
        return d["division"];
    });
    var classDim = ndx.dimension(function (d) {
        return d["class"];
    });
    var yoaDim = ndx.dimension(function (d) {
        return d["yoa"];
    });

    //Calculate metrics
    var divisionGroup = divisionDim.group();
    var classGroup = classDim.group();
    var yoaGroup = yoaDim.group();

    var all = ndx.groupAll();

    var totalPrem = ndx.groupAll().reduceSum(function (d) {
        return d["prem"];
    });

    var totalClaimAmount = ndx.groupAll().reduceSum(function (d) {
        return d["claim_tot"];
    });

    var totalClaimNum = ndx.groupAll().reduceSum(function (d) {
        return d["claim"] == true ? 1 : 0;
    });

    //Define values (to be used in charts)
    function minDate() {
        return startDim.bottom(1)[0]["initial_date"];
    }

    function maxDate() {
        return startDim.top(1)[0]["initial_date"];
    }

    // numberPoliciesND
    //     .formatNumber(commasFormat)
    //     .valueAccessor(function (d) {
    //         return d;
    //     })
    //     .group(all);
    //
    // numberClaimsND
    //     .formatNumber(commasFormat)
    //     .valueAccessor(function (d) {
    //         return d;
    //     })
    //     .group(totalClaimNum);
    //
    // totalPremiumsND
    //     .formatNumber(d3.format(".3s"))
    //     .valueAccessor(function (d) {
    //         return d;
    //     })
    //     .group(totalPrem);
    //
    // totalClaimsND
    //     .formatNumber(d3.format(".3s"))
    //     . valueAccessor(function (d) {
    //         return d;
    //     })
    //     .group(totalClaimAmount);

    divisionChart
        .width(400)
        .height(275)
        .dimension(divisionDim)
        .group(divisionGroup)
        .transitionDuration(config.transition)
        .elasticX(true)
        .title(function(d){
            return "Division: " + d.key + "\nTotal Policies: " + (d.value ? commasFormat(d.value) : 0);
        })
        .xAxis().ticks(4);

    classChart
        .width(400)
        .height(275)
        .dimension(classDim)
        .group(classGroup)
        .transitionDuration(config.transition)
        .elasticX(true)
        .title(function(d){
            return "Class: " + d.key + "\nTotal Policies: " + (d.value ? commasFormat(d.value) : 0);
        })
        .xAxis().ticks(4);

    yoaChart
        .width(160)
        .height(160)
        .dimension(yoaDim)
        .group(yoaGroup)
        .transitionDuration(config.transition)
        .elasticX(true)
        .title(function (d) {
            return "Year of Account: " + d.key + "\nTotal Policies: " + (d.value ? commasFormat(d.value) : 0);
        });

    // genderChart
    //     .height(160)
    //     .width(160)
    //     .radius(80)
    //     .innerRadius(30)
    //     .dimension(genderDim)
    //     .group(numPolsByGender)
    //     .transitionDuration(config.transition)
    //     .title(function (d) {
    //         return (d.key == 'M' ? 'Males: ' : 'Females: ') + (d.value ? commasFormat(d.value) : 0);
    //     });

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
