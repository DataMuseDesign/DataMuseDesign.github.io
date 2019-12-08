// SVG drawing area
var margin = {top: 40, right: 10, bottom: 40, left: 10};

var width = 750 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dimensions  = [];
var x = d3.scalePoint()
    .range([0, width])
    .padding(.5);
var y = {};

var background;
var foreground;

var categories = {
    econ_disadvantaged: "Economic Disadvantage",
    meets_expectations_math: "% Meeting Math Expectations",
    percent_grads_attending_college: "% Grads Attending College"
};



d3.csv("data/data.csv", function(error, data) {
    if(!error){
        // establish which dimensions we want to use
        dimensions = d3.keys(data[0])
            .filter(function(d) {
                return d == "econ_disadvantaged" || d == "meets_expectations_math" || d == "percent_grads_attending_college"
            });

        // linear scale
        dimensions.forEach(function(d, i) {
                var name = dimensions[i];
                y[name] = d3.scaleLinear()
                    .domain( d3.extent(data, function(d) { return +d[name]; }) )
                    .range([height, 0])
            }
        );
        x.domain(dimensions);

        // line coordinate function
        function path(d) {
            return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
        }

        // gray background lines
        background = svg.append("g")
            .attr("class", "background")
            .selectAll("newPath")
            .data(data)
            .enter().append("path")
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", "gray")
            .style("opacity", 0.2);

        //  foreground lines
        foreground = svg.append("g")
            .attr("class", "foreground")
            .selectAll("newPath")
            .data(data)
            .enter().append("path")
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", "#498f7c")//3694CC
            .style("opacity", 0.5);

        var out = d3.select();
        out.text(d3.tsvFormat(data.slice(0,24)));

        // brush function
        function brush() {
            var actives = [];
            svg.selectAll(".brush")
                .filter(function(d) {
                    y[d].brushSelectionValue = d3.brushSelection(this);
                    return d3.brushSelection(this);
                })
                .each(function(d) {
                    // brush extents on active y axis
                    actives.push({
                        dimension: d,
                        extent: d3.brushSelection(this).map(y[d].invert)
                    });
                });

            var selected = [];
            // display selected values in foreground
            foreground.style("display", function(d) {
                let isActive = actives.every(function(active) {
                    let result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
                    return result;
                });
                // Only render rows that are active across all selectors
                if(isActive) selected.push(d);
                return (isActive) ? null : "none";
            });

            // Render data as grid
            (actives.length>0)?out.text(d3.tsvFormat(selected)):out.text(d3.tsvFormat(data));
        }

        // group each dimension
        var g = svg.selectAll("newAxis")
            .data(dimensions).enter()
            .append("g")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

        // axes
        g.append("g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -7)
            .text(function(d) { return categories[d]; })
            .style("fill", "black");

        // brushes
        g.append("g")
            .attr("class", "brush")
            .each(function(d) {
                d3.select(this).call(y[d].brush = d3.brushY()
                    .extent([[-10,0], [10,height]])
                    .on("brush", brush)
                    .on("end", brush)
                )
            })
            .selectAll("rect")
            .attr("x", -10)
            .attr("width", 20);


    }
});