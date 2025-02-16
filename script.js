class Calculator {
    constructor() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.history = [];
        this.shouldResetDisplay = false;

        this.displayElement = document.querySelector('.current-display');
        this.historyDisplayElement = document.querySelector('.history-display');
        this.historyPanel = document.querySelector('.history-panel');
        this.historyToggle = document.querySelector('.history-toggle');

        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', () => {
                const value = button.textContent;
                
                if (button.classList.contains('operator')) {
                    this.handleOperator(value);
                } else if (button.classList.contains('equals')) {
                    this.calculate();
                } else if (button.classList.contains('clear')) {
                    this.clear();
                } else {
                    this.appendNumber(value);
                }
            });
        });

        this.historyToggle.addEventListener('click', () => {
            this.toggleHistory();
        });
    }

    appendNumber(number) {
        if (this.shouldResetDisplay) {
            this.currentValue = '';
            this.shouldResetDisplay = false;
        }
        if (number === '.' && this.currentValue.includes('.')) return;
        this.currentValue = this.currentValue === '0' ? number : this.currentValue + number;
        this.updateDisplay();
    }

    handleOperator(operator) {
        if (operator === '⌫') {
            this.currentValue = this.currentValue.slice(0, -1) || '0';
            this.updateDisplay();
            return;
        }

        if (operator === '±') {
            this.currentValue = (-parseFloat(this.currentValue)).toString();
            this.updateDisplay();
            return;
        }

        if (operator === '%') {
            this.currentValue = (parseFloat(this.currentValue) / 100).toString();
            this.updateDisplay();
            return;
        }

        if (this.operation !== null) this.calculate();
        this.operation = operator;
        this.previousValue = this.currentValue;
        this.shouldResetDisplay = true;
        this.updateHistoryDisplay();
    }

    calculate() {
        if (!this.operation || !this.previousValue) return;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                result = prev / current;
                break;
            default:
                return;
        }

        const calculation = `${prev} ${this.operation} ${current} = ${result}`;
        this.addToHistory(calculation);

        this.currentValue = result.toString();
        this.operation = null;
        this.previousValue = '';
        this.shouldResetDisplay = true;
        this.updateDisplay();
        this.historyDisplayElement.textContent = '';
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.updateDisplay();
        this.historyDisplayElement.textContent = '';
    }

    updateDisplay() {
        this.displayElement.textContent = this.currentValue;
    }

    updateHistoryDisplay() {
        this.historyDisplayElement.textContent = `${this.previousValue} ${this.operation}`;
    }

    addToHistory(calculation) {
        this.history.unshift(calculation);
        if (this.history.length > 10) this.history.pop();
        this.updateHistoryPanel();
    }

    updateHistoryPanel() {
        this.historyPanel.innerHTML = this.history
            .map(calc => `<div class="history-item">${calc}</div>`)
            .join('');

        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const result = item.textContent.split('=')[1].trim();
                this.currentValue = result;
                this.updateDisplay();
            });
        });
    }

    toggleHistory() {
        this.historyPanel.classList.toggle('active');
    }
}

new Calculator();
