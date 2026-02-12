
const createBtn = document.getElementById("createBtn");
const amountInput = document.getElementById("amount");
const invoiceSection = document.getElementById("invoiceSection");
const invoiceText = document.getElementById("invoiceText");
const statusText = document.getElementById("status");
const successMessage = document.getElementById("successMessage");
const qrContainer = document.getElementById("qrcode");

const currentAmountEl = document.getElementById("currentAmount");
const progressFill = document.getElementById("progressFill");

let rHash = null;
let pollInterval = null;


createBtn.addEventListener("click", createInvoice);


async function createInvoice() {
    const amount = parseInt(amountInput.value);

    if (!amount || amount <= 0) {
        alert("Please enter a valid amount in sats.");
        return;
    }

    try {
        
        const response = await fetch("http://localhost:3000/create-invoice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount })
        });

        const data = await response.json();

        if (data.error) {
            alert("Error creating invoice. Try again.");
            return;
        }

        
        rHash = data.rHash;

        
        invoiceSection.style.display = "block";
        invoiceText.innerText = data.paymentRequest;
        successMessage.innerText = "";
        statusText.innerText = "Waiting for payment confirmation...";

        
        qrContainer.innerHTML = "";
        new QRCode(qrContainer, {
            text: data.paymentRequest,
            width: 200,
            height: 200
        });

      
        startPolling(amount);

    } catch (error) {
        console.error("Invoice creation error:", error);
        alert("Server error. Try again later.");
    }
}


function startPolling(amount) {
    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`http://localhost:3000/check-invoice?rHash=${rHash}`);
            const data = await response.json();

            if (data.settled) {
                clearInterval(pollInterval);
                statusText.innerText = "";
                successMessage.innerText = "🎉 Donation Successful!";
                updateProgress(amount);
                resetInvoiceSection();
            }

        } catch (error) {
            console.error("Polling error:", error);
        }
    }, 3000); 
}


function updateProgress(amountAdded) {
    let currentTotal = parseInt(currentAmountEl.innerText);
    currentTotal += amountAdded;

    currentAmountEl.innerText = currentTotal;

    const goal = 100000; 
    const percentage = Math.min((currentTotal / goal) * 100, 100);

    progressFill.style.width = percentage + "%";
}


function resetInvoiceSection() {
    amountInput.value = "";
    rHash = null;

   
    setTimeout(() => {
        invoiceSection.style.display = "none";
        qrContainer.innerHTML = "";
        invoiceText.innerText = "";
        successMessage.innerText = "";
    }, 5000);
}
