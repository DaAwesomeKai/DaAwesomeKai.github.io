// Supply and Demand curve graph
class SupplyDemandGraph {
    // Get the HTML for the parameter inputs
    static getParametersHTML() {
        return `
            <div class="parameter-group">
                <h3>Demand Curve</h3>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Demand Intercept:</span>
                        <span class="slider-value" id="demandInterceptValue">${CONFIG.defaults.supplyDemand.demandIntercept}</span>
                    </div>
                    <input type="range" id="demandIntercept" min="50" max="400" step="10" 
                           value="${CONFIG.defaults.supplyDemand.demandIntercept}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Demand Slope:</span>
                        <span class="slider-value" id="demandSlopeValue">${CONFIG.defaults.supplyDemand.demandSlope}</span>
                    </div>
                    <input type="range" id="demandSlope" min="-3" max="-0.1" step="0.1" 
                           value="${CONFIG.defaults.supplyDemand.demandSlope}">
                </div>
            </div>
            
            <div class="parameter-group">
                <h3>Supply Curve</h3>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Supply Intercept:</span>
                        <span class="slider-value" id="supplyInterceptValue">${CONFIG.defaults.supplyDemand.supplyIntercept}</span>
                    </div>
                    <input type="range" id="supplyIntercept" min="0" max="200" step="10" 
                           value="${CONFIG.defaults.supplyDemand.supplyIntercept}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Supply Slope:</span>
                        <span class="slider-value" id="supplySlopeValue">${CONFIG.defaults.supplyDemand.supplySlope}</span>
                    </div>
                    <input type="range" id="supplySlope" min="0.1" max="3" step="0.1" 
                           value="${CONFIG.defaults.supplyDemand.supplySlope}">
                </div>
            </div>
        `;
    }
    
    // Get the HTML for the explanation
    static getExplanationHTML() {
        return `
            <h3>Supply and Demand</h3>
            <p>The supply and demand model is one of the most fundamental concepts in economics. It shows how prices and quantities are determined in a competitive market.</p>
            <p><strong>Demand Curve:</strong> Shows the relationship between price and quantity demanded. As price increases, quantity demanded decreases (law of demand).</p>
            <p><strong>Supply Curve:</strong> Shows the relationship between price and quantity supplied. As price increases, quantity supplied increases (law of supply).</p>
            <p><strong>Market Equilibrium:</strong> The intersection point of supply and demand curves represents the equilibrium price and quantity where the market clears.</p>
            <p>Adjust the parameters to see how changes in supply and demand affect the market equilibrium.</p>
        `;
    }
    
    // Draw the graph based on parameters
    static drawGraph(ctx, canvas, parameters) {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas and draw axes
        GraphUtils.clearCanvas(ctx, width, height);
        GraphUtils.drawAxes(ctx, width, height, 'Quantity', 'Price');
        
        // Define functions for demand and supply
        const demandFn = q => parameters.demandIntercept + parameters.demandSlope * q;
        const supplyFn = q => parameters.supplyIntercept + parameters.supplySlope * q;
        
        // Draw demand curve
        GraphUtils.drawCurve(ctx, demandFn, CONFIG.colors.demand);
        
        // Draw supply curve
        GraphUtils.drawCurve(ctx, supplyFn, CONFIG.colors.supply);
        
        // Calculate and draw equilibrium
        const equilibrium = GraphUtils.calculateEquilibrium(demandFn, supplyFn);
        GraphUtils.drawPoint(ctx, equilibrium.quantity, equilibrium.price, CONFIG.colors.equilibrium);
        
        // Draw dashed lines to axes
        GraphUtils.drawHorizontalDashedLine(ctx, equilibrium.price, CONFIG.colors.equilibrium);
        GraphUtils.drawVerticalDashedLine(ctx, equilibrium.quantity, CONFIG.colors.equilibrium);
        
        // Label equilibrium
        GraphUtils.labelPoint(ctx, equilibrium.quantity, equilibrium.price, 
            `Equilibrium (Q=${Math.round(equilibrium.quantity)}, P=${Math.round(equilibrium.price)})`, 
            CONFIG.colors.equilibrium);
        
        // Draw consumer and producer surplus
        const csPoints = [
            { q: 0, p: parameters.demandIntercept },
            { q: equilibrium.quantity, p: parameters.demandIntercept },
            { q: equilibrium.quantity, p: equilibrium.price }
        ];
        
        const psPoints = [
            { q: 0, p: parameters.supplyIntercept },
            { q: equilibrium.quantity, p: parameters.supplyIntercept },
            { q: equilibrium.quantity, p: equilibrium.price }
        ];
        
        GraphUtils.drawArea(ctx, csPoints, CONFIG.colors.consumerSurplus);
        GraphUtils.drawArea(ctx, psPoints, CONFIG.colors.producerSurplus);
        
        return {
            equilibrium,
            parameters
        };
    }
    
    // Initialize event listeners for this graph type
    static initEventListeners() {
        // Update value displays when sliders change
        document.getElementById('demandIntercept').addEventListener('input', function() {
            document.getElementById('demandInterceptValue').textContent = this.value;
        });
        
        document.getElementById('demandSlope').addEventListener('input', function() {
            document.getElementById('demandSlopeValue').textContent = this.value;
        });
        
        document.getElementById('supplyIntercept').addEventListener('input', function() {
            document.getElementById('supplyInterceptValue').textContent = this.value;
        });
        
        document.getElementById('supplySlope').addEventListener('input', function() {
            document.getElementById('supplySlopeValue').textContent = this.value;
        });
    }
    
    // Get the current parameter values
    static getParameters() {
        return {
            demandIntercept: parseFloat(document.getElementById('demandIntercept').value),
            demandSlope: parseFloat(document.getElementById('demandSlope').value),
            supplyIntercept: parseFloat(document.getElementById('supplyIntercept').value),
            supplySlope: parseFloat(document.getElementById('supplySlope').value)
        };
    }
}
