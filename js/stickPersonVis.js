
//=============================================== CONSTRUCTOR ===============================================//
function StickPersonVis(_data, _parentDiv) {
    this.data = _data;
    this.filteredData = this.data;
    this.parentDiv = _parentDiv;

    this.formatPercent = d3.format(".0%");
    this.formatLargeNumber = d3.format(",.2s");
    this.formatSmallNumber = d3.format(",.2r");
    this.formatMoney = d3.format("$,.0f");

    this.studentDemographicsMeasure = 'econ_disadvantaged';
    this.studentSuccessMeasure = 'meets_expectations_ELA';
    this.districtResourcesMeasure = 'teacher_retention';

    this.sortColumn = this.studentSuccessMeasure;
    this.sortDirection = 1;

    this.studentSuccessOptions = {
        meets_expectations_ELA: "% meeting expectations (english)",
        meets_expectations_math: "% meeting expectations (math)",
        avg_SAT_score: "average SAT score",
        percent_graduating_4_yrs: "% graduating (within 4 years)",
        percent_grads_attending_college: "% grads attending college"
    };

    this.studentDemographicOptions = {
        econ_disadvantaged: "% economically disadvantaged students",
        percent_non_white: "% non white students"
    };

    this.districtResourcesOptions = {
        teacher_retention: "annual teacher retention",
        FTE_teachers_per_100_students: "FTE teachers per 100 students",
        avg_teacher_salary: "average teacher salary",
        dollars_per_student: "budget per student",
        ch_70_aid_per_student: "state aid per student"
    };


    this.initVis();
}

