let confirmationResult;
window.recaptchaVerifier = null;

let firebaseReady = false;

// Load config from backend
fetch(M.cfg.wwwroot + "/local/otp/firebase_config.php")
    .then(res => res.json())
    .then(firebaseConfig => {

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        firebaseReady = true;
        console.log("Firebase initialized");

    })
    .catch(err => {
        console.error("Failed to load Firebase config", err);
    });

window.openOtpModal = function () {

if (!firebaseReady) {
    alert("Please wait, initializing...");
    return;
}

    document.getElementById("otpModal").style.display = "block";

    setTimeout(function () {

        const container =
            document.getElementById("recaptcha-container");

        if (!container) {
            alert("recaptcha container missing");
            return;
        }

        container.innerHTML = "";

        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (e) {}
        }

        window.recaptchaVerifier =
            new firebase.auth.RecaptchaVerifier(
                "recaptcha-container",   // ✅ IMPORTANT
                {
                    size: "normal"
                }
            );

        window.recaptchaVerifier.render()
            .then(function () {
                console.log("captcha ready");
            })
            .catch(function (e) {
                console.log(e);
            });

    }, 300);

};



window.sendOtpFirebase = function () {


    if (!firebaseReady) {
        alert("Please wait, initializing...");
        return;
    }

    let mobile =
        "+91" + document.getElementById("mobile").value;

    //  create captcha if not ready
    if (!window.recaptchaVerifier) {

        const container =
            document.getElementById("recaptcha-container");

        if (!container) {
            alert("recaptcha container missing");
            return;
        }

        window.recaptchaVerifier =
            new firebase.auth.RecaptchaVerifier(
                "recaptcha-container",
                { size: "normal" }
            );

        window.recaptchaVerifier.render();
    }

    firebase.auth()
        .signInWithPhoneNumber(
            mobile,
            window.recaptchaVerifier
        )
        .then(function (result) {

            confirmationResult = result;
            alert("OTP sent");

        })
        .catch(function (error) {

            console.log(error);
            alert(error.message);

        });

};



window.verifyOtpFirebase = function () {

if (!firebaseReady) {
    alert("Please wait, initializing...");
    return;
}

    let code = document.getElementById("otp").value;

    // Always use same format as OTP send
    let mobile = "+91" + document.getElementById("mobile").value;

    if (!confirmationResult) {
        alert("Please request OTP first");
        return;
    }

    confirmationResult.confirm(code)
        .then(function () {

            fetch(
                M.cfg.wwwroot + "/local/otp/login.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    //  encode properly
                    body: "phone=" + encodeURIComponent(mobile)
                }
            )
            .then(r => r.text())
            .then(res => {

                console.log("PHP RESPONSE:", res);

                if (res.trim() === "OK") {

                    window.location = M.cfg.wwwroot + "/my";

                } else {

                    alert("Login failed: " + res);

                }

            });

        })
        .catch(function (error) {

            alert(error.message);

        });

};