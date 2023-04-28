
function UpdateBudget(input) {

    const daily_spending = document.querySelector('.budget-spending-limit')

    input.value = `$${input.value.replace(/[^0-9\.]/g, '')}`;

    daily_spending.textContent = `$${(parseInt(input.value.replace('$','')) / 30).toFixed(2)}`

    console.log('working')
}
