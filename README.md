# Knowledge Graph Visualization

This project enables users to visualize knowledge graphs using **Cytoscape.js**. Users can upload data files in **SIF** or **Cytoscape JSON** formats, parse the data, and render graphs with interactive filtering and querying capabilities.

## Folder Structure
```
.vscode/                     # VS Code configuration files
app.py                       # Python backend script to serve the project
create_knowledge_graph.js    # JavaScript script for processing and rendering the knowledge graph
data.json                    # Sample data file for visualization
index.html                   # Main HTML file for UI rendering
README.md                    # Project documentation (this file)
soc-sign-bitcoinalpha.csv    # Example dataset
```

## Features
- Upload SIF or JSON files to create a knowledge graph.
- Parse and extract entities and relations from the uploaded files.
- Visualize the graph using **Cytoscape.js**.
- Filter nodes and display first-degree connections.
- Adjust the layout dynamically.

## Setup & Installation
### Prerequisites
- Python 3.x installed
- A web browser (Chrome, Firefox, etc.)

### Installation Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/Rajshah1302/knowledge_graph_cytoscape-main.git
   cd knowledge_graph_cytoscape
   ```
2. Start the Python server:
   ```sh
   python ./app.py
   ```
3. Open **index.html** in a browser or navigate to `http://localhost:5000` (if running a Flask server).

## Usage
- Click **Upload Data** and select a SIF/JSON/CSV file.
- View the generated graph.
- Use the filtering options to explore relationships.
- Change graph layouts dynamically.

## Technologies Used
- **Python** (Backend API using Flask)
- **Cytoscape.js** (Graph visualization)
- **HTML, CSS, JavaScript** (Frontend UI)



