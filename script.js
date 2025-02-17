class Calculator {
    constructor() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.history = [];
        this.shouldResetDisplay = false;
        this.graphData = [];

        this.displayElement = document.querySelector('.current-display');
        this.historyDisplayElement = document.querySelector('.history-display');
        this.historyPanel = document.querySelector('.history-panel');
        this.historyToggle = document.querySelector('.history-toggle');
        this.graphContainer = document.querySelector('.graph-container');
        this.graphCanvas = document.getElementById('graphCanvas');
        this.chart = null;

        this.setupEventListeners();
        this.updateDisplay();
    }

    convertAngle(value) {
        return this.isRadians ? value : value * (Math.PI / 180);
    }

    // Add this method to handle inverse angle conversions
    convertInverseAngle(value) {
        return this.isRadians ? value : value * (180 / Math.PI);
    }

    setupEventListeners() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', () => {
                const value = button.textContent;
                
                if (button.classList.contains('graph-btn')) {
                    this.toggleGraph();
                } else if (button.classList.contains('operator')) {
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
        if (operator === 'rad' || operator === 'deg') {
            this.isRadians = operator === 'rad';
            return;
        }

        // Handle trigonometric functions
        if (['sin', 'cos', 'tan'].includes(operator)) {
            const angle = this.convertAngle(parseFloat(this.currentValue));
            let result;
            
            switch(operator) {
                case 'sin':
                    result = Math.sin(angle);
                    break;
                case 'cos':
                    result = Math.cos(angle);
                    break;
                case 'tan':
                    result = Math.tan(angle);
                    break;
            }
            
            this.addToHistory(`${operator}(${this.currentValue}) = ${result}`);
            this.currentValue = result.toString();
            this.updateDisplay();
            return;
        }

        // Handle inverse trigonometric functions
        if (['asin', 'acos', 'atan'].includes(operator)) {
            const value = parseFloat(this.currentValue);
            let result;
            
            switch(operator) {
                case 'asin':
                    result = this.convertInverseAngle(Math.asin(value));
                    break;
                case 'acos':
                    result = this.convertInverseAngle(Math.acos(value));
                    break;
                case 'atan':
                    result = this.convertInverseAngle(Math.atan(value));
                    break;
            }
            
            this.addToHistory(`${operator}(${this.currentValue}) = ${result}`);
            this.currentValue = result.toString();
            this.updateDisplay();
            return;
        }
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

        if (operator === 'x²') {
            const num = parseFloat(this.currentValue);
            this.currentValue = (num * num).toString();
            this.addToHistory(`${num}² = ${this.currentValue}`);
            this.updateDisplay();
            return;
        }

        if (operator === 'x³') {
            const num = parseFloat(this.currentValue);
            this.currentValue = (num * num * num).toString();
            this.addToHistory(`${num}³ = ${this.currentValue}`);
            this.updateDisplay();
            return;
        }

        if (operator === '√') {
            const num = parseFloat(this.currentValue);
            this.currentValue = Math.sqrt(num).toString();
            this.addToHistory(`√${num} = ${this.currentValue}`);
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
        this.addToGraphData(result);

        this.currentValue = result.toString();
        this.operation = null;
        this.previousValue = '';
        this.shouldResetDisplay = true;
        this.updateDisplay();
        this.historyDisplayElement.textContent = '';
        this.updateGraph();
    }

    addToGraphData(value) {
        this.graphData.push({
            x: this.graphData.length + 1,
            y: parseFloat(value)
        });
        if (this.graphData.length > 10) {
            this.graphData.shift();
        }
    }

    updateGraph() {
        if (!this.chart) {
            this.initializeChart();
        } else {
            this.chart.data.labels = this.graphData.map(point => point.x);
            this.chart.data.datasets[0].data = this.graphData.map(point => point.y);
            this.chart.update();
        }
    }

    initializeChart() {
        const ctx = this.graphCanvas.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.graphData.map(point => point.x),
                datasets: [{
                    label: 'Calculation Results',
                    data: this.graphData.map(point => point.y),
                    borderColor: '#4361ee',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    toggleGraph() {
        this.graphContainer.classList.toggle('active');
        if (this.graphContainer.classList.contains('active')) {
            this.updateGraph();
        }
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
