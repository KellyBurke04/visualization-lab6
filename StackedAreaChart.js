export function StackedAreaChart(container) {
	
    const margin = ({top: 20, right: 20, bottom: 40, left: 50});
    const width = 650 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    var svg = d3.selectAll(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleTime()
        .range([0,width])
    
    var yScale = d3.scaleLinear()
        .range([height,0])
    
    var typeScale = d3.scaleOrdinal()
        .range(d3.schemeTableau10);
    

    //create the axes
    var xAxis = d3.axisBottom()
        .scale(xScale);
    
    var yAxis = d3.axisLeft()
        .scale(yScale);

    var xAxisDisplay = svg.append("g")
        .attr('class', 'axis x-axis');

    var yAxisDisplay = svg.append('g')
        .attr('class', 'axis y-axis');

    const tooltip = svg
        .append("text")
        .attr('x', 0)
        .attr('y', -10)
        .attr('font-size', 10);
    
    var clip = svg.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);
  
    let selected=null, xDomain, data;

    function inrange(d){
        return d.data.date.getTime() >= xScale.domain()[0].getTime() && d.data.date.getTime() <= xScale.domain()[1].getTime()
    };

	function update(_data){
        data = _data;

        var keys = selected? [selected] : data.columns.slice(1);
        var stack = d3.stack()
            .keys(keys)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        var series = stack(data);
        typeScale.domain(keys);

        xScale.domain(xDomain? xDomain: [d3.min(data, d=>d.date), d3.max(data,d=>d.date)]);
        yScale.domain([0, d3.max(series, 
            a => d3.max(a, d=>d[1])) 
        ]);

        const area = d3.area()
            .x(d=>xScale(d.data.date))
            .y0(d=>yScale(d[0]))
            .y1(d=>yScale(d[1]));
        
        const areas = svg.selectAll(".area")
            .data(series, d => d.key);
        
        areas.enter()
            .append("path")
            .attr("clip-path", "url(#chart-area)")
            .attr("class", "area")
            .attr("id", function(d) { return "myArea " + d.key })
            .style("fill", function(d) { return typeScale(d.key); })
            .on("mouseover", (event, d, i) => tooltip.text(d.key))
            .on("mouseout", (event, d, i) => tooltip.text(''))
            .on("click", (event, d) => {
                if (selected === d.key) {
                selected = null;
                } else {
                    selected = d.key;
                }
                update(data); 
            })
            .merge(areas)
            .attr("d", area);
        
        areas.exit().remove();
        
        xAxisDisplay
            .call(xAxis)
            .attr("transform", `translate(0, ${h})`);

        yAxisDisplay
            .call(yAxis);
    }
    function filterByDate(range){
		xDomain = range;
		update(data);
    }
    
	return {
        update,
        filterByDate
	}
};