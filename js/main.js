//load data
var stickPersonVis;

d3.csv("data/data.csv", function(data) {
    data.forEach(function(d) {
        d.econ_disadvantaged = +d.econ_disadvantaged;
        d.percent_white = +d.percent_white;
        d.percent_non_white = 1-d.percent_white;
        d.percent_black = +d.percent_black;
        d.percent_hispanic = +d.percent_hispanic;
        d.meets_expectations_ELA = +d.meets_expectations_ELA;
        d.meets_expectations_math = +d.meets_expectations_math;
        d.percent_grads_attending_college = +d.percent_grads_attending_college;
        d.avg_SAT_score = +d.avg_SAT_score;
        d.percent_graduating_4_yrs = +d.percent_graduating_4_yrs;
        d.FTE_teachers_per_100_students = +d.FTE_teachers_per_100_students;
        d.avg_teacher_salary = +d.avg_teacher_salary;
        d.teacher_retention = +d.teacher_retention;
        d.dollars_per_student = +d.dollars_per_student;
        d.ch_70_aid_per_student = +d.ch_70_aid_per_student;
        d.enrolled = +d.enrolled;
    });

    stickPersonVis = new StickPersonVis(data, "#stick-person-div");
});


// Use the Queue.js library to read two files
queue()
    .defer(d3.csv, "data/district profiles.csv")
    .defer(d3.csv, "data/demographics.csv")
    .await(loadData);

//global data variable
var allData = [];

// global visualization variable
var forceMap;

//force diagram svg
var forceWidth = 650;
var forceHeight = 650;

var forceSvg = d3.select("#force-map").append("svg")
    .attr("width", forceWidth)
    .attr("height", forceHeight);


//get updated
d3.select("#selection").on("change", updateVisualization);
d3.select("#selection2").on("change", updateVisualization);

function loadData(error, data1, data2) {

    //prepare data
    allData = data1.map(function(d) {
        d.Org_Code = parseInt(d.Org_Code.replace(/,/g, ""));
        d.Enrolled = parseInt(d.Enrolled.replace(/,/g, ""));
        d.Econ_disadv = parseInt(d.Econ_disadv.replace(/,/g, ""));
        d.Students_with_disabilities = parseInt(d.Students_with_disabilities.replace(/,/g, ""));
        d.English_learners = parseInt(d.English_learners.replace(/,/g, ""));
        d.Five_Yr_change_in_enroll = parseInt(d.Five_Yr_change_in_enroll.replace(/,/g, ""));
        d.Ten_Yr_change_in_enroll = parseInt(d.Ten_Yr_change_in_enroll.replace(/,/g, ""));
        d.Student_mobility = parseInt(d.Student_mobility.replace(/,/g, ""));
        d.Choice_in_percent_of_enrolled = parseInt(d.Choice_in_percent_of_enrolled.replace(/,/g, ""));
        d.ELA_meet_exceed_expectations = parseInt(d.ELA_meet_exceed_expectations.replace(/,/g, ""));
        d.Math_meet_exceed_expectations = parseInt(d.Math_meet_exceed_expectations.replace(/,/g, ""));
        d.ELA_student_growth_percentile = parseInt(d.ELA_student_growth_percentile.replace(/,/g, ""));
        d.Math_student_growth_percentile = parseInt(d.Math_student_growth_percentile.replace(/,/g, ""));
        d.FTE_tchrs_per_100_students = parseInt(d.FTE_tchrs_per_100_students.replace(/,/g, ""));
        d.Av_tchr_salary = parseInt(d.Av_tchr_salary.replace(/,/g, ""));
        d.Teacher_retention = parseInt(d.Teacher_retention.replace(/,/g, ""));
        d.Funds_per_indistrict_pupil = parseInt(d.Funds_per_indistrict_pupil.replace(/,/g, ""));
        d.Foundation_enroll = parseInt(d.Foundation_enroll.replace(/,/g, ""));
        d.Above_Below_req_net_school_spending = parseInt(d.Above_Below_req_net_school_spending.replace(/,/g, ""));
        d.Ch_70_aid_per_pupil = parseInt(d.Ch_70_aid_per_pupil.replace(/,/g, ""));
        d.Combined_effort_yield_as_percent_of_foundation_budget =
            parseInt(d.Combined_effort_yield_as_percent_of_foundation_budget.replace(/,/g, ""));
        return d;
    });

    //create visualization
    createVis();
}

function createVis() {

    //create object
    forceMap = new ForceMap(forceSvg, allData);
}

function updateVisualization() {

    //update vis
    forceMap.wrangleData();

}