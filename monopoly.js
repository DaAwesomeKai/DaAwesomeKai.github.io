// Monopoly pricing graph
class MonopolyGraph {
    // Get the HTML for the parameter inputs
    static getParametersHTML() {
        return `
            <div class="parameter-group">
                <h3>Demand Parameters</h3>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Demand Intercept:</span>
                        <span class="slider-value" id="demandInterceptValue">${CONFIG.defaults.monopoly.demandIntercept}</span>
                    </div>
                    <input type="range" id="demandIntercept" min="100" max="300" step="10" 
                           value="${CONFIG.defaults.monopoly.demandIntercept}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Demand Slope:</span>
                        <span class="slider-value" id="demandSlopeValue">${CONFIG.defaults.monopoly.demandSlope}</span>
                    </div>
                    <input type="range" id="demandSlope" min="-2" max="-0.1" step="0.1" 
                           value="${CONFIG.defaults.monopoly.demandSlope}">
                </div>
            </div>
            
            <div class="parameter-group">
                <h3>Cost Parameters</h3>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Fixed Cost:</span>
                        <span class="slider-value" id="fixedCostValue">${CONFIG.defaults.monopoly.fixedCost}</span>
                    </div>
                    <input type="range" id="fixedCost" min="0" max="3000" step="100" 
                           value="${CONFIG.defaults.monopoly.fixedCost}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Marginal Cost:</span>
                        <span class="slider-value" id="marginalCostValue">${CONFIG.defaults.monopoly.marginalCost}</span>
                    </div>
                    <input type="range" id="marginalCost" min="0" max="150" step="5" 
                           value="${CONFIG.defaults.monopoly.marginalCost}">
                </div>
            </div>
        `;
    }
    
    // Get the HTML for the explanation
    static getExplanationHTML() {
        return `
            <h3>Monopoly Pricing and Output</h3>
            <p>A monopoly is a market structure with a single seller who faces the entire market demand curve. Unlike competitive firms, monopolies can influence market price by changing their output level.</p>
            <p><strong>Profit Maximization:</strong> Monopolies maximize profit by producing where Marginal Revenue (MR) equals Marginal Cost (MC).</p>
            <p><strong>Pricing:</strong> At the profit-maximizing quantity, the monopolist charges the price given by the demand curve.</p>
            <p><strong>Deadweight Loss:</strong> The shaded area represents the deadweight loss - the loss in economic efficiency due to monopoly pricing. In perfect competition, production would occur where price equals marginal cost.</p>
            <p>Adjust the parameters to see how changes in demand and cost structures affect monopoly pricing and deadweight loss.</p>
        `;
    }
    
    // Draw the graph based on parameters
    static drawGraph(ctx, canvas, parameters) {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas and draw axes
        GraphUtils.clearCanvas(ctx, width, height);
        GraphUtils.drawAxes(ctx, width, height, 'Quantity', 'Price/Cost');
        
        // Define demand function
        const demandFn = q => parameters.demandIntercept + parameters.demandSlope * q;
        
        // Define marginal revenue function (for linear demand, MR has twice the slope of demand)
        const mrFn = q => parameters.demandIntercept + 2 * parameters.demandSlope * q;
        
        // Define marginal cost function (constant)
        const mcFn = q => parameters.marginalCost;
        
        // Define average cost function
        const acFn = q => parameters.marginalCost + (parameters.fixedCost / q);
        
        // Draw demand curve
        GraphUtils.drawCurve(ctx, demandFn, CONFIG.colors.demand);
        
        // Draw marginal revenue curve
        GraphUtils.drawCurve(ctx, mrFn, CONFIG.colors.monopolyMR);
        
        // Draw marginal cost curve
        GraphUtils.drawCurve(ctx, mcFn, CONFIG.colors.monopolyMC);
        
        // Draw average cost curve (with domain restriction to avoid division by zero)
        GraphUtils.drawCurve(ctx, function(q) { 
            return q < 1 ? CONFIG.graph.maxPrice : acFn(q); 
        }, CONFIG.colors.monopolyAC);
        
        // Calculate monopoly quantity (where MR = MC)
        const monopolyQuantity = (parameters.demandIntercept - parameters.marginalCost) / (-2 * parameters.demandSlope);
        const monopolyPrice = demandFn(monopolyQuantity);
        
        // Calculate competitive quantity (where P = MC)
        const competitiveQuantity = (parameters.demandIntercept - parameters.marginalCost) / (-parameters.demandSlope);
        
        // Draw monopoly quantity and price point
        GraphUtils.drawPoint(ctx, monopolyQuantity, monopolyPrice, CONFIG.colors.equilibrium);
        
        // Draw dashed lines to axes
        GraphUtils.drawHorizontalDashedLine(ctx, monopolyPrice, CONFIG.colors.equilibrium);
        GraphUtils.drawVerticalDashedLine(ctx, monopolyQuantity, CONFIG.colors.equilibrium);
        
        // Draw intersection of MR and MC
        GraphUtils.drawPoint(ctx, monopolyQuantity, parameters.marginalCost, CONFIG.colors.monopolyMR);
        
        // Label points
        GraphUtils.labelPoint(ctx, monopolyQuantity, monopolyPrice, 
            `Monopoly Price: ${Math.round(monopolyPrice)}`, CONFIG.colors.equilibrium);
        
        GraphUtils.labelPoint(ctx, monopolyQuantity, parameters.marginalCost - 10, 
            `MC = MR at Q = ${Math.round(monopolyQuantity)}`, CONFIG.colors.monopolyMR);
        
        // Draw deadweight loss triangle
        const dwlPoints = [
            { q: monopolyQuantity, p: monopolyPrice },
            { q: monopolyQuantity, p: parameters.marginalCost },
            { q: competitiveQuantity, p: parameters.marginalCost }
        ];
        
        GraphUtils.drawArea(ctx, dwlPoints, CONFIG.colors.deadweightLoss, CONFIG.colors.deadweightLossBorder);
        
        // Calculate profit
        const totalRevenue = monopolyPrice * monopolyQuantity;
        const totalCost = parameters.fixedCost + parameters.marginalCost * monopolyQuantity;
        const profit = totalRevenue - totalCost;
        
        return {
            monopolyQuantity,
            monopolyPrice,
            competitiveQuantity,
            competitivePrice: parameters.marginalCost,
            profit,
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
        
        document.getElementById('fixedCost').addEventListener('input', function() {
            document.getElementById('fixedCostValue').textContent = this.value;
        });
        
        document.getElementById('marginalCost').addEventListener('input', function() {
            document.getElementById('marginalCostValue').textContent = this.value;
        });
    }
    
    // Get the current parameter values
    static getParameters() {
        return {
            demandIntercept: parseFloat(document.getElementById('demandIntercept').value),
            demandSlope: parseFloat(document.getElementById('demandSlope').value),
            fixedCost: parseFloat(document.getElementById('fixedCost').value),
            marginalCost: parseFloat(document.getElementById('marginalCost').value)
        };
    }
}
