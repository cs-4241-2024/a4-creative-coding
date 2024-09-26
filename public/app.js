fetch('https://raw.githubusercontent.com/Biuni/PokemonGO-Pokedex/master/pokedex.json')
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        const pokedex = data.pokemon;
        pieChart(countByType(pokedex));

    })
    .catch(error => console.log(error));

function countByType(pokedex) {
    const typeCounts = {};

    pokedex.forEach(pokemon => {
        pokemon.type.forEach((type) => {
            if (typeCounts[type]) {
                typeCounts[type]++;
            } else {
                typeCounts[type] = 1;
            }
        })
    })

    return Object.keys(typeCounts).map(type => ({
        name: type,
        value: typeCounts[type]
    }));
}

function pieChart(data) {
    const width = 1500;
    const height = 750;

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());

    const pie = d3.pie()
        .sort(null)
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(Math.min(width, height) / 2 - 1);

    const labelRadius = arc.outerRadius()() * 0.8;

    const arcLabel = d3.arc()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

    const arcs = pie(data);

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
        .attr("border", "1px solid black");

    svg.append("g")
        .attr("stroke", "white")
        .selectAll()
        .data(arcs)
        .join("path")
        .attr("fill", d => color(d.data.name))
        .attr("d", arc)
        .append("title")
        .text(d => `${d.data.name}: ${d.data.value.toLocaleString("en-US")}`);

    svg.append("g")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(arcs)
        .join("text")
        .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("y", "-0.4em")
            .attr("font-weight", "bold")
            .text(d => d.data.name))
        .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25 || d.data.value > 0).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(d => d.data.value.toLocaleString("en-US")));

    document.getElementById('visualization').innerHTML = '';
    document.getElementById('visualization').appendChild(svg.node());

}

