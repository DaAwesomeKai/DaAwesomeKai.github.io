// Subsidy vs Tariff comparison graph
class SubsidyTariffGraph {
    // Get the HTML for the parameter inputs
    static getParametersHTML() {
        return `
            <div class="parameter-group">
                <h3>Demand & Supply Parameters</h3>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Demand Intercept:</span>
                        <span class="slider-value" id="demandInterceptValue">${CONFIG.defaults.subsidyTariff.demandIntercept}</span>
                    </div>
                    <input type="range" id="demandIntercept" min="50" max="400" step="10" 
                           value="${CONFIG.defaults.subsidyTariff.demandIntercept}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Demand Slope:</span>
                        <span class="slider-value" id="demandSlopeValue">${CONFIG.defaults.subsidyTariff.demandSlope}</span>
                    </div>
                    <input type="range" id="demandSlope" min="-3" max="-0.1" step="0.1" 
                           value="${CONFIG.defaults.subsidyTariff.demandSlope}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Supply Intercept:</span>
                        <span class="slider-value" id="supplyInterceptValue">${CONFIG.defaults.subsidyTariff.supplyIntercept}</span>
                    </div>
                    <input type="range" id="supplyIntercept" min="0" max="200" step="10" 
                           value="${CONFIG.defaults.subsidyTariff.supplyIntercept}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Supply Slope:</span>
                        <span class="slider-value" id="supplySlopeValue">${CONFIG.defaults.subsidyTariff.supplySlope}</span>
                    </div>
                    <input type="range" id="supplySlope" min="0.1" max="3" step="0.1" 
                           value="${CONFIG.defaults.subsidyTariff.supplySlope}">
                </div>
            </div>
            
            <div class="parameter-group">
                <h3>Policy Parameters</h3>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Subsidy Amount:</span>
                        <span class="slider-value" id="subsidyAmountValue">${CONFIG.defaults.subsidyTariff.subsidyAmount}</span>
                    </div>
                    <input type="range" id="subsidyAmount" min="0" max="100" step="5" 
                           value="${CONFIG.defaults.subsidyTariff.subsidyAmount}">
                </div>
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Tariff Amount:</span>
                        <span class="slider-value" id="tariffAmountValue">${CONFIG.defaults.subsidyTariff.tariffAmount}</span>
                    </div>
                    <input type="range" id="tariffAmount" min="0" max="100" step="5" 
                           value="${CONFIG.defaults.subsidyTariff.tariffAmount}">
                </div>
            </div>
        `;
    }
    
