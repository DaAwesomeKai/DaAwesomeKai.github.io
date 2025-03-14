// Tax incidence graph
class TaxIncidenceGraph {
    // Get the HTML for the parameter inputs
    static getParametersHTML() {
        return `
            <div class="parameter-group">
                <h3>Market Parameters</h3>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Demand Intercept:</span>
                        <span class="slider-value" id="demandInterceptValue">${CONFIG.defaults.taxIncidence.demandIntercept}</span>
                    </div>
                    <input type="range" id="demandIntercept" min="50" max="400" step="10" 
                           value="${CONFIG.defaults.taxIncidence.demandIntercept}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Demand Slope:</span>
                        <span class="slider-value" id="demandSlopeValue">${CONFIG.defaults.taxIncidence.demandSlope}</span>
                    </div>
                    <input type="range" id="demandSlope" min="-3" max="-0.1" step="0.1" 
                           value="${CONFIG.defaults.taxIncidence.demandSlope}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Supply Intercept:</span>
                        <span class="slider-value" id="supplyInterceptValue">${CONFIG.defaults.taxIncidence.supplyIntercept}</span>
                    </div>
                    <input type="range" id="supplyIntercept" min="0" max="200" step="10" 
                           value="${CONFIG.defaults.taxIncidence.supplyIntercept}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Supply Slope:</span>
                        <span class="slider-value" id="supplySlopeValue">${CONFIG.defaults.taxIncidence.supplySlope}</span>
                    </div>
                    <input type="range" id="supplySlope" min="0.1" max="3" step="0.1" 
                           value="${CONFIG.defaults.taxIncidence.supplySlope}">
                </div>
            </div>
            
            <div class="parameter-group">
                <h3>Tax Parameters</h3>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Tax Amount:</span>
                        <span class="slider-value" id="taxAmountValue">${CONFIG.defaults.taxIncidence.taxAmount}</span>
                    </div>
                    <input type="range" id="taxAmount" min="0" max="100" step="5" 
                           value="${CONFIG.defaults.taxIncidence.taxAmount}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Elasticity Ratio (Es/Ed):</span>
                        <span class="slider-value" id="elasticityRatioValue">${CONFIG.defaults.taxIncidence.elasticityRatio}</span>
                    </div>
                    <input type="range" id="elasticityRatio" min="0.1" max="2" step="0.1" 
                           value="${CONFIG.defaults.taxIncidence.elasticityRatio}">
                </div>
            </div>
        `;
    }
    
