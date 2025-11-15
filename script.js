class currencyConverter {
    constructor() {
        this.apiConfig = {
            provider : 'exchangerate-api',
            apiKey: 'abc3f87a4b796521b5be04f6',
            cacheDuration: 10*60*1000, 
            maxRetries: 2
        };

        this.apiEndpoints = {
            'exchangerate-api': 'https://v6.exchangerate-api.com/v6/'
        };

        this.initializeDOM();

        this.rates = {};
        this.lastFetch= null;
        this.isLoading = false;
        this.retryCount = 0;

        this.init();
    }

    initializeDOM() {
        console.log("initialisation des éléents DOM ...");

        this.amountInput = document.getElementById('amount');
        this.fromSelect = document.getElementById('fromCurrency');
        this.toSelect = document.getElementById('toCurrency');
        this.swapBtn = document.getElementById('swapBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.resultAmount = document.getElementById('resultAmount');
        this.resultCurrency = document.getElementById('resultCurrency');
        this.exchangeRate = document.getElementById('exchangeRate');
        this.lastUpdate = document.getElementById('lastUpdate');

        this.validateDOMElements();
    }

    validateDOMElements() {
        const elements = {
            amountInput: this.amountInput,
            fromSelect: this.fromSelect,
            toSelect: this.toSelect,
            convertBtn: this.convertBtn,
            resultAmount: this.resultAmount,
        };
        for (const [name, element] of Object.entries(elements)) {
            if (!element){
                throw new Error(`Element DOM manquant: ${name}`);
            }
        }
       console.log("Tous les éléments du DOM sont présents");
    }
}