//=============================================== INIT VIS ===============================================//
StickPersonVis.prototype.initVis = function() {
    //--------------------------- svg setup ---------------------------//
    var vis = this;

    vis.margin = {top: 130, bottom: 120, left: 300, right: 300};
    vis.oversizeMargin = 0;
    //vis.originalMargin = {top: vis.margin.top, right: vis.margin.right, bottom: vis.margin.bottom, left: vis.margin.left};
    vis.height = 500 - vis.margin.top - vis.margin.bottom;
    vis.legendMarginTop = 30;
    vis.legendMarginLeft = 20;
    //vis.originalLegendMarginLeft = vis.legendMarginLeft;
    vis.legendSpacing = 50;


    vis.svg = d3.select(vis.parentDiv)
                    .append("svg")
                    .attr("class", 'stickPersonVis')
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    //--------------------------- person icon ---------------------------//
    vis.personSymbol = vis.svg.append("defs")
        .append("g")
        .attr("id","personSymbol");

    //body
    vis.personSymbol
        .append("path")
        .attr("d", "M4.585,16.446c0.023-2.277-0.162-4.399-0.212-6.525C4.37,9.829,4.367,9.731,4.255,9.697C4.151,9.667,4.1,9.747,4.047,9.813c-0.664,0.843-1.331,1.685-1.99,2.532c-0.358,0.461-0.878,0.577-1.284,0.271c-0.405-0.305-0.441-0.823-0.104-1.293c1.018-1.421,2.007-2.859,3.095-4.231c0.649-0.817,1.387-1.304,2.483-1.276c1.066,0.026,2.136,0.007,3.206,0.051c0.861,0.037,1.316,0.638,1.795,1.208c1.17,1.388,2.154,2.911,3.201,4.387c0.25,0.354,0.154,0.872-0.186,1.142c-0.344,0.271-0.875,0.249-1.152-0.092c-0.701-0.862-1.381-1.744-2.076-2.616c-0.07-0.089-0.119-0.238-0.268-0.196c-0.164,0.046-0.117,0.205-0.123,0.322c-0.248,4.179-0.223,8.364-0.211,12.545c0.002,0.614-0.383,1.061-0.957,1.122c-0.84,0.088-1.365-0.196-1.503-0.82c-0.023-0.105-0.026-0.215-0.026-0.324c-0.002-2.206-0.004-4.414,0.004-6.62c0-0.221-0.056-0.296-0.286-0.29c-0.591,0.015-0.591,0.002-0.591,0.599c0,2.097,0.001,4.193,0,6.293c0,0.81-0.415,1.168-1.341,1.168c-0.721,0-1.148-0.438-1.148-1.176C4.585,20.444,4.585,18.369,4.585,16.446z" );

    //head
    vis.personSymbol
        .append("path")
        .attr("d", "M7.507,0.448c1.378-0.002,2.487,1.115,2.487,2.503C9.992,4.312,8.883,5.419,7.513,5.422C6.14,5.426,5.029,4.315,5.027,2.94C5.024,1.568,6.137,0.451,7.507,0.448z");

    vis.personSymbol.originalHeight = 24;
    vis.personSymbol.originalWidth = 15;

    //--------------------------- sort arrow icons ---------------------------//
    vis.upArrowSymbol = vis.svg.append("defs")
        .append("g")
        .attr("id","upArrowSymbol");

    vis.arrowSize = 10;

    vis.upArrowSymbol
        .append("polygon")
        .attr("points", (vis.arrowSize/2) + ",0 " + vis.arrowSize + "," + (vis.arrowSize * 0.75) + " 0,"+ (vis.arrowSize * 0.75));

    vis.downArrowSymbol = vis.svg.append("defs")
        .append("g")
        .attr("id","downArrowSymbol");

    vis.downArrowSymbol
        .append("polygon")
        .attr("points", (vis.arrowSize/2) + "," + (vis.arrowSize * 0.75) + " " + vis.arrowSize + ",0 0,0");

    //--------------------------- scales ---------------------------//

    vis.xScale = d3.scaleBand()
                    .paddingOuter(1)
                    .paddingInner(0.6);

    vis.peopleSizeScale = d3.scalePow()
                                .exponent(0.5);

    vis.resourcesScale = d3.scaleLinear();

    vis.colorScale = d3.scaleLinear()//red bd0000
                            .range(["#e9e3ed", "#9600a1"]);//"#75d3f0", "#ffaa00" blue to orange

    //--------------------------- pedestal color ---------------------------//
    vis.pedestalGradient = vis.svg.select("defs")
                                    .append("linearGradient")
                                        .attr("id", "pedestal-gradient")
                                        .attr("gradientUnits", "userSpaceOnUse")
                                        .attr("x1", "0%")
                                        .attr("x2", "0%");

    //bottom color
    vis.pedestalGradientStop_bottom = vis.pedestalGradient.append("stop")
                            .attr("offset", "20%")//20%
                            .attr("stop-color", "#e6e6e6"); //e6e6e6

    //middle color
    vis.pedestalGradientStop_middle = vis.pedestalGradient.append("stop")
                                .attr("offset", "50%")//40%
                                .attr("stop-color", "#bce0eb"); //d5dcdd

    //top color
    vis.pedestalGradientStop_end = vis.pedestalGradient.append("stop")
                            .attr("offset", "50.5%")//70%
                            .attr("stop-color", "#87ccb9"); //bbdadd //88bd99

    //---- short pedestals
    vis.shortPedestalGradient = vis.svg.select("defs")
        .append("linearGradient")
        .attr("id", "short-pedestal-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", "0%")
        .attr("x2", "0%");

    //bottom color
    vis.shortPedestalGradient_bottom = vis.shortPedestalGradient.append("stop")
        .attr("offset", "20%")//20%
        .attr("stop-color", "#e6e6e6");

    //top color
    vis.shortPedestalGradientStop_end = vis.shortPedestalGradient.append("stop")
        .attr("offset", "50.5%")//70%
        .attr("stop-color", "#bce0eb");//#faf3c3

    //--------------------------- ground ---------------------------//
    var groundHeight = 3;

    vis.svg.append("line")
        .attr("id", "ground-below-people")
        .attr("stroke-width", groundHeight)
        .attr("stroke", "#dddddd")
        .attr("y1", vis.height + groundHeight/2)
        .attr("y2", vis.height + groundHeight/2);

    //--------------------------- tooltip ---------------------------//
    vis.tooltip = vis.svg.append("g")
                            .attr("class", "stick-person-tooltip")
                            .attr("opacity", 0);



    vis.tooltip.append("polygon");
    vis.tooltip.append("rect");
    var tooltipText = vis.tooltip.append("text");

    tooltipText.append("tspan").attr("id", "tooltip-district-name");

    tooltipText.append("tspan").attr("id", "tooltip-district-resources");
    tooltipText.append("tspan").attr("id", "tooltip-district-resources-text");

    tooltipText.append("tspan").attr("id", "tooltip-student-success");
    tooltipText.append("tspan").attr("id", "tooltip-student-success-text");

    tooltipText.append("tspan").attr("id", "tooltip-student-demographics");
    tooltipText.append("tspan").attr("id", "tooltip-student-demographics-text");



    //--------------------------- legend / filters ---------------------------//

    vis.dropdownWidth = vis.margin.right *0.75;

    //---- person size
    vis.peopleSizeLegend = vis.svg.append("g");

    vis.peopleSizeLegend.append("g")
                    .attr("id", "small-legend-person")
                        .append("use")
                            .attr("xlink:href","#personSymbol")
                            .attr("fill", "#cccccc");

    vis.peopleSizeLegend.append("g")
                    .attr("id", "large-legend-person")
                    .append("use")
                        .attr("xlink:href","#personSymbol")
                        .attr("fill", "#cccccc");

    vis.peopleSizeLegend.append("text")
                    .attr("class", "small-value-label");

    vis.peopleSizeLegend.append("text")
                    .attr("class", "large-value-label");

    vis.personSizeDropdown = d3.select(vis.parentDiv).append("select")
                                .attr("id", "person-size-dropdown")
                                .attr("class", "form-control")
                                .style("width", vis.dropdownWidth+"px")
                                .on("change", function(d, i) { vis.wrangleData(); });

    for(const property in vis.studentSuccessOptions) {
        vis.personSizeDropdown.append("option")
            .attr("value", property)
            .text(vis.studentSuccessOptions[property]);
    }

    //---- person color
    vis.personColorLegend = vis.svg.append("g");

    vis.colorScaleGradient = vis.svg.select("defs")
        .append("linearGradient")
        .attr("id", "color-scale-gradient")
        //.attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    vis.colorScaleGradient.append("stop")
        .attr("offset", "5%")//20%
        .attr("stop-color", vis.colorScale.range()[0]);

    vis.colorScaleGradient.append("stop")
        .attr("offset", "95%")//20%
        .attr("stop-color", vis.colorScale.range()[1]);

    vis.personColorLegend.append("rect")
        .attr("id", "legend-color-rect")
        .attr("fill", function(d) { return "url(#color-scale-gradient)"; });

    vis.personColorLegend.append("text")
        .attr("class", "small-value-label");

    vis.personColorLegend.append("text")
        .attr("class", "large-value-label");

    vis.personColorDropdown = d3.select(vis.parentDiv).append("select")
        .attr("id", "person-color-dropdown")
        .attr("class", "form-control")
        .style("width", vis.dropdownWidth+"px")
        .on("change", function(d, i) { vis.wrangleData(); });

    for(const property in vis.studentDemographicOptions) {
        vis.personColorDropdown.append("option")
            .attr("value", property)
            .text(vis.studentDemographicOptions[property]);
    }

    //---- pedestal height
    vis.pedestalHeightLegend = vis.svg.append("g")
        .attr("transform", "translate(0," + (vis.height) + ")");

    vis.pedestalHeightLegend.append("line")
                    .attr("id", "pedestal-scale-line")
                    .attr("x1", -vis.legendMarginLeft)
                    .attr("y1", 0)
                    .attr("x2", vis.width)
                    .attr("y2", 0)
                    ;

    vis.pedestalHeightLegend.append("text")
        .attr("class", "small-value-label")
        .attr("id", "avg-pedestal-height-label");

    vis.pedestalHeightDropdown = d3.select(vis.parentDiv).append("select")
        .attr("id", "pedestal-height-dropdown")
        .attr("class", "form-control")
        .style("width", vis.dropdownWidth+"px")
        .style("top", (vis.margin.top + vis.height) + "px")
        .style("left", (vis.margin.left - vis.legendMarginLeft - vis.dropdownWidth) + "px")
        .on("change", function(d, i) { vis.wrangleData(); });

    for(const property in vis.districtResourcesOptions) {
        vis.pedestalHeightDropdown.append("option")
            .attr("value", property)
            .text(vis.districtResourcesOptions[property]);
    }

    //---- sort arrows
    vis.defaultSortArrowColor = "#cccccc";
    vis.selectedSortArrowColor = "#888888"

    vis.peopleSizeSortArrowUp = vis.peopleSizeLegend.append("use")
        .attr("xlink:href","#upArrowSymbol")
        .attr("class", "sort-arrow")
        .attr("fill", vis.selectedSortArrowColor);

    vis.peopleSizeSortArrowDown = vis.peopleSizeLegend.append("use")
        .attr("xlink:href","#downArrowSymbol")
        .attr("class", "sort-arrow")
        .attr("fill", vis.defaultSortArrowColor);

    vis.peopleColorSortArrowUp = vis.personColorLegend.append("use")
        .attr("xlink:href","#upArrowSymbol")
        .attr("class", "sort-arrow")
        .attr("fill", vis.defaultSortArrowColor);

    vis.peopleColorSortArrowDown = vis.personColorLegend.append("use")
        .attr("xlink:href","#downArrowSymbol")
        .attr("class", "sort-arrow")
        .attr("fill", vis.defaultSortArrowColor);

    vis.pedestalHeightSortArrowUp = vis.pedestalHeightLegend.append("use")
        .attr("xlink:href","#upArrowSymbol")
        .attr("class", "sort-arrow")
        .attr("fill", vis.defaultSortArrowColor);

    vis.pedestalHeightSortArrowDown = vis.pedestalHeightLegend.append("use")
        .attr("xlink:href","#downArrowSymbol")
        .attr("class", "sort-arrow")
        .attr("fill", vis.defaultSortArrowColor);


    vis.wrangleData();
}

