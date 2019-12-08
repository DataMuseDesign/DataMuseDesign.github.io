//parameters of object
ForceMap = function(_svg, _data){
    this.svg = _svg;
    this.data = _data;
    this.displayData = _data;
    this.index = 2;
    this.highlight = false;

    //initialize visualization
    this.initVis();
}

//initialize visualization
ForceMap.prototype.initVis = function(){
    var vis = this;

    //function for determining node placement along circumference of circle
    //size of circle determined by .sizeScale range
    vis.circle = function (node) {
        var angle = (node.index / (vis.nodes.length / 2)) * Math.PI;
        var coord = [];
        coord.push((250 * Math.cos(angle)) + vis.svg.attr("width")/2);
        coord.push((250 * Math.sin(angle)) + vis.svg.attr("height")/2 - 30);
        return coord;
    };

    //create scales for various purposes
    vis.sizeScale = d3.scaleLinear();

    vis.factorScale = d3.scaleLinear()
        .range([10, 300]);

    vis.successScale = d3.scaleLinear()
        .domain([0,100])
        .range([300, 10]);

    vis.colorScale = d3.scaleLinear()
        .range(["#e9f2f0", "#296655"]);

    //create axis
    vis.xAxis = d3.axisBottom()
        .scale(vis.factorScale)
        .tickFormat(function(d) { return d/1000; });
    vis.yAxis = d3.axisLeft()
        .scale(vis.successScale);


    // Tooltip placeholder
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return d.properties.District + "<br>"
                + "Size: " + d.properties[vis.valueFactor]  + "<br>"
                + "Color: " + d.properties[vis.valueSuccess] + "%";
        });

    //create group for scatter plot
    vis.plot = vis.svg.append("g")
        .attr("transform", "translate(" +
            (vis.svg.attr("width")/2 - vis.factorScale.range()[1]/2) + ", " +
            (vis.svg.attr("height")/2 - vis.successScale.range()[0]/2 - 30) + ")")
        .attr("visibility", "hidden");


    //append axis to scatter plot
    vis.plot.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.successScale.range()[0] + ")");
    vis.plot.append("g")
        .attr("class", "y-axis axis");

    //append the label for the x axis
    vis.label1 = vis.plot.append("text")
        .attr("transform", "translate(150, 350)")
        .style("text-anchor", "middle");

    //append the label for the y axis
    vis.label2 = vis.plot.append("text")
        .attr("x", 150)
        .attr("y", 40)
        .attr("transform", "rotate(90)")
        .style("text-anchor", "middle");

    //append group for color scale
    vis.legend = vis.svg.append("g")
        .attr("class", "legend");

    //wrangle data
    vis.wrangleData();
}

//wrangle data
ForceMap.prototype.wrangleData = function(){
    var vis = this;

    //get factor value from user
    vis.valueFactor = d3.select("#selection").property("value");

    //get success value from user
    vis.valueSuccess = d3.select("#selection2").property("value");

    //listen for if used searches for a specific district
    d3.select("#search").on("click", function() {

        //remember search
        vis.highlight = true;
        vis.name = d3.select("#districts").property("value");

        //if the search was valid, wrangle data
        if(vis.name !== "" && vis.name !== undefined) {
            vis.wrangleData();
        }

        console.log("error");
    });

    //initialize axis
    vis.plot.select(".y-axis").call(vis.yAxis);
    vis.plot.select(".x-axis").call(vis.xAxis);

    //set labels to readable value
    vis.label1.text(function() {
        if(vis.valueFactor === "Enrolled") {
            return "Enrolled Students (x1000)";
        } else if(vis.valueFactor === "FTE_tchrs_per_100_students") {
            return "Teachers per 100 Students (x1000)";
        } else if(vis.valueFactor === "Funds_per_indistrict_pupil") {
            return "$ per In-district Pupil (x1000)";
        }
    });

    vis.label2.text(function() {
        if(vis.valueSuccess === "Econ_disadv") {
            return "% at Economic Disadvantage";
        } else if(vis.valueSuccess === "ELA_meet_exceed_expectations") {
            return "% Meeting English Expectations";
        } else if(vis.valueSuccess === "ELA_student_growth_percentile") {
            return "English Language Growth Percentile";
        } else if(vis.valueSuccess === "Math_meet_exceed_expectations") {
            return "% Meeting Math Expectations";
        } else if(vis.valueSuccess === "Math_student_growth_percentile") {
            return "Math Growth Percentile";
        }
    });

    //order data (descending)
    vis.displayData = vis.data.sort( function(a, b){
        return b[vis.valueFactor] - a[vis.valueFactor];
    });

    //set legend to proper location
    vis.legend.attr("transform", "translate(260, 580)");

    //set the scale of the nodes
    vis.sizeScale
        .domain(d3.extent(vis.displayData, function(d) { return d[vis.valueFactor]; }))
        .range([3,75]);

    //resize scale individually, otherwise the nodes are to big to fit in svg
    if(vis.valueFactor === "Funds_per_indistrict_pupil") {
        vis.sizeScale.range([3,25]);
    }

    //create nodes
    vis.nodes = vis.displayData.map(function(d, index) {
        return {properties: d, radius: vis.sizeScale(d[vis.valueFactor]), index: index, clicked: false};
    });

    //order nodes around circle circumference
    vis.nodes = vis.nodes.map(function (d) {
        var coord = vis.circle(d)
        d.fx = coord[0];
        d.fy = coord[1];
        return d;
    });

    //filter out any nodes without values
    vis.nodes = vis.nodes.filter(function(d) {
        return !Number.isNaN(d.properties[vis.valueSuccess]);
    });

    //color scale utilizes d3 color-legend library https://github.com/susielu/d3-legend
    vis.colorLegend = d3.legendColor()
        .title("Percentages (%)")
        .labelFormat(".0r")
        .scale(vis.colorScale)
        .shapePadding(5)
        .shapeWidth(20)
        .shapeHeight(20)
        .labelOffset(12)
        .orient("horizontal");

    // Update the visualization
    vis.updateVis();
}


