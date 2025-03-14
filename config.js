// Configuration for graph parameters and settings
const CONFIG = {
    // Graph dimensions and scaling
    graph: {
        padding: 40,
        axisWidth: 2,
        lineWidth: 2,
        pointRadius: 5,
        maxPrice: 300,
        maxQuantity: 200,
        gridLines: true
    },
    
    // Colors for different graph elements
    colors: {
        demand: '#3498db',
        supply: '#e74c3c',
        subsidizedSupply: '#2ecc71',
        tariffedSupply: '#9b59b6',
        equilibrium: '#000000',
        newEquilibrium: '#f39c12',
        deadweightLoss: 'rgba(243, 156, 18, 0.3)',
        deadweightLossBorder: '#f39c12',
        grid: '#eeeeee',
        axis: '#666666',
        elasticDemand: '#2980b9',
        inelasticDemand: '#1abc9c',
        monopolyMC: '#e67e22',
        monopolyMR: '#9b59b6',
        monopolyAC: '#3498db',
        consumerSurplus: 'rgba(46, 204, 113, 0.3)',
        producerSurplus: 'rgba(52, 152, 219, 0.3)',
        governmentRevenue: 'rgba(155, 89, 182, 0.3)'
    },
    
    // Default parameters for each graph type
    defaults: {
        supplyDemand: {
            demandIntercept: 250,
            demandSlope: -1.5,
            supplyIntercept: 50,
            supplySlope: 1.0
        },
        subsidyTariff: {
            demandIntercept: 250,
            demandSlope: -1.5,
            supplyIntercept: 50,
            supplySlope: 1.0,
            subsidyAmount: 0,
            tariffAmount: 0
        },
        elasticity: {
            price: 100,
            quantity: 100,
            elasticCoefficient: -2.0,
            inelasticCoefficient: -0.5
        },
        monopoly: {
            demandIntercept: 200,
            demandSlope: -0.5,
            fixedCost: 1000,
            marginalCost: 50
        },
        taxIncidence: {
            demandIntercept: 250,
            demandSlope: -1.5,
            supplyIntercept: 50,
            supplySlope: 0.8,
            taxAmount: 0,
            elasticityRatio: 0.5 // Ratio of supply to demand elasticity
        }
    }
};
