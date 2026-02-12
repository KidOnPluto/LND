// get references to html elements
const donateBtn = document.getElementById("donateBtn");
const amountInput = document.getElementById("amount");
const statusText = document.getElementById("status");
const invoiceText = document.getElementById("invoice");

// store the current invoice hash and polling interval
let currentRHash = null;
let pollInterval = null;
// when the donate button is clicked
donateBtn.addEventListener("click", async () => {
// get amount enter by the user
    const amount = amountInput.value;
// basic validation: has to make sure user entered something
    if (!amount) {
        alert("Please enter amount in sats");
        return;
    }
// update to UI to show progress
    statusText.innerText = "Creating invoice...";
    invoiceText.innerText = "";

    try {
        //send post to request backend to create invoice
        const response = await fetch("", { // remember to enter localhost url
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ amount: amount })
        });

        const data = await response.json();

        currentRHash = data.r_hash;
        invoiceText.innerText = data.payment_request;
        statusText.innerText = "Invoice created. Waiting for payment...";

        startPolling();

    } catch (error) {
        console.error(error);
        statusText.innerText = "Error creating invoice.";
    }
});


function startPolling() {

    pollInterval = setInterval(async () => {

        const response = await fetch("http://localhost:3000/check-invoice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ r_hash: currentRHash })
        });

        const data = await response.json();

        if (data.settled) {
            clearInterval(pollInterval);
            statusText.innerText = "Donation Successful!";
            invoiceText.innerText = "";
        }

    }, 3000);
}
