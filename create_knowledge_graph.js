let knowledgeGraphJson = { entities: [], relations: [] };
let cy;

const displayError = (msg) => {
  document.getElementById("error").textContent = msg;
};

function uploadData() {
  const fileInput = document.getElementById("dataFile");
  const file = fileInput.files[0];
  if (!file) return displayError("No file selected.");

  displayError("Processing file...");

  const filename = file.name.toLowerCase();
  let parsePromise = null;

  if (filename.endsWith(".sif")) {
    parsePromise = parseSIFStream(file);
  } else if (filename.endsWith(".json")) {
    parsePromise = file.text().then((text) => {
      const data = JSON.parse(text);
      return data.elements?.nodes ? parseJsonStream(data) : data;
    });
  } else if (filename.endsWith(".csv")) {
    parsePromise = parseCSVStream(file);
  } else {
    return displayError(
      "Unsupported file format. Supported formats: CSV, SIF, Cytoscape.js JSON"
    );
  }

  parsePromise
    .then((parsedData) => {
      knowledgeGraphJson = parsedData;
      displayError("");
      renderFullGraph();
    })
    .catch((error) => displayError(`Error processing file: ${error.message}`));
}

const parseCSVStream = (file) => {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new Promise((resolve, reject) => {
    const entitiesSet = new Set();
    const relations = [];

    const processChunk = ({ done, value }) => {
      if (done) {
        const entities = Array.from(entitiesSet).map((title) => ({ title }));
        resolve({ entities, relations });
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split("\n");

      buffer = lines.pop();

      lines.forEach((line) => {
        if (!line.trim()) return;
        const tokens = line.split(",").map((token) => token.trim());
        if (tokens.length < 2) return;

        const [source, target, relationType = ""] = tokens;
        entitiesSet.add(source);
        entitiesSet.add(target);
        relations.push({ source, target, type: relationType });
      });

      reader.read().then(processChunk).catch(reject);
    };

    reader.read().then(processChunk).catch(reject);
  });
};

const parseSIFStream = (file) => {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new Promise((resolve, reject) => {
    const entitiesSet = new Set();
    const relations = [];

    const processChunk = ({ done, value }) => {
      if (done) {
        const entities = Array.from(entitiesSet).map((title) => ({ title }));
        resolve({ entities, relations });
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split("\n");

      buffer = lines.pop();

      lines.forEach((line) => {
        if (!line.trim() || line.startsWith("#")) return;
        const tokens = line.split(/\s+/).filter(Boolean);

        if (tokens.length === 1) {
          entitiesSet.add(tokens[0]);
        } else if (tokens.length >= 3) {
          const [source, relationType, ...targets] = tokens;
          entitiesSet.add(source);
          targets.forEach((target) => {
            entitiesSet.add(target);
            relations.push({ source, target, type: relationType });
          });
        }
      });

      reader.read().then(processChunk).catch(reject);
    };

    reader.read().then(processChunk).catch(reject);
  });
};

const parseJsonStream = (cyJson) => {
  const entities = (cyJson.elements?.nodes || []).map((node) => ({
    title: node.data.id,
  }));
  const relations = (cyJson.elements?.edges || []).map((edge) => ({
    source: edge.data.source,
    target: edge.data.target,
    type: edge.data.label || "",
  }));
  return { entities, relations };
};

function renderFullGraph() {
  if (
    !knowledgeGraphJson.entities.length ||
    !knowledgeGraphJson.relations.length
  )
    return displayError("Invalid data format. No entities or relations found.");

  const nodes = knowledgeGraphJson.entities.map((entity) => ({
    data: { id: entity.title },
  }));
  const edges = knowledgeGraphJson.relations.map((relation) => ({
    data: {
      id: `edge-${relation.source}-${relation.target}`,
      source: relation.source,
      target: relation.target,
      label: relation.type || "",
    },
  }));

  renderGraph(nodes, edges);
}

function querySubgraph() {
  if (!knowledgeGraphJson.entities.length)
    return displayError("Please upload data first.");

  const inputStr = document.getElementById("queryInput").value.trim();
  if (!inputStr) return displayError("Please enter node names.");

  displayError("");

  const queryNodes = inputStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!queryNodes.length) return alert("Please enter valid node names.");

  const subgraphNodes = new Set(queryNodes);
  const edges = [];

  knowledgeGraphJson.relations.forEach((relation) => {
    if (
      queryNodes.includes(relation.source) ||
      queryNodes.includes(relation.target)
    ) {
      subgraphNodes.add(relation.source);
      subgraphNodes.add(relation.target);
      edges.push({
        data: {
          id: `edge-${relation.source}-${relation.target}`,
          source: relation.source,
          target: relation.target,
          label: relation.type || "",
        },
      });
    }
  });

  const nodes = knowledgeGraphJson.entities
    .filter((entity) => subgraphNodes.has(entity.title))
    .map((entity) => ({ data: { id: entity.title } }));

  renderGraph(nodes, edges);
}

function renderGraph(nodes, edges) {
  document.getElementById("cy").innerHTML = "";
  cy = cytoscape({
    container: document.getElementById("cy"),
    elements: { nodes, edges },
    style: [
      {
        selector: "node",
        style: {
          "text-valign": "center",
          label: "data(id)",
          width: 100,
          height: 100,
        },
      },
      {
        selector: "edge",
        style: {
          width: 5,
          "line-color": "grey",
          "target-arrow-shape": "triangle",
          label: "data(label)",
        },
      },
    ],
  });
  const layoutOption = document.getElementById("layoutSelect").value;

  cy.layout({ name: layoutOption }).run();
}

function applyLayout() {
  if (!cy) return alert("Graph is not loaded yet.");
  const layoutOption = document.getElementById("layoutSelect").value;
  cy.layout({ name: layoutOption }).run();
}

window.uploadData = uploadData;
window.querySubgraph = querySubgraph;
window.applyLayout = applyLayout;