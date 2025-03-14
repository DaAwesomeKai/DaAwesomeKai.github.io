// Price Elasticity of Demand graph
class ElasticityGraph {
    // Get the HTML for the parameter inputs
    static getParametersHTML() {
        return `
            <div class="parameter-group">
                <h3>Reference Point</h3>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Price:</span>
                        <span class="slider-value" id="priceValue">${CONFIG.defaults.elasticity.price}</span>
                    </div>
                    <input type="range" id="price" min="50" max="200" step="5" 
                           value="${CONFIG.defaults.elasticity.price}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Quantity:</span>
                        <span class="slider-value" id="quantityValue">${CONFIG.defaults.elasticity.quantity}</span>
                    </div>
                    <input type="range" id="quantity" min="50" max="200" step="5" 
                           value="${CONFIG.defaults.elasticity.quantity}">
                </div>
            </div>
            
            <div class="parameter-group">
                <h3>Elasticity Coefficients</h3>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Elastic Coefficient:</span>
                        <span class="slider-value" id="elasticCoefficientValue">${CONFIG.defaults.elasticity.elasticCoefficient}</span>
                    </div>
                    <input type="range" id="elasticCoefficient" min="-5" max="-1.1" step="0.1" 
                           value="${CONFIG.defaults.elasticity.elasticCoefficient}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Inelastic Coefficient:</span>
                        <span class="slider-value" id="inelasticCoefficientValue">${CONFIG.defaults.elasticity.inelasticCoefficient}</span>
                    </div>
                    <input type="range" id="inelasticCoefficient" min="-0.9" max="-0.1" step="0.1" 
                           value="${CONFIG.defaults.elasticity.inelasticCoefficient}">
                </div>
            </div>
        `;
    }
    
    // Get the HTML for the explanation
    static getExplanationHTML() {
        return `
            <h3>Price Elasticity of Demand</h3>
            <p>Price elasticity of demand measures how responsive quantity demanded is to a change in price. It's calculated as the percentage change in quantity demanded divided by the percentage change in price.</p>
            <p><strong>Elastic Demand (blue):</strong> When elasticity is greater than 1 in absolute value. A small change in price causes a large change in quantity demanded. This is typical for luxury goods or products with many substitutes.</p>
            <p><strong>Inelastic Demand (teal):</strong> When elasticity is less than 1 in absolute value. A large change in price causes only a small change in quantity demanded. This is typical for necessities or products with few substitutes.</p>
            <p>The graph shows how the same price change affects quantity differently depending on elasticity. Notice how a 10% price increase reduces quantity more significantly for elastic goods.</p>
        `;
    }
    
    // Draw the graph based on parameters
    static drawGraph(ctx, canvas, parameters) {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas and draw axes
        GraphUtils.clearCanvas(ctx, width, height);
        GraphUtils.drawAxes(ctx, width, height, 'Quantity', 'Price');
        
        // Calculate points for elastic demand curve
        const elasticSlope = parameters.elasticCoefficient * (parameters.price / parameters.quantity);
        const elasticIntercept = parameters.price - elasticSlope * parameters.quantity;
        const elasticDemandFn = q => elasticIntercept + elasticSlope * q;
        
        // Calculate points for inelastic demand curve
        const inelasticSlope = parameters.inelasticCoefficient * (parameters.price / parameters.quantity);
        const inelasticIntercept = parameters.price - inelasticSlope * parameters.quantity;
        const inelasticDemandFn = q => inelasticIntercept + inelasticSlope * q;
        
        // Draw elastic demand curve
        GraphUtils.drawCurve(ctx, elasticDemandFn, CONFIG.colors.elasticDemand);
        
        // Draw inelastic demand curve
        GraphUtils.drawCurve(ctx, inelasticDemandFn, CONFIG.colors.inelasticDemand);
        
        // Draw reference point
        GraphUtils.drawPoint(ctx, parameters.quantity, parameters.price, CONFIG.colors.equilibrium);
        GraphUtils.labelPoint(ctx, parameters.quantity, parameters.price, 
            `Reference Point (Q=${parameters.quantity}, P=${parameters.price})`, CONFIG.colors.equilibrium);
        
        // Calculate and draw price change effect (10% increase)
        const newPrice = parameters.price * 1.1;
        
        // Calculate new quantities
        const elasticQuantity = (newPrice - elasticIntercept) / elasticSlope;
        const inelasticQuantity = (newPrice - inelasticIntercept) / inelasticSlope;
        
        // Draw horizontal line for new price
        GraphUtils.drawHorizontalDashedLine(ctx, newPrice, CONFIG.colors.equilibrium);
        GraphUtils.labelPoint(ctx, 30, newPrice, `New Price: ${Math.round(newPrice)} (+10%)`, CONFIG.colors.equilibrium, true);
        
        // Draw vertical lines for new quantities
        GraphUtils.drawVerticalDashedLine(ctx, elasticQuantity, CONFIG.colors.elasticDemand);
        GraphUtils.drawVerticalDashedLine(ctx, inelasticQuantity, CONFIG.colors.inelasticDemand);
        
        // Label new quantities
        GraphUtils.labelPoint(ctx, elasticQuantity, newPrice - 20, 
            `Elastic: Q=${Math.round(elasticQuantity)} (${Math.round((elasticQuantity - parameters.quantity) / parameters.quantity * 100)}%)`, 
            CONFIG.colors.elasticDemand);
        
        GraphUtils.labelPoint(ctx, inelasticQuantity, newPrice + 20, 
            `Inelastic: Q=${Math.round(inelasticQuantity)} (${Math.round((inelasticQuantity - parameters.quantity) / parameters.quantity * 100)}%)`, 
            CONFIG.colors.inelasticDemand);
        
        return {
            referencePoint: { price: parameters.price, quantity: parameters.quantity },
            newPrice,
            elasticResult: { 
                coefficient: parameters.elasticCoefficient,
                newQuantity: elasticQuantity,
                percentChange: (elasticQuantity - parameters.quantity) / parameters.quantity * 100
            },
            inelasticResult: {
                coefficient: parameters.inelasticCoefficient,
                newQuantity: inelasticQuantity,
                percentChange: (inelasticQuantity - parameters.quantity) / parameters.quantity * 100
            },
            parameters
        };
    }
    
    // Initialize event listeners for this graph type
    static initEventListeners() {
        // Update value displays when sliders change
        document.getElementById('price').addEventListener('input', function() {
            document.getElementById('priceValue').textContent = this.value;
        });
        
        document.getElementById('quantity').addEventListener('input', function() {
            document.getElementById('quantityValue').textContent = this.value;
        });
        
        document.getElementById('elasticCoefficient').addEventListener('input', function() {
            document.getElementById('elasticCoefficientValue').textContent = this.value;
        });
        
        document.getElementById('inelasticCoefficient').addEventListener('input', function() {
            document.getElementById('inelasticCoefficientValue').textContent = this.value;
        });
    }
    
    // Get the current parameter values
    static getParameters() {
        return {
            price: parseFloat(document.getElementById('price').value),
            quantity: parseFloat(document.getElementById('quantity').value),
            elasticCoefficient: parseFloat(document.getElementById('elasticCoefficient').value),
            inelasticCoefficient: parseFloat(document.getElementById('inelasticCoefficient').value)
        };
    }
}
