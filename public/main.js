
window.addEventListener( 'load', () => {
  const massButton = document.querySelector("#mass");
  massButton.onclick = massBars;

  const classButton = document.querySelector("#class");
  classButton.onclick = classBars;

  const yearButton = document.querySelector("#year");
  yearButton.onclick = yearBars;

  const yearMassButton = document.querySelector("#yearMass");
  yearMassButton.onclick = yearMassDot;

})

async function getData() {
  const url = "https://data.nasa.gov/resource/y77d-th95.json";
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json;

  } catch (error) {
    console.error(error.message);
  }
}

//code from D3 example for Horizontal Bar Chart, adapted to my dataset
const classBars = async function () {
  document.getElementById("information").innerHTML = "Here we show each meteorite 'class' and the number of meteorites classified as such."
  //clear out past charts if clicking again
  document.getElementById("container").innerHTML = ""

  const data = await getData();
  const rollupData = d3.rollup(data, v => v.length, d => d.recclass)

  let formattedArray = []
  rollupData.forEach((value, key) => {
    const jsonObject = { 'class': key, 'count': value }
    formattedArray.push(jsonObject)
  });

  const barHeight = 25;
  const marginTop = 30;
  const marginRight = 200;
  const marginBottom = 10;
  const marginLeft = 200;
  const width = 1500;
  const height = Math.ceil((formattedArray.length + 0.1) * barHeight) + marginTop + marginBottom;

  // Create the scales.
  const x = d3.scaleLinear()
      .domain([0, d3.max(formattedArray, d => d.count)])
      .range([marginLeft, width - marginRight]);
  
  const y = d3.scaleBand()
      .domain(d3.sort(formattedArray, d => -d.count).map(d => d.class))
      .rangeRound([marginTop, height - marginBottom])
      .padding(0.1);

  // Create a value format.
  const format = x.tickFormat(20);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
  
  // Append a rect for each letter.
  svg.append("g")
      .attr("fill", "#37505C")
    .selectAll()
    .data(formattedArray)
    .join("rect")
      .attr("x", x(0))
      .attr("y", (d) => y(d.class))
      .attr("width", (d) => x(d.count) - x(0))
      .attr("height", y.bandwidth());
  
  // Append a label for each letter.
  svg.append("g")
      .attr("fill", "white")
      .attr("text-anchor", "end")
    .selectAll()
    .data(formattedArray)
    .join("text")
      .attr("x", (d) => x(d.count))
      .attr("y", (d) => y(d.class) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("dx", -4)
      .text((d) => format(d.count))
    .call((text) => text.filter(d => x(d.count) - x(0) < 20) // short bars
      .attr("dx", +4)
      .attr("fill", "black")
      .attr("text-anchor", "start"));

  // Create the axes.
  svg.append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(d3.axisTop(x).ticks(width / 80))
      .call(g => g.select(".domain").remove());

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0));
  // // Return the SVG element.
  container.append(svg.node());
}


//code from D3 example for Horizontal Bar Chart, adapted to my dataset
const massBars = async function () {
  document.getElementById("information").innerHTML = "Here we show each meteorite by name and its recorded mass (presumably in grams)."
  //clear out past charts if clicking again
  document.getElementById("container").innerHTML = ""

  const data = await getData();
  const barHeight = 25;
  const marginTop = 30;
  const marginRight = 200;
  const marginBottom = 10;
  const marginLeft = 200;
  const width = 1500;
  const height = Math.ceil((data.length + 0.1) * barHeight) + marginTop + marginBottom;

  // Create the scales.
  //log for mass (so much variation)
  const x = d3.scaleLog([0.1, 40000000], [marginLeft, width - marginRight]);

  
  const y = d3.scaleBand()
      .domain(d3.sort(data, d => -d.mass).map(d => d.name))
      .rangeRound([marginTop, height - marginBottom])
      .padding(0.1);

  // Create a value format.
  const format = x.tickFormat(100);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
  
  // Append a rect for each letter.
  svg.append("g")
      .attr("fill", "#37505C")
    .selectAll()
    .data(data)
    .join("rect")
      .attr("x", x(0.1))
      .attr("y", (d) => y(d.name))
      .attr("width", (d) => x(d.mass) - x(0.1))
      .attr("height", y.bandwidth());
  
  // Append a label for each item.
  svg.append("g")
      .attr("fill", "white")
      .attr("text-anchor", "end")
    .selectAll()
    .data(data)
    .join("text")
      .attr("x", (d) => x(d.mass))
      .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("dx", -4)
      .text((d) => format(d.mass))
    .call((text) => text.filter(d => x(d.mass) - x(0.1) < 20) // short bars
      .attr("dx", +4)
      .attr("fill", "black")
      .attr("text-anchor", "start"));

  // Create the axes.
  svg.append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(d3.axisTop(x).ticks(width / 80))
      .call(g => g.select(".domain").remove());

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0));
  // // Return the SVG element.
  container.append(svg.node());
}

