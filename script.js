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
        this.lastFetch = null;
        this.isLoading = false;
        this.retryCount = 0;

        this.init();
    }

    initializeDOM() {
        console.log("initialisation des éléments DOM ...");

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

    init() {
        console.log("Initialisation de l'application de conversion de devises...");
        console.log("ProviderAPI:", this.apiConfig.provider);
        
        this.bindEvents();
        this.loadRates();
    }

    bindEvents() {
        console.log("liaison des évènements ...");

        this.convertBtn.addEventListener('click', () => { 
            this.convert();
        });

        this.amountInput.addEventListener('input', () => { 
            this.debouncedConvert();
        });

        this.fromSelect.addEventListener('change', () => { 
            this.loadRates();
        });

        this.toSelect.addEventListener('change', () => { 
            this.swapCurrencies();
        });

        this.amountInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.convert();
            }
        });

        console.log("événements liés avec succès");
    }
}