//=============================================== WRANGLE DATA ===============================================//
StickPersonVis.prototype.wrangleData = function() {
    var vis = this;

    vis.studentSuccessMeasure = document.getElementById("person-size-dropdown").value;
    vis.studentDemographicsMeasure = document.getElementById("person-color-dropdown").value;
    vis.districtResourcesMeasure = document.getElementById("pedestal-height-dropdown").value;

    vis.filteredData = vis.data.filter(function(d, i) { return d.enrolled >= 4500 ; }); //
    vis.filteredData.sort(function(a, b) { return vis.sortDirection*(a[vis.sortColumn] - b[vis.sortColumn]); })

    console.log(vis.filteredData);

    vis.minDistrictResourcesValue = d3.min(vis.filteredData, function(d) { return d[vis.districtResourcesMeasure]; });
    vis.maxDistrictResourcesValue = d3.max(vis.filteredData, function(d) { return d[vis.districtResourcesMeasure]; });
    vis.avgDistrictResources = d3.sum(vis.filteredData, function(d) { return d[vis.districtResourcesMeasure]*d.enrolled;} )
                                    / d3.sum(vis.filteredData, function(d) { return d.enrolled; });

    vis.maxStudentSucessValue = d3.max(vis.filteredData, function(d) { return d[vis.studentSuccessMeasure]; });
    vis.minStudentSuccessValue = d3.min(vis.filteredData, function(d) { return d[vis.studentSuccessMeasure]; });


    vis.minStudentDemographicsValue = d3.min(vis.filteredData, function(d) { return d[vis.studentDemographicsMeasure]; });
    vis.maxStudentDemographicsValue = d3.max(vis.filteredData, function(d) { return d[vis.studentDemographicsMeasure]; });

    vis.updateVis();
}

