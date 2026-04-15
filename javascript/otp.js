const firebaseConfig = {
  apiKey: "AIzaSyD7dsYZ-Exl-dUhjwT1xcqAvIVTG8kngJc",
  authDomain: "gulms-3a632.firebaseapp.com",
  projectId: "gulms-3a632",
  storageBucket: "gulms-3a632.firebasestorage.app",
  messagingSenderId: "466850440462",
  appId: "1:466850440462:web:a49a0147f32b52f5de235f"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

let confirmationResult;
window.recaptchaVerifier = null;



// ✅ OPEN MODAL
window.openOtpModal = function () {

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

    let mobile =
        "+91" + document.getElementById("mobile").value;

    // ✅ create captcha if not ready
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

    let code =
        document.getElementById("otp").value;

    let mobile =
        document.getElementById("mobile").value;

    confirmationResult.confirm(code)
        .then(function () {

            fetch(
                M.cfg.wwwroot +
                "/local/otp/login.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/x-www-form-urlencoded"
                    },
                    body:
                        "phone=" + mobile
                }
            )
            .then(r => r.text())
            .then(res => {

                console.log("PHP RESPONSE:", res);
                alert("SERVER: " + res);

                if (res.trim() === "OK") {

                    window.location =
                        M.cfg.wwwroot + "/my";

                }

            });

        })
        .catch(function (error) {

            alert(error.message);

        });

};