//code from D3 example for Horizontal Bar Chart, adapted to my dataset
const yearBars = async function () {
  document.getElementById("information").innerHTML = "Here we show each meteorite by name and its recorded year of impact."
  //clear out past charts if clicking again
  document.getElementById("container").innerHTML = ""

  let data = await getData();

  for (object of data) {
    try {
      object.year = (parseInt(object.year.substring(0,4)))
    }
    catch(err) {
      object.year = 0;
    }
    
  }


  const barHeight = 25;
  const marginTop = 30;
  const marginRight = 200;
  const marginBottom = 10;
  const marginLeft = 200;
  const width = 1500;
  const height = Math.ceil((data.length + 0.1) * barHeight) + marginTop + marginBottom;

  // Create the scales.
  //log for mass (so much variation)
  const x = d3.scaleLinear()
      .domain([800, d3.max(data, d => d.year)])
      .range([marginLeft, width - marginRight]);

  
  const y = d3.scaleBand()
      .domain(d3.sort(data, d => -d.year).map(d => d.name))
      .rangeRound([marginTop, height - marginBottom])
      .padding(0.1);

  // Create a value format.
  const format = x.tickFormat(20);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
  
  // Append a rect for each letter.
  svg.append("g")
      .attr("fill", "#37505C")
    .selectAll()
    .data(data)
    .join("rect")
      .attr("x", x(800))
      .attr("y", (d) => y(d.name))
      .attr("width", (d) => x(d.year) - x(800))
      .attr("height", y.bandwidth());
  
  // Append a label for each item.
  svg.append("g")
      .attr("fill", "white")
      .attr("text-anchor", "end")
    .selectAll()
    .data(data)
    .join("text")
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("dx", -4)
      .text((d) => format(d.year))
    .call((text) => text.filter(d => x(d.year) - x(800) < 20) // short bars
      .attr("dx", +4)
      .attr("fill", "black")
      .attr("text-anchor", "start"));

  // Create the axes.
  svg.append("g")
      .attr("transform", `translate(0,${marginTop})`)
      .call(d3.axisTop(x).ticks(width / 80))
      .call(g => g.select(".domain").remove());

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(0));
  // // Return the SVG element.
  container.append(svg.node());
}

//code from D3 example for Scatterplot, adapted to my dataset
const yearMassDot = async function () {
  document.getElementById("information").innerHTML = "Here we show each meteorite by mass and its recorded year of impact. Points below the x-axis did not have a reported mass"
  //clear out past charts if clicking again
  document.getElementById("container").innerHTML = ""

  let data = await getData();

  for (object of data) {
    try {
      object.year = (parseInt(object.year.substring(0,4)))
    }
    catch(err) {
      object.year = 0;
    }

    if(!object.hasOwnProperty('mass')) {
      //setting to 0 messes up the log
      object.mass = 0.1;
    }
  }

  // Specify the chart’s dimensions.
  const marginTop = 10;
  const marginRight = 200;
  const marginBottom = 40;
  const marginLeft = 200;
  const height = 500;
  const width = 1500;

  // Prepare the scales for positional encoding.
  const x = d3.scaleLinear()
      .domain([800, d3.max(data, d => d.year)])
      .range([marginLeft, width - marginRight]);

  const y = d3.scaleLog([0.1, 25000000], [height - marginTop, marginBottom]);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Create the axes.
  svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(d3.axisBottom(x).ticks(width / 80))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", width)
        .attr("y", marginBottom - 4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text("Year →"));

  svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Mass"));

  // Create the grid.
  svg.append("g")
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call(g => g.append("g")
      .selectAll("line")
      .data(x.ticks())
      .join("line")
        .attr("x1", d => 0.5 + x(d))
        .attr("x2", d => 0.5 + x(d))
        .attr("y1", marginTop)
        .attr("y2", height - marginBottom))
    .call(g => g.append("g")
      .selectAll("line")
      .data(y.ticks())
      .join("line")
        .attr("y1", d => 0.5 + y(d))
        .attr("y2", d => 0.5 + y(d))
        .attr("x1", marginLeft)
        .attr("x2", width - marginRight));

  // Add a layer of dots.
  svg.append("g")
      .attr("stroke", "#37505C")
      .attr("stroke-width", 1.5)
      .attr("fill", "none")
    .selectAll("circle")
    .data(data)
    .join("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.mass))
      .attr("r", 3);

  container.append(svg.node());
}