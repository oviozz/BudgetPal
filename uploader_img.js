
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
    getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import axios from "https://cdn.skypack.dev/axios";
import { Upload_Instant_Load } from './dashboard.js';


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

let currentUser;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

const fileInput = document.getElementById("receipt_file");
const fileName = document.getElementById("file-name");
const receipt_store_val = document.querySelector('.receipt-store-val');
const nextButton = document.querySelector(".next-button");

const closeButton = document.querySelector(".uploader-close-button");
const uploaderOverlay = document.querySelector(".uploader-overlay");
const uploaderDrag = document.querySelector('.uploader-drag');

const openButton = document.querySelector('.upload-receipt');

const next_upload_btn = document.querySelector('.next_upload_button');
const upload_error = document.querySelector(".error-msg-upload");

const progress_loader_display = document.querySelector('.progress-bar');

function updateFileInfo() {
    const file = fileInput.files[0];
    fileName.innerHTML = `<ion-icon style="font-size: 1.5rem" name="document-attach-outline" ></ion-icon> ${file.name}`;
    nextButton.style.display = "block";
}

fileInput.addEventListener("change", function() {
    updateFileInfo();
});

openButton.addEventListener('click', function () {
    uploaderOverlay.style.display = "block";

})

closeButton.addEventListener("click", function() {
    uploaderOverlay.style.display = "none";
    fileInput.value = ''; // reset the file input element value to an empty string
    fileName.textContent = ''; // reset the file name to an empty string
    receipt_store_val.value = '';
    upload_error.style.display = 'none'

});

uploaderDrag.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
    uploaderDrag.classList.add('dragover');
});

uploaderDrag.addEventListener('dragleave', (event) => {
    event.preventDefault();
    event.stopPropagation();
    uploaderDrag.classList.remove('dragover');
});

uploaderDrag.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    uploaderDrag.classList.remove('dragover');
    fileInput.files = event.dataTransfer.files;
    updateFileInfo();
});

next_upload_btn.addEventListener('click', () => {



    const storeNameValue = receipt_store_val.value.trim();

    if (!fileInput.files[0] || !storeNameValue) {
        upload_error.style.display = 'block'
        return;
    }

    uploaderOverlay.style.display = "none";
    progress_loader_display.style.display = 'block';

    upload_error.style.display = 'none'

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function() {
        const imageData = reader.result.split(',')[1];

        axios.post('http://127.0.0.1:5000/upload-image', {
            imageData,
            "store_name": storeNameValue,
            "UUID": currentUser.uid
        }).then(response => {

            const data = response.data;

            Upload_Instant_Load(data);

            progress_loader_display.style.display = 'none';

            fileInput.value = ''; // reset the file input element value to an empty string
            fileName.textContent = ''; // reset the file name to an empty string
            receipt_store_val.value = '';


            const existingData = JSON.parse(localStorage.getItem('preLoadData'));

            const cleanedData = data.receipts.map((receipt) => {
                return receipt.purchasedItems.map((item) => {
                    return {
                        name: item.name,
                        price: item.price,
                        store_name: receipt.storeName,
                        timestamp: data.timestamp
                    };
                });
            }).flat();

            existingData.push(...cleanedData);

            localStorage.setItem('preLoadData', JSON.stringify(existingData));

        }).catch(error => console.error(error));
    };
});