//=============================================== UPDATE VIS ===============================================//
StickPersonVis.prototype.updateVis = function() {
    var vis = this;
    var enterTransition = d3.transition().duration(1000);



    //--------------------------- resize svg width ---------------------------//
    vis.width = window.innerWidth - vis.margin.left - vis.margin.right
        - parseFloat(getComputedStyle(document.body, null).getPropertyValue('margin-left'))
        - parseFloat(getComputedStyle(document.body, null).getPropertyValue('margin-right'))-20;


    if (vis.width > 800) {
        vis.oversizeMargin = (vis.width - 800)/3;
        vis.width = vis.width - vis.oversizeMargin*2;
    }
    else {
        vis.oversizeMargin = 0;
    }

    d3.select(".stickPersonVis")
        .attr("width", vis.width + vis.margin.left + vis.margin.right + vis.oversizeMargin*2)
        .select("g")
            .attr("transform", "translate(" + (vis.margin.left + vis.oversizeMargin) + "," + vis.margin.top + ")");

    vis.svg.select("#ground-below-people")
                .attr("x1", -vis.legendMarginLeft*3)
                .attr("x2", vis.width + vis.legendMarginLeft*3);



    //--------------------------- scales ---------------------------//
    vis.xScale
        .domain(vis.filteredData.map(function(d, i) { return i; }))
        .range([0,vis.width]);


    vis.maxPersonWidth = (vis.xScale.bandwidth() + vis.xScale.bandwidth()*vis.xScale.paddingInner()*2)*1.7;
    vis.maxPersonHeight = vis.maxPersonWidth / vis.personSymbol.originalWidth * vis.personSymbol.originalHeight;
    vis.maxPedestalHeight = vis.height - vis.maxPersonHeight - 5;

    vis.minPersonHeight = Math.max(8,
                        vis.maxPersonHeight / 5
                                //+ vis.personSymbol.originalHeight*vis.minStudentSuccessValue / vis.maxStudentSucessValue) / 2
                            );

    vis.peopleSizeScale
        .domain([vis.minStudentSuccessValue,vis.maxStudentSucessValue])
        .range([vis.minPersonHeight / vis.personSymbol.originalHeight, vis.maxPersonHeight / vis.personSymbol.originalHeight]);//.range([vis.minPersonHeight,vis.maxPersonHeight]);

    vis.resourcesScale
        .domain([0,vis.maxDistrictResourcesValue])
        .range([0,vis.maxPedestalHeight]);

    vis.colorScale.domain([vis.minStudentDemographicsValue, vis.maxStudentDemographicsValue]);

    //---- pedestal gradient
    vis.pedestalGradient
        .transition(enterTransition)
            .attr("y1", (vis.height))
            .attr("y2", (vis.height - vis.maxPedestalHeight));

    vis.pedestalGradientStop_middle
        .transition(enterTransition)
        .attr("offset", vis.avgDistrictResources / vis.maxDistrictResourcesValue * 0.999);
    vis.pedestalGradientStop_end
        .transition(enterTransition)
        .attr("offset", vis.avgDistrictResources / vis.maxDistrictResourcesValue*1.001);

    vis.shortPedestalGradient
        .transition(enterTransition)
        .attr("y1", (vis.height))
        .attr("y2", (vis.height - vis.maxPedestalHeight));

    vis.shortPedestalGradientStop_end
        .transition(enterTransition)
        .attr("offset", vis.avgDistrictResources / vis.maxDistrictResourcesValue * 0.999);

    //--------------------------- people ---------------------------//
    var people = vis.svg.selectAll(".person")
                            .data(vis.filteredData, function(d) { return d.org_code; });

    people.exit().remove();

    //new data points
    var newPeople = people.enter()
                .append("g")
                    .attr("transform", function(d, i) { return "translate(" + (vis.xScale(i)  + vis.xScale.bandwidth() / 2) + ","
                                                                                + (vis.height) + ")" +
                                                                " scale(0)"; })
                    .attr("class", "person");

    newPeople.append("use")
              .attr("xlink:href","#personSymbol");

    people = newPeople.merge(people)
        .on('mouseover', function(d, i) { vis.showTooltip(d, i, vis, this); })
        .on('mousemove', function(d, i) { vis.showTooltip(d, i, vis, this); })
        .on('mouseout', function(d, i) { vis.hideTooltip(vis); });

    //all data points
    people.attr("opacity", 0.75)
            .transition(enterTransition)
                .attr("fill", function(d) { return vis.colorScale(d[vis.studentDemographicsMeasure]); })
                .attr("transform", function(d, i) {
                    return "translate(" + (vis.xScale(i) - vis.personSymbol.originalWidth*vis.peopleSizeScale(d[vis.studentSuccessMeasure])/2 + vis.xScale.bandwidth() / 2) + ","
                        + (vis.height - vis.peopleSizeScale(d[vis.studentSuccessMeasure])*vis.personSymbol.originalHeight
                        - vis.resourcesScale(d[vis.districtResourcesMeasure]) - 2) + ")";
                })
                .attr("opacity", 1);

    people.select("use")
            .attr("transform", function (d) { return "scale(" + vis.peopleSizeScale(d[vis.studentSuccessMeasure]) + ")"; });



    //--------------------------- pedestals ---------------------------//
    var pedestals = vis.svg.selectAll(".pedestal")
                                .data(vis.filteredData, function(d) { return d.org_code; });

    pedestals.exit().remove();

    //new data points
    var newPedestals = pedestals.enter()
                        .append("rect")
                            .attr("class", "pedestal")
                            .attr("height", 0)
                            .attr("width", vis.xScale.bandwidth())
                            .attr("x", function(d, i) { return vis.xScale(i); })
                            .attr("y", vis.height)
                            .attr("fill", function(d) {
                                if (d[vis.districtResourcesMeasure] < vis.avgDistrictResources)
                                    return "url(#short-pedestal-gradient)";
                                return "url(#pedestal-gradient)";
                            });

    pedestals = newPedestals.merge(pedestals)
                            .on('mouseover', function(d, i) { vis.showTooltip(d, i, vis, this); })
                            .on('mousemove', function(d, i) { vis.showTooltip(d, i, vis, this); })
                            .on('mouseout', function(d, i) { vis.hideTooltip(vis); });

    var roundedCorners = vis.xScale.bandwidth() / 4;

    //existing data points
    pedestals.attr("opacity", 0.5)
            .transition(enterTransition)
                .attr("fill", function(d) {
                    if (d[vis.districtResourcesMeasure] < vis.avgDistrictResources)
                        return "url(#short-pedestal-gradient)";
                    return "url(#pedestal-gradient)";
                })
                .attr("height", function(d) { return vis.resourcesScale(d[vis.districtResourcesMeasure]) + roundedCorners; })
                .attr("y", function(d, i) { return vis.height - vis.resourcesScale(d[vis.districtResourcesMeasure]); })
                .attr("x", function(d, i) { return vis.xScale(i); })
                .attr("rx", roundedCorners)
                .attr("stroke-width", vis.xScale.bandwidth()*vis.xScale.paddingInner() + "px")
                .attr("width", vis.xScale.bandwidth())
                .attr("opacity", 1);

    //--------------------------- legend / filters ---------------------------//
    //---- person size
    vis.peopleSizeLegend.attr("transform", "translate(" + (vis.width/2 - vis.legendSpacing - vis.dropdownWidth/2) + ","
        + (vis.height +  vis.legendMarginTop + vis.maxPersonHeight) + ")");


    vis.peopleSizeLegend.select("#small-legend-person")
        .attr("transform", "translate(" + (-vis.peopleSizeScale(vis.minStudentSuccessValue)*vis.personSymbol.originalWidth) + "," + (- vis.peopleSizeScale(vis.minStudentSuccessValue)*vis.personSymbol.originalHeight) + ")" +
                            " scale(" + vis.peopleSizeScale(vis.minStudentSuccessValue) + ")")
        .select("use")
            .attr("fill", vis.colorScale((vis.maxStudentDemographicsValue - vis.minStudentDemographicsValue)/2));

    vis.peopleSizeLegend.select("#large-legend-person")
        .attr("transform", "translate(0," + -vis.maxPersonHeight + ")" +
                            " scale(" + vis.peopleSizeScale(vis.maxStudentSucessValue) + ")")
        .select("use")
        .attr("fill", vis.colorScale((vis.maxStudentDemographicsValue - vis.minStudentDemographicsValue)/2));

    vis.peopleSizeLegend.select(".small-value-label")
        .text(vis.formatLegendNumbers(vis.minStudentSuccessValue, vis.studentSuccessMeasure))
        .attr("x", -vis.peopleSizeScale(vis.minStudentSuccessValue)*vis.personSymbol.originalWidth - 4);
    vis.peopleSizeLegend.select(".large-value-label")
        .text(vis.formatLegendNumbers(vis.maxStudentSucessValue, vis.studentSuccessMeasure))
        .attr("x", vis.maxPersonWidth + 4);

    vis.personSizeDropdown
        .style("top", (vis.margin.top + vis.height + vis.legendMarginTop + vis.maxPersonHeight+5) + "px")
        .style("left", (vis.width/2 + vis.margin.left - vis.legendSpacing - vis.dropdownWidth + vis.oversizeMargin) + "px");



    //---- person color

    vis.personColorLegend.attr("transform", "translate(" + (vis.width/2 + vis.legendSpacing + vis.dropdownWidth/2)
        + "," + (vis.height +  vis.legendMarginTop +  vis.maxPersonHeight) + ")");

    vis.personColorLegend.select("#legend-color-rect")
        .attr("width", vis.dropdownWidth / 2)
        .attr("height", 4)
        .attr("x", -vis.dropdownWidth / 4)
        .attr("y", -8);

    vis.personColorLegend.select(".small-value-label")
        .text(vis.formatLegendNumbers(vis.minStudentDemographicsValue,vis.studentDemographicsMeasure))
        .attr("x", -(vis.dropdownWidth / 4 + 4));
    vis.personColorLegend.select(".large-value-label")
        .text(vis.formatLegendNumbers(vis.maxStudentDemographicsValue, vis.studentDemographicsMeasure))
        .attr("x", vis.dropdownWidth / 4 + 4);

    vis.personColorDropdown
        .style("top", (vis.margin.top + vis.height + vis.legendMarginTop + vis.maxPersonHeight+5) + "px")
        .style("left", (vis.width/2 + vis.margin.left + vis.legendSpacing + vis.oversizeMargin) + "px");

    //---- pedestal height
    var avgPedestalHeight = vis.resourcesScale(vis.avgDistrictResources);

    vis.pedestalHeightDropdown
        .transition(enterTransition)
            .style("top", (vis.margin.top + vis.height - avgPedestalHeight) + "px")
            .style("left", (vis.margin.left - vis.legendMarginLeft - vis.dropdownWidth + vis.oversizeMargin) + "px");

    vis.pedestalHeightLegend
        .transition(enterTransition)
            .attr("transform", "translate(0," + (vis.height - avgPedestalHeight) + ")");

    vis.pedestalHeightLegend.select("#pedestal-scale-line")
                            .attr("x1", -vis.legendMarginLeft)
                            .attr("y1", 0)
                            .attr("x2", vis.width)
                            .attr("y2", 0);

    vis.pedestalHeightLegend.select("text")
                        .text(vis.formatLegendNumbers(vis.avgDistrictResources, vis.districtResourcesMeasure) + " (average)")
                        //.attr("text-anchor", "end")
                        .attr("x", -vis.legendMarginLeft)
        .attr("y", -2);



    //---- sort arrows
    vis.peopleSizeSortArrowUp
        .attr("x", -(vis.dropdownWidth / 2+ vis.arrowSize + 5))
        .attr("y", -vis.arrowSize/2 + 15)
        .on("mousedown", function() { vis.sortButtonClicked(this, vis.studentSuccessMeasure, 1); });

    vis.peopleSizeSortArrowDown
        .attr("x", -(vis.dropdownWidth / 2+ vis.arrowSize + 5))
        .attr("y", vis.arrowSize/2 + 15)
        .on("mousedown", function() { vis.sortButtonClicked(this, vis.studentSuccessMeasure, -1); });

    vis.peopleColorSortArrowUp
        .attr("x", -(vis.dropdownWidth / 2+ vis.arrowSize + 5))
        .attr("y", -vis.arrowSize/2 + 15)
        .on("mousedown", function() { vis.sortButtonClicked(this, vis.studentDemographicsMeasure, 1); });

    vis.peopleColorSortArrowDown
        .attr("x", -(vis.dropdownWidth / 2+ vis.arrowSize + 5))
        .attr("y", vis.arrowSize/2 + 15)
        .on("mousedown", function() { vis.sortButtonClicked(this, vis.studentDemographicsMeasure, -1); });

    vis.pedestalHeightSortArrowUp
        .attr("x", -(vis.dropdownWidth + vis.legendMarginLeft + vis.arrowSize + 5))
        .attr("y", -vis.arrowSize/2 + 12)
        .on("mousedown", function() { vis.sortButtonClicked(this, vis.districtResourcesMeasure, 1); });

    vis.pedestalHeightSortArrowDown
        .attr("x", -(vis.dropdownWidth + vis.legendMarginLeft + vis.arrowSize +5))
        .attr("y", vis.arrowSize/2 + 12)
        .on("mousedown", function() { vis.sortButtonClicked(this, vis.districtResourcesMeasure, -1); });

}