    // Get the HTML for the explanation
    static getExplanationHTML() {
        return `
            <h3>Tax Incidence: Who Bears the Tax Burden?</h3>
            <p>Tax incidence refers to who ultimately bears the burden of a tax, regardless of who the tax is levied upon. It depends on the relative price elasticities of supply and demand.</p>
            <p><strong>Key Insights:</strong></p>
            <ul>
                <li>When demand is more elastic than supply, producers bear most of the tax burden.</li>
                <li>When supply is more elastic than demand, consumers bear most of the tax burden.</li>
                <li>The more inelastic a party is, the more tax burden they bear (they have less ability to change behavior).</li>
            </ul>
            <p>The green area represents the tax burden on consumers (difference between pre-tax and post-tax price). The blue area represents the tax burden on producers (difference between post-tax price received by producers and pre-tax price).</p>
            <p>Adjust the elasticity ratio slider to see how the distribution of tax burden changes.</p>
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
        
        // Calculate original equilibrium
        const originalEquilibrium = GraphUtils.calculateEquilibrium(demandFn, supplyFn);
        
        // Draw original supply and demand curves
        GraphUtils.drawCurve(ctx, demandFn, CONFIG.colors.demand);
        GraphUtils.drawCurve(ctx, supplyFn, CONFIG.colors.supply);
        
        // Draw original equilibrium point
        GraphUtils.drawPoint(ctx, originalEquilibrium.quantity, originalEquilibrium.price, CONFIG.colors.equilibrium);
        
        // Initialize result object
        const result = {
            originalEquilibrium,
            parameters
        };
        
        // Handle tax
        if (parameters.taxAmount > 0) {
            // Define function for supply curve with tax
            const taxedSupplyFn = q => supplyFn(q) + parameters.taxAmount;
            
            // Draw taxed supply curve
            GraphUtils.drawCurve(ctx, taxedSupplyFn, CONFIG.colors.tariffedSupply);
            
            // Calculate new equilibrium
            const taxedEquilibrium = GraphUtils.calculateEquilibrium(demandFn, taxedSupplyFn);
            
            // Draw new equilibrium point
            GraphUtils.drawPoint(ctx, taxedEquilibrium.quantity, taxedEquilibrium.price, CONFIG.colors.newEquilibrium);
            
            // Calculate producer price
            const producerPrice = taxedEquilibrium.price - parameters.taxAmount;
            
            // Draw horizontal lines for consumer and producer prices
            GraphUtils.drawHorizontalDashedLine(ctx, taxedEquilibrium.price, CONFIG.colors.tariffedSupply);
            GraphUtils.drawHorizontalDashedLine(ctx, producerPrice, CONFIG.colors.supply);
            GraphUtils.drawHorizontalDashedLine(ctx, originalEquilibrium.price, CONFIG.colors.equilibrium);
            
            // Draw vertical line for quantity
            GraphUtils.drawVerticalDashedLine(ctx, taxedEquilibrium.quantity, CONFIG.colors.newEquilibrium);
            
            // Label points
            GraphUtils.labelPoint(ctx, 30, taxedEquilibrium.price, 
                `Consumer Price: ${Math.round(taxedEquilibrium.price)}`, CONFIG.colors.tariffedSupply, true);
            GraphUtils.labelPoint(ctx, 30, producerPrice, 
                `Producer Price: ${Math.round(producerPrice)}`, CONFIG.colors.supply, true);
            GraphUtils.labelPoint(ctx, 30, originalEquilibrium.price, 
                `Original Price: ${Math.round(originalEquilibrium.price)}`, CONFIG.colors.equilibrium, true);
            
            // Calculate tax burden
            const consumerBurden = taxedEquilibrium.price - originalEquilibrium.price;
            const producerBurden = originalEquilibrium.price - producerPrice;
            
            // Calculate tax revenue
            const taxRevenue = parameters.taxAmount * taxedEquilibrium.quantity;
            
            // Show consumer and producer tax burden areas
            // Consumer burden area
            const consumerBurdenPoints = [
                { q: 0, p: originalEquilibrium.price },
                { q: taxedEquilibrium.quantity, p: originalEquilibrium.price },
                { q: taxedEquilibrium.quantity, p: taxedEquilibrium.price },
                { q: 0, p: taxedEquilibrium.price }
            ];
            
            // Producer burden area
            const producerBurdenPoints = [
                { q: 0, p: producerPrice },
                { q: taxedEquilibrium.quantity, p: producerPrice },
                { q: taxedEquilibrium.quantity, p: originalEquilibrium.price },
                { q: 0, p: originalEquilibrium.price }
            ];
            
            GraphUtils.drawArea(ctx, consumerBurdenPoints, CONFIG.colors.consumerSurplus);
            GraphUtils.drawArea(ctx, producerBurdenPoints, CONFIG.colors.producerSurplus);
            
            // Show deadweight loss
            const dwlPoints = [
                { q: taxedEquilibrium.quantity, p: taxedEquilibrium.price },
                { q: originalEquilibrium.quantity, p: originalEquilibrium.price },
                { q: taxedEquilibrium.quantity, p: producerPrice }
            ];
            
            GraphUtils.drawArea(ctx, dwlPoints, CONFIG.colors.deadweightLoss, CONFIG.colors.deadweightLossBorder);
            
            // Add tax info to result
            result.taxedEquilibrium = taxedEquilibrium;
            result.producerPrice = producerPrice;
            result.consumerBurden = consumerBurden;
            result.producerBurden = producerBurden;
            result.consumerShare = (consumerBurden / parameters.taxAmount) * 100;
            result.producerShare = (producerBurden / parameters.taxAmount) * 100;
            result.taxRevenue = taxRevenue;
            result.deadweightLoss = (originalEquilibrium.quantity - taxedEquilibrium.quantity) * parameters.taxAmount / 2;
        }
        
        return result;
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
        
        document.getElementById('taxAmount').addEventListener('input', function() {
            document.getElementById('taxAmountValue').textContent = this.value;
        });
        
        document.getElementById('elasticityRatio').addEventListener('input', function() {
            document.getElementById('elasticityRatioValue').textContent = this.value;
            
            // Adjust slopes based on elasticity ratio while maintaining equilibrium
            const ratio = parseFloat(this.value);
            const demandSlope = parseFloat(document.getElementById('demandSlope').value);
            
            // Calculate new supply slope based on elasticity ratio
            // Elasticity ratio = (supply elasticity / demand elasticity) = (demand slope / supply slope)
            const newSupplySlope = Math.abs(demandSlope) / ratio;
            
            // Update supply slope (capped at max 3.0)
            const cappedValue = Math.min(newSupplySlope, 3.0);
            document.getElementById('supplySlope').value = cappedValue.toFixed(1);
            document.getElementById('supplySlopeValue').textContent = cappedValue.toFixed(1);
        });
    }
    
    // Get the current parameter values
    static getParameters() {
        return {
            demandIntercept: parseFloat(document.getElementById('demandIntercept').value),
            demandSlope: parseFloat(document.getElementById('demandSlope').value),
            supplyIntercept: parseFloat(document.getElementById('supplyIntercept').value),
            supplySlope: parseFloat(document.getElementById('supplySlope').value),
            taxAmount: parseFloat(document.getElementById('taxAmount').value),
            elasticityRatio: parseFloat(document.getElementById('elasticityRatio').value)
        };
    }
}
