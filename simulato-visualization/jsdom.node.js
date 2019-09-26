
let jsdom = require('jsdom');

const { JSDOM } = jsdom;


const dom = new JSDOM("<html><body></body></html>",
    ['http://d3js.org/d3.v3.min.js'],
    {
        function(err, window) {
            var svg = window.d3.select("body")
                .append("svg")
                .attr("width", 100).attr("height", 100);

            svg.append("rect")
                .attr("x", 10)
                .attr("y", 10)
                .attr("width", 80)
                .attr("height", 80)
                .style("fill", "orange");

            // PRINT OUT:
            console.log(window.d3.select("body").html());
            //fs.writeFileSync('out.svg', window.d3.select("body").html()); // or this
        }
    });