StickPersonVis.prototype.sortButtonClicked = function(callingObject, _sortColumn, _sortDirection) {
    var vis = this;

    vis.svg.selectAll(".sort-arrow")
        .attr("fill", function() { return (this !== callingObject) ? "#cccccc" : "#666666"; });

    vis.sortColumn = _sortColumn;
    vis.sortDirection = _sortDirection;

    vis.wrangleData();
};

StickPersonVis.prototype.formatLegendNumbers = function(num, measure) {
    var vis = this;

    if (['enrolled'].includes(measure))
        return vis.formatLargeNumber(num);
    else if (['FTE_teachers_per_100_students', 'avg_SAT_score'].includes(measure))
        return vis.formatSmallNumber(num);
    else if (['avg_teacher_salary', 'dollars_per_student', 'ch_70_aid_per_student'].includes(measure))
        return vis.formatMoney(num);
    else
        return vis.formatPercent(num);
}

StickPersonVis.prototype.showTooltip = function(d, i, vis, callingObject) {
    var rectPadding = 18;

    var hslColor = d3.hsl(vis.colorScale(d[vis.studentDemographicsMeasure]));
    var dataPointColor = d3.hsl(hslColor.h, (hslColor.s*0.666 +0.5*0.333), Math.min(hslColor.l,0.5));
        //d3.hsl(vis.colorScale(d[vis.studentDemographicsMeasure])).darker(0.3);
    var dataPointColorStats = d3.hsl(dataPointColor.h, dataPointColor.s*0.5, dataPointColor.l);

    var text = vis.tooltip.select("text");
    var titleFontSize = 18;

    text.select("#tooltip-district-name")
        .text(d.district)
        .attr("fill", dataPointColor)
        .attr('y', 0)
        .attr("font-size", titleFontSize + "px")
        .attr("dy", "-1.35em");

    text.select("#tooltip-district-resources")
        .attr("fill", dataPointColorStats)
        .text(vis.formatLegendNumbers(d[vis.districtResourcesMeasure], vis.districtResourcesMeasure))
        .attr("x", "0")
        .attr("dy", "1.3em");

    text.select("#tooltip-district-resources-text")
        .text(" " + vis.districtResourcesOptions[vis.districtResourcesMeasure].replace("dollars ", ""));

    text.select("#tooltip-student-success")
        .attr("fill", dataPointColorStats)
        .text(vis.formatLegendNumbers(d[vis.studentSuccessMeasure], vis.studentSuccessMeasure))
        .attr("x", "0")
        .attr("dy", "1.1em");

    text.select("#tooltip-student-success-text")
        .text(" " + vis.studentSuccessOptions[vis.studentSuccessMeasure].replace("% ",""));

    text.select("#tooltip-student-demographics")
        .attr("fill", dataPointColorStats)
        .text(vis.formatLegendNumbers(d[vis.studentDemographicsMeasure], vis.studentDemographicsMeasure))
        .attr("x", "0")
        .attr("dy", "1.1em");

    text.select("#tooltip-student-demographics-text")
        .text(" " + vis.studentDemographicOptions[vis.studentDemographicsMeasure].replace("% ",""));

    var tempTitleTranslate = text.select("#tooltip-district-name").node().getBBox().width/2;
    text.select("#tooltip-district-name").attr("x", tempTitleTranslate);

    var textSize = vis.tooltip.select("text").node().getBBox();


    text.attr("transform", "translate(" + (-textSize.width / 2) + "," + (-textSize.height/2) + ")");
    //text.select("#tooltip-student-demographics").attr("x", -textSize.width/2);
    //text.select("#tooltip-student-success").attr("x", -textSize.width/2);
    //text.select("#tooltip-district-resources").attr("x", -textSize.width/2);

    textSize = vis.tooltip.select("text").node().getBBox();
    var rectSize = [textSize.width + rectPadding,textSize.height + rectPadding];

    //transform -- (0,0) is the bottom center of the text bubble (not including the extender)
    vis.tooltip
        //.transition(100)
            .attr("opacity", 1)
            .attr("transform", "translate(" + (vis.xScale(i) + vis.xScale.bandwidth()/2) + "," + -20 + ")");

    vis.tooltip.select("polygon")
        .attr("points", (-rectPadding/2) + "," + (-1) + " "
                        + (rectPadding/2)+ "," + (-1) + " "
                        + "0," + (vis.height
                                    - vis.peopleSizeScale(d[vis.studentSuccessMeasure])*vis.personSymbol.originalHeight
                                    - vis.resourcesScale(d[vis.districtResourcesMeasure])
                                    + 10));

    vis.tooltip.select("rect")
        .attr("x", -rectSize[0] / 2)
        .attr("y", -rectSize[1])
        .attr("width", rectSize[0])
        .attr("height", rectSize[1]);
}

StickPersonVis.prototype.hideTooltip = function(vis) {
    vis.tooltip
        .transition(300)
        .attr("opacity", 0);
}
