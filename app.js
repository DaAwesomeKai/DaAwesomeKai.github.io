// Main application script
document.addEventListener('DOMContentLoaded', function() {
    // Get main DOM elements
    const graphType = document.getElementById('graphType');
    const parametersPanel = document.getElementById('parameters-panel');
    const graphExplanation = document.getElementById('graph-explanation');
    const generateBtn = document.getElementById('generateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Get canvas and modal elements
    const { canvas, ctx } = GraphUtils.initCanvas('graphCanvas');
    const exportModal = document.getElementById('exportModal');
    const closeModalBtn = document.querySelector('.close');
    const downloadPNGBtn = document.getElementById('downloadPNG');
    const downloadCSVBtn = document.getElementById('downloadCSV');
    const copyCodeBtn = document.getElementById('copyCode');
    const embedCodeText = document.getElementById('embedCodeText');
    
    // Initialize graph type mapping
    const graphTypes = {
        'supply-demand': SupplyDemandGraph,
        'subsidy-tariff': SubsidyTariffGraph,
        'elasticity': ElasticityGraph,
        'monopoly': MonopolyGraph,
        'tax-incidence': TaxIncidenceGraph
    };
    
    // Current graph data
    let currentGraphData = null;
    
    // Initialize the app with the default graph type
    initializeGraphType(graphType.value);
    
    // Set up event listeners
    graphType.addEventListener('change', function() {
        initializeGraphType(this.value);
    });
    
    generateBtn.addEventListener('click', generateGraph);
    
    resetBtn.addEventListener('click', function() {
        initializeGraphType(graphType.value);
    });
    
    saveBtn.addEventListener('click', function() {
        if (currentGraphData) {
            showExportModal();
        } else {
            alert('Please generate a graph first.');
        }
    });
    
    // Modal event listeners
    closeModalBtn.addEventListener('click', function() {
        exportModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === exportModal) {
            exportModal.style.display = 'none';
        }
    });
    
    downloadPNGBtn.addEventListener('click', function() {
        GraphUtils.exportAsPNG(canvas);
    });
    
    downloadCSVBtn.addEventListener('click', function() {
        exportAsCSV();
    });
    
    copyCodeBtn.addEventListener('click', function() {
        const embedCode = embedCodeText.textContent;
        navigator.clipboard.writeText(embedCode)
            .then(() => {
                alert('Embed code copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy embed code. Please select and copy manually.');
            });
    });
    
    // Function to initialize a graph type
    function initializeGraphType(type) {
        const GraphClass = graphTypes[type];
        
        // Set parameters HTML
        parametersPanel.innerHTML = GraphClass.getParametersHTML();
        
        // Set explanation HTML
        graphExplanation.innerHTML = GraphClass.getExplanationHTML();
        
        // Initialize any event listeners
        if (typeof GraphClass.initEventListeners === 'function') {
            GraphClass.initEventListeners();
        }
        
        // Generate initial graph
        generateGraph();
    }
    
    // Function to generate the graph
    function generateGraph() {
        const GraphClass = graphTypes[graphType.value];
        const parameters = GraphClass.getParameters();
        
        // Draw the graph
        currentGraphData = GraphClass.drawGraph(ctx, canvas, parameters);
    }
    
    // Function to show export modal
    function showExportModal() {
        // Generate embed code
        const embedCode = GraphUtils.generateEmbedCode(canvas, currentGraphData);
        embedCodeText.textContent = embedCode;
        
        // Show modal
        exportModal.style.display = 'block';
    }
    
    // Function to export data as CSV
    function exportAsCSV() {
        if (!currentGraphData) return;
        
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        // Add header row
        csvContent += 'Parameter,Value\n';
        
        // Add parameters
        for (const [key, value] of Object.entries(currentGraphData.parameters)) {
            csvContent += `${key},${value}\n`;
        }
        
        // Add results (if available)
        if (currentGraphData.equilibrium) {
            csvContent += `equilibrium_price,${currentGraphData.equilibrium.price}\n`;
            csvContent += `equilibrium_quantity,${currentGraphData.equilibrium.quantity}\n`;
        }
        
        if (currentGraphData.originalEquilibrium) {
            csvContent += `original_price,${currentGraphData.originalEquilibrium.price}\n`;
            csvContent += `original_quantity,${currentGraphData.originalEquilibrium.quantity}\n`;
        }
        
        if (currentGraphData.subsidizedEquilibrium) {
            csvContent += `subsidized_price,${currentGraphData.subsidizedEquilibrium.price}\n`;
            csvContent += `subsidized_quantity,${currentGraphData.subsidizedEquilibrium.quantity}\n`;
            csvContent += `total_subsidy_cost,${currentGraphData.totalSubsidyCost}\n`;
        }
        
        if (currentGraphData.tariffedEquilibrium) {
            csvContent += `tariffed_price,${currentGraphData.tariffedEquilibrium.price}\n`;
            csvContent += `tariffed_quantity,${currentGraphData.tariffedEquilibrium.quantity}\n`;
            csvContent += `total_tariff_revenue,${currentGraphData.totalTariffRevenue}\n`;
        }
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'economic_graph_data.csv');
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
    }
});
