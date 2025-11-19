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

    async loadRates() {
        console.log("Chargement des taux de changes ...");

        if (this.isCacheValid()) {
            console.log("Utilisation des taux en cache");
            this.convert();
            return;
        }

        await this.fetchFromAPI();
    }

    isCacheValid() {

        if (!this.lastFetch || Object.keys(this.rates).length === 0) {
            console.log("Cache vide");
            return false;
        }
    
   
        // Vérifier l'âge du cache
        const cacheAge = Date.now() - this.lastFetch.getTime();
        const isValid = cacheAge < this.apiConfig.cacheDuration;
        
        console.log(`⏰ Cache âgé de ${Math.round(cacheAge/1000)}s, valide: ${isValid}`);
        return isValid;
    }
    
    async fetchFromAPI() {
        this.setLoading(true);
        
        try {
            const baseCurrency = this.fromSelect.value;
            const apiUrl = this.buildAPIUrl(baseCurrency);
            
            console.log('🔗 Appel API:', apiUrl.replace(this.apiConfig.apiKey, '***'));
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            this.processAPIResponse(data, baseCurrency);
            
        } catch (error) {
            console.error('❌ Erreur API:', error);
            await this.handleAPIError(error);
        } finally {
            this.setLoading(false);
        }
    }
    
    buildAPIUrl(baseCurrency) {
        const { provider, apiKey } = this.apiConfig;
        
        if (provider === 'exchangerate-api') {
            return `${this.apiEndpoints[provider]}${apiKey}/latest/${baseCurrency}`;
        } else if (provider === 'currencyapi') {
            return `${this.apiEndpoints[provider]}latest?apikey=${apiKey}&base_currency=${baseCurrency}`;
        }
        
        throw new Error('Provider API non supporté');
    }
    
    processAPIResponse(data, baseCurrency) {
        console.log('📊 Données API reçues:', data);
        
        // Traitement selon le provider
        if (this.apiConfig.provider === 'exchangerate-api') {
            if (data.result !== 'success') {
                throw new Error(data['error-type'] || 'Erreur API');
            }
            this.rates = data.conversion_rates;
            
        } else if (this.apiConfig.provider === 'currencyapi') {
            if (!data.data) {
                throw new Error('Données manquantes dans la réponse');
            }
            // Convertir le format de currencyapi
            this.rates = {};
            for (const [currency, info] of Object.entries(data.data)) {
                this.rates[currency] = info.value;
            }
        }
        
        // S'assurer que la devise de base est incluse
        this.rates[baseCurrency] = 1;
        
        this.lastFetch = new Date();
        this.saveToCache();
        this.updateLastUpdate();
        this.convert();
        
        this.retryCount = 0; // Réinitialiser les tentatives
        console.log('✅ Taux mis à jour avec succès');
    }
    
    saveToCache() {
        const cacheData = {
            rates: this.rates,
            timestamp: this.lastFetch.getTime(),
            baseCurrency: this.fromSelect.value
        };
        localStorage.setItem('currencyConverterCache', JSON.stringify(cacheData));
        console.log('💾 Cache sauvegardé');
    }
    
    loadFromCache() {
        try {
            const cached = localStorage.getItem('currencyConverterCache');
            if (!cached) {
                console.log('📭 Aucun cache trouvé');
                return false;
            }
            
            const cacheData = JSON.parse(cached);
            const cacheAge = Date.now() - cacheData.timestamp;
            
            // Vérifier si le cache est encore valide
            if (cacheAge < this.apiConfig.cacheDuration) {
                this.rates = cacheData.rates;
                this.lastFetch = new Date(cacheData.timestamp);
                this.updateLastUpdate();
                this.convert();
                console.log('📦 Données chargées depuis le cache');
                return true;
            } else {
                console.log('🗑️ Cache expiré');
                localStorage.removeItem('currencyConverterCache');
            }
        } catch (error) {
            console.warn('❌ Erreur lors du chargement du cache:', error);
            // Nettoyer le cache corrompu
            localStorage.removeItem('currencyConverterCache');
        }
        return false;
    }
}