//update visualization
ForceMap.prototype.updateVis = function(){
    var vis = this;

    //set factor scale domain
    vis.factorScale.domain(d3.extent(vis.displayData, function (d) {
        return d[vis.valueFactor];
    }));

    //set color domain
    vis.colorScale.domain([0, d3.max(vis.displayData, function(d) { return d[vis.valueSuccess]; })]);

    // if not needed, allow force simulation to arrange nodes
    if (vis.index !== 3) {

        //disable fixed position
        vis.nodes = vis.nodes.map(function (d) {
            d.fx = null;
            d.fy = null;
            return d;
        });

    }

    //create simulation
    var simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(.5))
        .force("collide", d3.forceCollide().radius(function(d) { return d.radius; }))
        .force('center', d3.forceCenter(vis.svg.attr("width")/2, vis.svg.attr("height")/2))
        .on('tick', ticked);

    //start simulation
    function ticked() {
        simulation.nodes(vis.nodes);

        //create nodes
        var u = vis.svg
            .selectAll('circle')
            .data(vis.nodes);

        u.enter()
            .append('circle')
            .attr("class", "nodes")
            .attr("stroke", "black")
            .merge(u)
            .attr('r', function(d) {
                return d.radius;
            })
            .attr('cx', function(d) {
                return d.x
            })
            .attr('cy', function(d) {
                return d.y
            })
            //if the user searched for this node, highlight it
            .attr("fill", function(d) {
                if(vis.highlight === true) {
                    if(d.properties.District === vis.name) {
                        return "yellow";
                    }
                }

                return vis.colorScale(d.properties[vis.valueSuccess]);
            })
            .on('click', function(d) {

                if(vis.highlight === true) {
                    vis.highlight = false;
                }

                //if the node has not been clicked, move to scatter plot
                if (d.clicked === false) {
                    d.fx = vis.factorScale(d.properties[vis.valueFactor]) +
                        vis.svg.attr("width")/2 - vis.factorScale.range()[1]/2;
                    d.fy = vis.successScale(d.properties[vis.valueSuccess]) +
                        vis.svg.attr("width")/2 - vis.factorScale.range()[1]/2 - 30;
                    d.clicked = true;

                    //if the node has been clicked, move back into position
                } else {
                    var newpos = vis.circle(d);
                    d.fx = newpos[0];
                    d.fy = newpos[1];
                    d.clicked = false;
                }

                //update vis, to ensure positions stay set
                vis.updateVis();
            })
            .on('mouseover', vis.tip.show)
            .on('mouseout', vis.tip.hide);

        //call tool
        vis.svg.call(vis.tip);

        //update legend
        vis.svg.select(".legend")
            .call(vis.colorLegend);

        u.exit().remove()
    }

    //change between the scatter plot and the simulation
    d3.select("#change").on("click", function() {

        //set the correct index
        if (vis.index === 2) {
            vis.index = 3;

            vis.nodes = vis.nodes.map(function(d) {
                var newpos = vis.circle(d);
                d.fx = newpos[0];
                d.fy = newpos[1];
            });

            //set scatter plot to be visible
            vis.plot.attr("visibility", "visible");
        } else {
            vis.index = 2;

            vis.nodes = vis.nodes.map(function(d) {
                d.fx = null;
                d.fy = null;
            });

            //hide scatter plot
            vis.plot.attr("visibility", "hidden");
        }
        vis.wrangleData();
    })

}