// Utility functions for drawing graphs

class GraphUtils {
    // Initialize the canvas and context
    static initCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        return { canvas, ctx };
    }
    
    // Clear the canvas
    static clearCanvas(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
    }
    
    // Draw graph axes with labels
    static drawAxes(ctx, width, height, xLabel = 'Quantity', yLabel = 'Price') {
        const padding = CONFIG.graph.padding;
        
        // Set up scale transformation functions
        ctx.scale = function(value, isPrice) {
            if (isPrice) {
                return height - padding - (value / CONFIG.graph.maxPrice) * (height - 2 * padding);
            } else {
                return padding + (value / CONFIG.graph.maxQuantity) * (width - 2 * padding);
            }
        };
        
        // Draw grid if enabled
        if (CONFIG.graph.gridLines) {
            // Vertical grid lines
            for (let i = 0; i <= 5; i++) {
                const x = padding + i * ((width - 2 * padding) / 5);
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, height - padding);
                ctx.strokeStyle = CONFIG.colors.grid;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // Horizontal grid lines
            for (let i = 0; i <= 5; i++) {
                const y = padding + i * ((height - 2 * padding) / 5);
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.strokeStyle = CONFIG.colors.grid;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.strokeStyle = CONFIG.colors.axis;
        ctx.lineWidth = CONFIG.graph.axisWidth;
        ctx.stroke();
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Y-axis label
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = '14px Arial';
        ctx.fillStyle = CONFIG.colors.axis;
        ctx.fillText(yLabel, 0, 0);
        ctx.restore();
        
        // X-axis label
        ctx.textAlign = 'center';
        ctx.font = '14px Arial';
        ctx.fillStyle = CONFIG.colors.axis;
        ctx.fillText(xLabel, width / 2, height - 10);
        
        // Y-axis ticks and labels
        for (let i = 0; i <= 5; i++) {
            const price = i * (CONFIG.graph.maxPrice / 5);
            const y = ctx.scale(price, true);
            
            ctx.beginPath();
            ctx.moveTo(padding - 5, y);
            ctx.lineTo(padding, y);
            ctx.stroke();
            
            ctx.textAlign = 'right';
            ctx.fillText(Math.round(price), padding - 8, y + 4);
        }
        
        // X-axis ticks and labels
        for (let i = 0; i <= 5; i++) {
            const quantity = i * (CONFIG.graph.maxQuantity / 5);
            const x = ctx.scale(quantity, false);
            
            ctx.beginPath();
            ctx.moveTo(x, height - padding);
            ctx.lineTo(x, height - padding + 5);
            ctx.stroke();
            
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(quantity), x, height - padding + 18);
        }
    }
    
    // Draw a curve given a function that returns price for a given quantity
    static drawCurve(ctx, priceFn, color, lineWidth = CONFIG.graph.lineWidth) {
        ctx.beginPath();
        
        for (let q = 0; q <= CONFIG.graph.maxQuantity; q += 2) {
            const price = priceFn(q);
            
            // Only draw if price is within bounds
            if (price >= 0 && price <= CONFIG.graph.maxPrice) {
                const x = ctx.scale(q, false);
                const y = ctx.scale(price, true);
                
                if (q === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
    
    // Draw a point at a specific quantity and price
    static drawPoint(ctx, quantity, price, color, radius = CONFIG.graph.pointRadius) {
        const x = ctx.scale(quantity, false);
        const y = ctx.scale(price, true);
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }
    
    // Draw a horizontal dashed line
    static drawHorizontalDashedLine(ctx, price, color, width = 1) {
        const y = ctx.scale(price, true);
        const canvasWidth = ctx.canvas.width;
        const padding = CONFIG.graph.padding;
        
        ctx.beginPath();
        ctx.setLineDash([5, 3]);
        ctx.moveTo(padding, y);
        ctx.lineTo(canvasWidth - padding, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw a vertical dashed line
    static drawVerticalDashedLine(ctx, quantity, color, width = 1) {
        const x = ctx.scale(quantity, false);
        const canvasHeight = ctx.canvas.height;
        const padding = CONFIG.graph.padding;
        
        ctx.beginPath();
        ctx.setLineDash([5, 3]);
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvasHeight - padding);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Add a label at a specific point
    static labelPoint(ctx, x, y, text, color, isScaled = false) {
        if (!isScaled) {
            x = ctx.scale(x, false);
            y = ctx.scale(y, true);
        }
        
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.font = '12px Arial';
        ctx.fillText(text, x + 10, y - 10);
    }
    
    // Draw and fill an area to represent deadweight loss, surplus, etc.
    static drawArea(ctx, points, fillColor, borderColor = null) {
        if (points.length < 3) return;
        
        ctx.beginPath();
        ctx.moveTo(ctx.scale(points[0].q, false), ctx.scale(points[0].p, true));
        
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(ctx.scale(points[i].q, false), ctx.scale(points[i].p, true));
        }
        
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
        
        if (borderColor) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    
    // Calculate market equilibrium given demand and supply functions
    static calculateEquilibrium(demandFn, supplyFn, maxIterations = 100) {
        let low = 0;
        let high = CONFIG.graph.maxQuantity;
        let quantity, demandPrice, supplyPrice;
        
        for (let i = 0; i < maxIterations; i++) {
            quantity = (low + high) / 2;
            demandPrice = demandFn(quantity);
            supplyPrice = supplyFn(quantity);
            
            if (Math.abs(demandPrice - supplyPrice) < 0.01) {
                return { quantity, price: demandPrice };
            }
            
            if (demandPrice > supplyPrice) {
                low = quantity;
            } else {
                high = quantity;
            }
        }
        
        // If we exit the loop, return our best approximation
        return { quantity, price: (demandPrice + supplyPrice) / 2 };
    }
    
    // Export the canvas as PNG
    static exportAsPNG(canvas) {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'economic-graph.png';
        link.href = dataURL;
        link.click();
    }
    
    // Generate embed code for the graph
    static generateEmbedCode(canvas, parameters) {
        const dataURL = canvas.toDataURL('image/png');
        const paramString = JSON.stringify(parameters);
        
        return `<div class="economic-graph-embed">
  <img src="${dataURL}" alt="Economic Graph" style="max-width: 100%; height: auto;" />
  <div class="graph-data" style="display:none;">${paramString}</div>
</div>`;
    }
}
