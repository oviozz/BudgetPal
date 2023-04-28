
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
    getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import axios from "https://cdn.skypack.dev/axios";

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();

const weekly_button = document.querySelector('.weekly-btn');
const monthly_button = document.querySelector('.monthly-btn'); // corrected classname
const yearly_button = document.querySelector('.yearly-btn'); // corrected classname

const weeklytotal = document.querySelector('.weekly-total');
const dailyaverage = document.querySelector('.daily-average');

const item_log_list = document.querySelector('.item-log-lists');

let myChart;
let current_graph_clicked;


let currentUser;


onAuthStateChanged(auth, (user) => {
    currentUser = user.uid;

    Promise.all([
        fetch(`http://127.0.0.1:5000/get/${currentUser}`).then(response => response.json()),
    ]).then(([itemLog]) => {

        renderWeeklyChart(currentUser);
        renderItemLog(itemLog);

        localStorage.setItem('preLoadData', JSON.stringify(itemLog));

    }).catch(error => console.error(error));

});



weekly_button.addEventListener('click', async () => {

    monthly_button.classList.remove('choose-graph')
    weekly_button.classList.add('choose-graph')
    yearly_button.classList.remove('choose-graph');


    renderWeeklyChart(currentUser);

});

function renderWeeklyChart(currentUser) {

    Promise.all([
        fetch(`http://127.0.0.1:5000/get_week/${currentUser}`).then(response => response.json()),
    ]).then(([data_items]) => {

        const weekly_value = data_items.reduce((total, num) => total + num, 0).toFixed(2)
        weeklytotal.innerHTML = `<p class="weekly-total bld">Weekly Total: <b>$ ${weekly_value}</b></p>`
        dailyaverage.innerHTML = `<p class="daily-average bld">Daily Average:<b> $ ${(weekly_value / data_items.length).toFixed(2)}</b></p>`


        const data = {
            labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            datasets: [
                {
                    label: 'Data',
                    backgroundColor: '#7A8DF2',
                    borderColor: '#2B2B2E',
                    borderWidth: 2,
                    borderRadius: {
                        topLeft: 10,
                        topRight: 10,
                        bottomLeft: 0,
                        bottomRight: 0,
                    },
                    data: data_items
                }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    }
                },
                maintainAspectRatio: false,
                width: '80%',
                height: 450,
                legend: {
                    display: false
                }
            }
        };

        const ctx = document.getElementById('myChart').getContext('2d');
        if (myChart !== undefined) {
            myChart.destroy();
        }
        myChart = new Chart(ctx, config);

    }).catch(error => console.error(error));

    current_graph_clicked = renderWeeklyChart;
}


monthly_button.addEventListener('click', async () => {

    monthly_button.classList.add('choose-graph')
    yearly_button.classList.remove('choose-graph');
    weekly_button.classList.remove('choose-graph')


    renderMonthlyChart(currentUser)
});

function renderMonthlyChart(currentUser) {

    Promise.all([
        fetch(`http://127.0.0.1:5000/get_month/${currentUser}`).then(response => response.json()),
    ]).then(([data_items]) => {

        const weekly_data_items = []
        for (let i = 0; i < data_items.length; i += 7) {
            weekly_data_items.push(data_items.slice(i, i + 7))
        }

        const weekly_sums = weekly_data_items.map(week_items =>
            week_items.reduce((total, num) => total + num, 0).toFixed(2))

        const weekly_total = weekly_sums.reduce((total, num) => total + parseFloat(num), 0).toFixed(2)
        weeklytotal.innerHTML = `<p class="weekly-total bld">Montly Total: <b>$ ${weekly_total}</b></p>`
        dailyaverage.innerHTML = `<p class="daily-average bld">Weekly Average:<b> $ ${(weekly_total / 4).toFixed(2)}</b></p>`


        const data = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
                {
                    label: 'Data',
                    backgroundColor: '#7A8DF2',
                    borderColor: '#2B2B2E',
                    borderWidth: 2,
                    borderRadius: {
                        topLeft: 10,
                        topRight: 10,
                        bottomLeft: 0,
                        bottomRight: 0,
                    },
                    data: weekly_sums
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    }
                },
                maintainAspectRatio: false,
                width: '80%',
                height: 450
            }
        };

        const ctx = document.getElementById('myChart').getContext('2d');
        if (myChart !== undefined) {
            myChart.destroy();
        }
        myChart = new Chart(ctx, config);

    }).catch(error => console.error(error));

    current_graph_clicked = renderMonthlyChart;

}

yearly_button.addEventListener('click', async () => {

    yearly_button.classList.add('choose-graph');
    weekly_button.classList.remove('choose-graph');
    monthly_button.classList.remove('choose-graph');

    renderYearlyChart(currentUser);

});

function renderYearlyChart(currentUser) {

    Promise.all([
        fetch(`http://127.0.0.1:5000/get_year/${currentUser}`).then(response => response.json()),
    ]).then(([data_items]) => {

        const weekly_value = data_items.reduce((total, num) => total + num, 0).toFixed(2)
        weeklytotal.innerHTML = `<p class="weekly-total bld">Yearly Total: <b>$ ${weekly_value}</b></p>`
        dailyaverage.innerHTML = `<p class="daily-average bld">Montly Average:<b> $ ${(weekly_value / data_items.length).toFixed(2)}</b></p>`

        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Data',
                    backgroundColor: '#7A8DF2',
                    borderColor: '#2B2B2E',
                    borderWidth: 2,
                    borderRadius: {
                        topLeft: 10,
                        topRight: 10,
                        bottomLeft: 0,
                        bottomRight: 0,
                    },
                    data: data_items
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    }
                },
                maintainAspectRatio: false,
                width: '80%',
                height: 450
            }
        };

        const ctx = document.getElementById('myChart').getContext('2d');
        if (myChart !== undefined) {
            myChart.destroy();
        }
        myChart = new Chart(ctx, config);

    }).catch(error => console.error(error));

    current_graph_clicked = renderYearlyChart;

}

function renderItemLog(item_log) {
    item_log_list.innerHTML = '';

    item_log.forEach(item => {

        const listItem = document.createElement('li');
        listItem.classList.add('log-items');

        listItem.innerHTML = `
                <p class="items-date">${item.timestamp}</p>
                <p class="items-date">${item.store_name}</p>
                <p class="items-name">${item.name}</p>
                <p class="items-price">$ ${item.price}</p>`;
        item_log_list.appendChild(listItem);
    });
}

export function Upload_Instant_Load(data){
    const main_log_lists = document.querySelector('.item-log-lists');

    const date = data['timestamp'];


    data["receipts"].forEach((item) => {
        const store_name = item.storeName
        const full_items = item.purchasedItems

        full_items.forEach((items) => {
            const upload_Item = document.createElement('li');
            upload_Item.classList.add('log-items');

            upload_Item.innerHTML = `
                <p class="items-date">${date}</p>
                <p class="items-date">${store_name}</p>
                <p class="items-name">${items.name}</p>
                <p class="items-price">$ ${items.price}</p>`;

            main_log_lists.prepend(upload_Item);
        })

    })

    current_graph_clicked(currentUser)
}