    // Get the HTML for the explanation
    static getExplanationHTML() {
        return `
            <h3>Subsidy vs Tariff: Economic Impact Comparison</h3>
            <p><strong>Subsidy:</strong> A government payment to producers that shifts the supply curve downward/rightward. This results in lower market prices and higher quantity, benefiting consumers but potentially creating market inefficiencies.</p>
            <p><strong>Tariff:</strong> A tax on imports that shifts the supply curve upward/leftward. This increases market prices and reduces quantity, typically protecting domestic producers but hurting consumers and creating market inefficiencies.</p>
            <p>Use the sliders to adjust the subsidy or tariff amount and observe the changes in market equilibrium, prices, and welfare effects. Note that the deadweight loss (yellow shaded area) represents market inefficiency introduced by these policies.</p>
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
        
        // Draw demand curve
        GraphUtils.drawCurve(ctx, demandFn, CONFIG.colors.demand);
        
        // Draw original supply curve
        GraphUtils.drawCurve(ctx, supplyFn, CONFIG.colors.supply);
        
        // Draw original equilibrium point
        GraphUtils.drawPoint(ctx, originalEquilibrium.quantity, originalEquilibrium.price, CONFIG.colors.equilibrium);
        
        // Initialize result object
        const result = {
            originalEquilibrium,
            parameters
        };
        
        // Handle subsidy
        if (parameters.subsidyAmount > 0) {
            const subsidizedSupplyIntercept = parameters.supplyIntercept - parameters.subsidyAmount;
            const subsidizedSupplyFn = q => subsidizedSupplyIntercept + parameters.supplySlope * q;
            
            // Draw subsidized supply curve
            GraphUtils.drawCurve(ctx, subsidizedSupplyFn, CONFIG.colors.subsidizedSupply);
            
            // Calculate and draw new equilibrium
            const subsidizedEquilibrium = GraphUtils.calculateEquilibrium(demandFn, subsidizedSupplyFn);
            GraphUtils.drawPoint(ctx, subsidizedEquilibrium.quantity, subsidizedEquilibrium.price, CONFIG.colors.newEquilibrium);
            
            // Draw horizontal lines for consumer and producer prices
            GraphUtils.drawHorizontalDashedLine(ctx, subsidizedEquilibrium.price, CONFIG.colors.subsidizedSupply);
            
            // Producer price = consumer price + subsidy
            const producerPrice = subsidizedEquilibrium.price + parameters.subsidyAmount;
            GraphUtils.drawHorizontalDashedLine(ctx, producerPrice, CONFIG.colors.supply);
            
            // Draw vertical line for quantity
            GraphUtils.drawVerticalDashedLine(ctx, subsidizedEquilibrium.quantity, CONFIG.colors.newEquilibrium);
            
            // Label points
            GraphUtils.labelPoint(ctx, 30, subsidizedEquilibrium.price, 
                `Consumer Price: ${Math.round(subsidizedEquilibrium.price)}`, CONFIG.colors.subsidizedSupply, true);
            GraphUtils.labelPoint(ctx, 30, producerPrice, 
                `Producer Price: ${Math.round(producerPrice)}`, CONFIG.colors.supply, true);
            
            // Show deadweight loss (triangle between the two supply curves)
            const dwlPoints = [
                { q: originalEquilibrium.quantity, p: supplyFn(originalEquilibrium.quantity) },
                { q: subsidizedEquilibrium.quantity, p: supplyFn(subsidizedEquilibrium.quantity) },
                { q: subsidizedEquilibrium.quantity, p: subsidizedSupplyFn(subsidizedEquilibrium.quantity) }
            ];
            
            GraphUtils.drawArea(ctx, dwlPoints, CONFIG.colors.deadweightLoss, CONFIG.colors.deadweightLossBorder);
            
            // Add subsidy info to result
            result.subsidizedEquilibrium = subsidizedEquilibrium;
            result.producerPrice = producerPrice;
            result.totalSubsidyCost = parameters.subsidyAmount * subsidizedEquilibrium.quantity;
        }
        
        // Handle tariff
        if (parameters.tariffAmount > 0) {
            const tariffedSupplyIntercept = parameters.supplyIntercept + parameters.tariffAmount;
            const tariffedSupplyFn = q => tariffedSupplyIntercept + parameters.supplySlope * q;
            
            // Draw tariffed supply curve
            GraphUtils.drawCurve(ctx, tariffedSupplyFn, CONFIG.colors.tariffedSupply);
            
            // Calculate and draw new equilibrium
            const tariffedEquilibrium = GraphUtils.calculateEquilibrium(demandFn, tariffedSupplyFn);
            GraphUtils.drawPoint(ctx, tariffedEquilibrium.quantity, tariffedEquilibrium.price, CONFIG.colors.newEquilibrium);
            
            // Draw horizontal lines for consumer and producer prices
            GraphUtils.drawHorizontalDashedLine(ctx, tariffedEquilibrium.price, CONFIG.colors.tariffedSupply);
            
            // Producer price = consumer price - tariff
            const producerPrice = tariffedEquilibrium.price - parameters.tariffAmount;
            GraphUtils.drawHorizontalDashedLine(ctx, producerPrice, CONFIG.colors.supply);
            
            // Draw vertical line for quantity
            GraphUtils.drawVerticalDashedLine(ctx, tariffedEquilibrium.quantity, CONFIG.colors.newEquilibrium);
            
            // Label points
            GraphUtils.labelPoint(ctx, 30, tariffedEquilibrium.price, 
                `Consumer Price: ${Math.round(tariffedEquilibrium.price)}`, CONFIG.colors.tariffedSupply, true);
            GraphUtils.labelPoint(ctx, 30, producerPrice, 
                `Producer Price: ${Math.round(producerPrice)}`, CONFIG.colors.supply, true);
            
            // Show deadweight loss
            const dwlPoints = [
                { q: tariffedEquilibrium.quantity, p: tariffedSupplyFn(tariffedEquilibrium.quantity) },
                { q: originalEquilibrium.quantity, p: tariffedSupplyFn(originalEquilibrium.quantity) },
                { q: originalEquilibrium.quantity, p: supplyFn(originalEquilibrium.quantity) }
            ];
            
            GraphUtils.drawArea(ctx, dwlPoints, CONFIG.colors.deadweightLoss, CONFIG.colors.deadweightLossBorder);
            
            // Add tariff info to result
            result.tariffedEquilibrium = tariffedEquilibrium;
            result.producerPrice = producerPrice;
            result.totalTariffRevenue = parameters.tariffAmount * tariffedEquilibrium.quantity;
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
        
        document.getElementById('subsidyAmount').addEventListener('input', function() {
            document.getElementById('subsidyAmountValue').textContent = this.value;
        });
        
        document.getElementById('tariffAmount').addEventListener('input', function() {
            document.getElementById('tariffAmountValue').textContent = this.value;
        });
    }
    
    // Get the current parameter values
    static getParameters() {
        return {
            demandIntercept: parseFloat(document.getElementById('demandIntercept').value),
            demandSlope: parseFloat(document.getElementById('demandSlope').value),
            supplyIntercept: parseFloat(document.getElementById('supplyIntercept').value),
            supplySlope: parseFloat(document.getElementById('supplySlope').value),
            subsidyAmount: parseFloat(document.getElementById('subsidyAmount').value),
            tariffAmount: parseFloat(document.getElementById('tariffAmount').value)
        };
    }
}
