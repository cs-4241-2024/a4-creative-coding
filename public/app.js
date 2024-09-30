fetch('https://raw.githubusercontent.com/Biuni/PokemonGO-Pokedex/master/pokedex.json')
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        const pokedex = data.pokemon;

        const nodes = pokedex.map(pokemon => ({
            id: pokemon.num,
            name: pokemon.name,
            type: pokemon.type[0],
        }));

        const links = [];
        pokedex.forEach(pokemon => {
            if (pokemon.next_evolution) {
                pokemon.next_evolution.forEach(evolution => {
                    links.push({
                        source: pokemon.num,
                        target: evolution.num,
                    });
                });
            }
        });

        pieChart(countByType(pokedex));
        scatterPlotMatrix(pokedex);
        forceDirectedGraph(nodes, links);

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
    const width = document.getElementById("pieChart").clientWidth;
    const height = document.getElementById("pieChart").clientHeight;

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

    document.getElementById('pieChart').innerHTML = '';
    document.getElementById('pieChart').appendChild(svg.node());

}

function forceDirectedGraph(nodes, links) {
    const width = 1500;
    const height = 750;

    const svg = d3.select("#forceGraph").append("svg")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(50))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(0.05))
        .force("y", d3.forceY(height / 2).strength(0.05));

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2);

    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 6)
        .attr("fill", "black")
        .call(drag(simulation));

    const label = svg.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("x", 12)
        .attr("y", 3)
        .attr("font-size", "10px")
        .attr("font-family", "Arial")
        .text(d => d.name);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    function drag(simulation) {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}

function scatterPlotMatrix(pokedex) {
    const stats = pokedex.map(pokemon => ({
        name: pokemon.name,
        height: parseFloat(pokemon.height.split(" ")[0]),
        weight: parseFloat(pokemon.weight.split(" ")[0]),
        spawnChance: pokemon.spawn_chance,
        avgSpawns: pokemon.avg_spawns
    }));

    const dimensions = [
        { name: "Height", key: "height" },
        { name: "Weight", key: "weight" },
        { name: "Spawn Chance", key: "spawnChance" },
        { name: "Average Spawns", key: "avgSpawns" }
    ];

    const scatterplotMatrix = d3.select("#scatterPlot").append("svg")
        .attr("width", document.getElementById("scatterPlot").clientWidth)
        .attr("height", document.getElementById("scatterPlot").clientHeight);

    const size = 100;
    const padding = 20;

    dimensions.forEach((dim1, i) => {
        dimensions.forEach((dim2, j) => {
            const g = scatterplotMatrix.append("g")
                .attr("transform", `translate(${j * (size + padding)}, ${i * (size + padding)})`);

            const x = d3.scaleLinear()
                .domain(d3.extent(stats, d => d[dim2.key])).nice()
                .range([0, size]);

            const y = d3.scaleLinear()
                .domain(d3.extent(stats, d => d[dim1.key])).nice()
                .range([size, 0]);

            g.append("g")
                .attr("transform", `translate(0, ${size})`)
                .call(d3.axisBottom(x));

            g.append("g")
                .call(d3.axisLeft(y));

            g.selectAll("circle")
                .data(stats)
                .enter().append("circle")
                .attr("cx", d => x(d[dim2.key]))
                .attr("cy", d => y(d[dim1.key]))
                .attr("r", 3)
                .attr("fill", "steelblue");
        });
    });
}