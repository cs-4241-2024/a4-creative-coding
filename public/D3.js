document.addEventListener("DOMContentLoaded", () => {
  const svg = d3.select("svg");
  const radarSvg = d3.select("#radar-chart");
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const radarWidth = +radarSvg.attr("width");
  const radarHeight = +radarSvg.attr("height");
  const margin = { top: 100, right: 50, bottom: 200, left: 80 };
  const radarMargin = { top: 60, right: 30, bottom: 60, left: 30 };

  const typeSelect = document.getElementById("type-select");
  const minHeightInput = document.getElementById("min-height");
  const maxHeightInput = document.getElementById("max-height");
  const minWeightInput = document.getElementById("min-weight");
  const maxWeightInput = document.getElementById("max-weight");
  const weaknessSlider = document.getElementById("weakness-slider");
  const candySlider = document.getElementById("candy-slider");
  const resetButton = document.getElementById("reset-button");

  // Display elements for current slider values
  const weaknessValue = document.createElement("span");
  weaknessValue.textContent = weaknessSlider.value;
  weaknessSlider.insertAdjacentElement("afterend", weaknessValue);

  const candyValue = document.createElement("span");
  candyValue.textContent = candySlider.value;
  candySlider.insertAdjacentElement("afterend", candyValue);

  // Create a tooltip div (initially hidden)
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("padding", "10px")
    .style("background", "#f4f4f4")
    .style("border", "1px solid #333")
    .style("border-radius", "5px")
    .style("visibility", "hidden");

  // Helper function to extract numeric value from string
  function extractNumber(str) {
    const match = str.match(/[\d.]+/); // Match digits and decimal points
    return match ? parseFloat(match[0]) : null;
  }

  // Fetch the Pokémon data
  fetch(
    "https://raw.githubusercontent.com/Biuni/PokemonGO-Pokedex/master/pokedex.json"
  )
    .then((response) => response.json())
    .then((data) => {
      const pokemonData = data.pokemon.map((p) => {
        return {
          ...p,
          height: extractNumber(p.height), // Convert height string to number
          weight: extractNumber(p.weight), // Convert weight string to number
        };
      });

      // Get all unique Pokémon types
      const types = [...new Set(pokemonData.flatMap((p) => p.type))];

      // Populate the dropdown with Pokémon types
      types.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.text = type;
        typeSelect.add(option);
      });

      // Render the initial bar chart and stacked weakness chart with all Pokémon
      renderCandyChart(pokemonData);
      renderStackedWeaknessChart(pokemonData);

      // Add event listener for type filter
      typeSelect.addEventListener("change", function () {
        const selectedType = this.value;
        const filteredData =
          selectedType === "all"
            ? pokemonData
            : pokemonData.filter((p) => p.type.includes(selectedType));

        // Re-render both charts with the filtered data
        renderCandyChart(filteredData);
        renderStackedWeaknessChart(filteredData);
      });

      // Event listeners for height/weight range inputs
      [minHeightInput, maxHeightInput, minWeightInput, maxWeightInput].forEach(
        (input) => {
          input.addEventListener("input", () => {
            adjustVisualization(pokemonData);
          });
        }
      );

      weaknessSlider.addEventListener("input", () => {
        weaknessValue.textContent = weaknessSlider.value; // Update weakness value display
        const weaknessThreshold = +weaknessSlider.value;
        const filteredData = pokemonData.filter(
          (p) => p.weaknesses.length <= weaknessThreshold
        );
        renderCandyChart(filteredData);
        renderStackedWeaknessChart(filteredData);
      });

      candySlider.addEventListener("input", () => {
        candyValue.textContent = candySlider.value; // Update candy value display
        const candyThreshold = +candySlider.value;
        const filteredData = pokemonData.filter(
          (p) => p.candy_count <= candyThreshold
        );
        renderCandyChart(filteredData);
        renderStackedWeaknessChart(filteredData);
      });

      // Reset Button functionality
      resetButton.addEventListener("click", () => {
        typeSelect.value = "all";
        minHeightInput.value = "";
        maxHeightInput.value = "";
        minWeightInput.value = "";
        maxWeightInput.value = "";
        weaknessSlider.value = 10;
        candySlider.value = 50;

        // Reset displayed values next to sliders
        weaknessValue.textContent = weaknessSlider.value;
        candyValue.textContent = candySlider.value;

        // Reset the charts with full data
        renderCandyChart(pokemonData);
        renderStackedWeaknessChart(pokemonData);
      });
    });

  // Function to render the Candy Count Bar Chart
  function renderCandyChart(data) {
    svg.selectAll("*").remove();

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => +d.candy_count || 0)])
      .range([height - margin.bottom, margin.top]);

    // Append axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Append bars
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.name))
      .attr("y", (d) => yScale(+d.candy_count || 0))
      .attr("width", xScale.bandwidth())
      .attr(
        "height",
        (d) => height - margin.bottom - yScale(+d.candy_count || 0)
      )
      .attr("fill", "steelblue");

    // Add title
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("font-size", "24px")
      .text("Pokémon Candy Count Bar Chart");
  }

  // Function to render the Stacked Weakness Bar Chart
  function renderStackedWeaknessChart(data) {
    svg.selectAll("*").remove();

    // Define color scale (17 colors for distinct weaknesses)
    const weaknessColors = d3.scaleOrdinal([
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf",
      "#393b79",
      "#637939",
      "#8c6d31",
      "#843c39",
      "#7b4173",
      "#ad494a",
      "#6b6ecf",
    ]);

    const allWeaknesses = [...new Set(data.flatMap((d) => d.weaknesses))];

    const stack = d3
      .stack()
      .keys(allWeaknesses)
      .value((d, key) => (d.weaknesses.includes(key) ? 1 : 0));

    const stackedData = stack(data);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(stackedData[stackedData.length - 1], (d) => d[1])])
      .range([height - margin.bottom, margin.top]);

    // Append axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Append stacked bars
    svg
      .selectAll("g.layer")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("fill", (d) => weaknessColors(d.key))
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.data.name))
      .attr("y", (d) => yScale(d[1]))
      .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth());

    // Add title
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("font-size", "24px")
      .text("Pokémon Weaknesses Stacked Bar Chart");

    // Add legend for the weakness colors
    const legend = svg
      .selectAll(".legend")
      .data(allWeaknesses)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        (d, i) =>
          `translate(${(i % 5) * 120}, ${
            height - margin.bottom + 50 + Math.floor(i / 5) * 30
          })`
      );

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", (d) => weaknessColors(d));

    legend
      .append("text")
      .attr("x", 30)
      .attr("y", 15)
      .text((d) => d);
  }

  // Function to adjust the visualization based on height/weight ranges
  function adjustVisualization(data) {
    const minHeight = +minHeightInput.value || 0;
    const maxHeight = +maxHeightInput.value || Infinity;
    const minWeight = +minWeightInput.value || 0;
    const maxWeight = +maxWeightInput.value || Infinity;

    // Filter data based on height and weight ranges
    const filteredData = data.filter(
      (p) =>
        +p.height >= minHeight &&
        +p.height <= maxHeight &&
        +p.weight >= minWeight &&
        +p.weight <= maxWeight
    );

    // Re-render both charts with the filtered data
    renderCandyChart(filteredData);
    renderStackedWeaknessChart(filteredData);
  }

  const pokemonSelect1 = document.getElementById("pokemon-select-1");
  const pokemonSelect2 = document.getElementById("pokemon-select-2");
  let allPokemons = []; // Store Pokémon data globally
  let allWeaknesses = [];

  // Fetch Pokémon data
  fetch(
    "https://raw.githubusercontent.com/Biuni/PokemonGO-Pokedex/master/pokedex.json"
  )
    .then((response) => response.json())
    .then((data) => {
      const pokemonData = data.pokemon.map((p) => ({
        name: p.name,
        weaknesses: p.weaknesses,
        height: extractNumber(p.height),
        weight: extractNumber(p.weight),
        candy_count: p.candy_count || 0,
      }));

      allPokemons = pokemonData;
      allWeaknesses = [...new Set(pokemonData.flatMap((d) => d.weaknesses))]; // Get all unique weaknesses

      // Populate Pokémon dropdowns for radar chart comparison
      populatePokemonSelect(pokemonData);

      // Render radar chart fields for all weaknesses upfront
      renderRadarChartFields();
    });

  // Populate Pokémon select dropdown for radar chart
  function populatePokemonSelect(pokemonData) {
    pokemonData.forEach((pokemon) => {
      const option1 = document.createElement("option");
      option1.value = pokemon.name;
      option1.textContent = pokemon.name;
      pokemonSelect1.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = pokemon.name;
      option2.textContent = pokemon.name;
      pokemonSelect2.appendChild(option2);
    });

    pokemonSelect1.addEventListener("change", updateRadarChart);
    pokemonSelect2.addEventListener("change", updateRadarChart);
  }

  // Function to update the radar chart based on selected Pokémon
  function updateRadarChart() {
    const selectedPokemon1 = pokemonSelect1.value;
    const selectedPokemon2 = pokemonSelect2.value;

    const selectedPokemons = allPokemons.filter(
      (pokemon) =>
        pokemon.name === selectedPokemon1 || pokemon.name === selectedPokemon2
    );

    // Highlight the weaknesses for the selected Pokémon
    highlightWeaknesses(selectedPokemons);
  }

  // Render radar chart fields (all weaknesses axes) upfront
  function renderRadarChartFields() {
    const radius = Math.min(radarWidth, radarHeight) / 2 - margin.top;
    const centerX = radarWidth / 2;
    const centerY = radarHeight / 2;
    const angleSlice = (Math.PI * 2) / allWeaknesses.length;
    const rScale = d3.scaleLinear().domain([0, 1]).range([0, radius]);

    const gridG = radarSvg
      .append("g")
      .attr("transform", `translate(${centerX},${centerY})`);

    // Render circular grid levels
    const gridLevels = 5;
    for (let i = 0; i <= gridLevels; i++) {
      const levelFactor = (i / gridLevels) * radius;
      gridG
        .append("circle")
        .attr("r", levelFactor)
        .attr("fill", "none")
        .attr("stroke", "#CDCDCD")
        .attr("stroke-width", "0.5px");
    }

    // Render the axes for each weakness
    const axis = gridG
      .selectAll(".axis")
      .data(allWeaknesses)
      .enter()
      .append("g")
      .attr("class", "axis");

    axis
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => rScale(1) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d, i) => rScale(1) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("stroke", "#CDCDCD")
      .attr("stroke-width", "1px");

    axis
      .append("text")
      .attr("x", (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text((d) => d);
  }

  // Function to highlight the weaknesses of selected Pokémon
  function highlightWeaknesses(data) {
    radarSvg.selectAll(".highlighted").remove(); // Remove any previously highlighted areas

    const radius = Math.min(radarWidth, radarHeight) / 2 - margin.top;
    const centerX = radarWidth / 2;
    const centerY = radarHeight / 2;
    const angleSlice = (Math.PI * 2) / allWeaknesses.length;
    const rScale = d3.scaleLinear().domain([0, 1]).range([0, radius]);

    const radarLine = d3
      .lineRadial()
      .radius((d) => rScale(d.value))
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    const gridG = radarSvg
      .append("g")
      .attr("class", "highlighted")
      .attr("transform", `translate(${centerX},${centerY})`);

    const radarData = data.map((pokemon) => {
      return allWeaknesses.map((weakness) => ({
        axis: weakness,
        value: pokemon.weaknesses.includes(weakness) ? 1 : 0,
      }));
    });

    radarData.forEach((pokemonData, i) => {
      const radarGroup = gridG.append("g");

      const color = i === 0 ? "steelblue" : "orange"; // Assign different colors

      radarGroup
        .append("path")
        .datum(pokemonData)
        .attr("d", radarLine)
        .attr("fill", color)
        .attr("fill-opacity", 0.5)
        .attr("stroke", color)
        .attr("stroke-width", "2px");

      radarGroup
        .selectAll("circle")
        .data(pokemonData)
        .enter()
        .append("circle")
        .attr("r", 4)
        .attr(
          "cx",
          (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2)
        )
        .attr(
          "cy",
          (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2)
        )
        .attr("fill", color);
    });

    radarSvg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", radarWidth / 2)
      .attr("y", margin.top / 2)
      .attr("font-size", "24px")
      .text("Pokémon Weakness Radar Chart");
  }

  // Helper function to extract number from string
  function extractNumber(str) {
    const match = str.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }
});
