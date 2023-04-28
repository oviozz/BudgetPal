
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyAvyi8MCFGyBVW34I-ddBUAd8kG4Kscx3E",
    authDomain: "budgetpal-effaa.firebaseapp.com",
    projectId: "budgetpal-effaa",
    storageBucket: "budgetpal-effaa.appspot.com",
    messagingSenderId: "958893727353",
    appId: "1:958893727353:web:7cea2c79ff92ca968a7ea8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


const user_email_input = document.querySelector('#email-value');
const user_password_input = document.querySelector('#password-value');

const sign_up_btn = document.querySelector('#submit-user-signup');
const login_in_btn = document.querySelector('#submit-user-login');


const userSignUp = async() => {


    const signup_email = user_email_input.value;
    const signup_password = user_password_input.value;

    if (!signup_email || !signup_password) {
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, signup_email, signup_password);

        signInWithEmailAndPassword(auth, signup_email, signup_password)
            .then((userCredential) => {
                window.location.href='dashboard.html';
            })
            .catch((error) => {
                const errorMessage = error.message;
                user_inputCheck_login(errorMessage)
            })

    } catch (error) {
        const errorMessage = error.message;
        user_inputCheck_signup(errorMessage)

    }
}

const userLogin = async() => {

    const login_email = user_email_input.value;
    const login_password = user_password_input.value;

    if (!login_email || !login_password) {
        return;
    }

    signInWithEmailAndPassword(auth, login_email, login_password)
        .then((userCredential) => {
            console.log(userCredential.user)

            window.location.href='dashboard.html';
        })
        .catch((error) => {
            const errorMessage = error.message;
            user_inputCheck_login(errorMessage)
        })
}
function user_inputCheck_login(errorMessage){

    if (errorMessage.includes('password')){
        document.querySelector('.invalid-textbox-input-password').style.display = 'block';
        user_password_input.classList.add('invalid_user_input');
    } else {
        document.querySelector('.invalid-textbox-input-password').style.display = 'none';
        user_password_input.classList.remove('invalid_user_input');
    }
    if (errorMessage.includes('email')){
        document.querySelector('.invalid-textbox-input-email').style.display = 'block';
        user_email_input.classList.add('invalid_user_input');
    } else {
        document.querySelector('.invalid-textbox-input-email').style.display = 'none';
        user_email_input.classList.remove('invalid_user_input');
    }
}


function user_inputCheck_signup(errorMessage){

    if (errorMessage.includes('password')){
        document.querySelector('.invalid-textbox-input-password').style.display = 'block';
        user_password_input.classList.add('invalid_user_input');
    } else {
        document.querySelector('.invalid-textbox-input-password').style.display = 'none';
        user_password_input.classList.remove('invalid_user_input');
    }

    if (errorMessage.includes('email')){
        document.querySelector('.invalid-textbox-input-email').style.display = 'block';
        user_email_input.classList.add('invalid_user_input');
    } else {
        document.querySelector('.invalid-textbox-input-email').style.display = 'none';
        user_email_input.classList.remove('invalid_user_input');
    }
}

const checkAuthState = async() => {
    onAuthStateChanged(auth, user => {
        if (user) {
            if (!window.location.pathname.includes('dashboard.html')) {
                window.location.href='dashboard.html';
            }
        } else {
            if (!window.location.pathname.includes('index.html')) {
                window.location.href='login.html';
            }
        }
    })
}




const userSignOut = async () => {
    await signOut(auth)
    window.location.href='index.html';
}


if (document.body.classList.contains('dashboard_page')) {
    checkAuthState();
}


if (document.body.classList.contains('signup_page')) {

    sign_up_btn.addEventListener('click', userSignUp);

    user_email_input.addEventListener('input', () => {
        if (user_email_input.classList.contains('invalid_user_input')) {
            user_inputCheck('', true); // Remove error message and class
        }
    });

    user_password_input.addEventListener('input', () => {
        if (user_password_input.classList.contains('invalid_user_input')) {
            user_inputCheck('', true); // Remove error message and class
        }
    });

}


if (document.body.classList.contains('login_page')) {
    login_in_btn.addEventListener('click', userLogin);

    user_email_input.addEventListener('input', () => {
        if (user_email_input.classList.contains('invalid_user_input')) {
            user_inputCheck('', true); // Remove error message and class
        }
    });

    user_password_input.addEventListener('input', () => {
        if (user_password_input.classList.contains('invalid_user_input')) {
            user_inputCheck('', true); // Remove error message and class
        }
    });

}

if (document.body.classList.contains('dashboard_page') || document.body.classList.contains('receipt-search') || document.body.classList.contains('receipt-image') || document.body.classList.contains('budget_page')) {
    document.querySelector('.logout-nav').addEventListener('click', userSignOut)

}

