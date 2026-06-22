let currencies = [];


const span = document.getElementById("dynamic-number");
// const currencyApi = async () => {
//     try {
//         const response = await fetch("https://api.frankfurter.dev/v1/latest",{
//             method: "GET",
//             headers:{
//                 Accept : "application/json"
//             }
//         });
//         currencies = await response.json();
//         const data = currencies.rates
//         console.log(data)
//         const currencyCodes = Object.keys(data); 
        
//         console.log("Number of currencies:", currencyCodes.length);
//         // span.innerHTML = currencyCodes.length

//     } catch (error) {
//         console.log("The error is",error);
//     }
// }
// currencyApi();
const sendAmountInput = document.getElementById("send-amount");
const receiveAmountInput = document.getElementById("receive-amount");
const sendCurrencyDropdown = document.getElementById("send-currency-code");
const receiveCurrencyDropdown = document.getElementById("receive-currency-code");
const rateTextDisplay = document.getElementById("rate-text");
async function getCurrencyRate(base,target){
    if(base===target) return 1;
    const api = "https://api.frankfurter.dev";
    const response = await fetch(`${api}/v1/latest?base=${base}&symbols=${target}`);
    const data = await response.json();
    return data.rates[target];
}
getCurrencyRate('USD','EUR').then(rate => console.log(`1 USD = ${rate} EUR`));



async function calculateConversion() {
    const amount = parseFloat(sendAmountInput.value);
    const baseCurrency = sendCurrencyDropdown.innerHTML.trim();
    const targetCurrency = receiveCurrencyDropdown.innerHTML.trim();

    if(isNaN(amount) || amount <=0){
        receiveAmountInput.value = "";
        return;
    }
    try {
        const rate = await getCurrencyRate(baseCurrency,targetCurrency);
        const conversion = amount * rate;
        receiveAmountInput.value = conversion.toFixed(2);
        rateTextDisplay.textContent = `1 ${baseCurrency} = ${rate} ${targetCurrency}`;
        
    } catch (error) {
        console.log("The error is",error)
    }
}

sendAmountInput.addEventListener('input',calculateConversion);


const selectionSend = document.getElementById("selected-option");
const spans = document.getElementById("send-images");
const spanss = document.getElementById("receive-images");
const sendListElement = document.getElementById("send-list");
const receiveListElement = document.getElementById("receive-list");
const receiveOption = document.getElementById("receive-option");

const displayCurrency = async ()=>{
    try {
       const response = await fetch("https://api.frankfurter.dev/v1/latest");
       const data = await response.json();
       console.log (data);
       const arrayOfCurrency = Object.keys(data.rates);
       currencies = arrayOfCurrency
       span.innerHTML = currencies.length
       console.log(arrayOfCurrency);
       const list = arrayOfCurrency.map(itm=>{
        return {
            name : itm,
            image : `./assets/images/flags/${itm.toLocaleLowerCase()}.webp`
        }
       })
       const defaultCurrency = list[0];
       console.log(defaultCurrency);
       if(defaultCurrency){
            sendCurrencyDropdown.textContent = defaultCurrency.name;
            spans.innerHTML = `<img src="${defaultCurrency.image}" alt="${defaultCurrency.name} flag" width="24">`;
       }
       const defaultCurrencytwo = list[1];
       console.log(defaultCurrencytwo);
       if(defaultCurrencytwo){
        receiveCurrencyDropdown.textContent = defaultCurrencytwo.name;
        spanss.innerHTML = `<img src="${defaultCurrencytwo.image}" alt="${defaultCurrencytwo.name} flag" width="24">`;
       }
       calculateConversion();
       

       list.forEach(itm =>{
        const liSend = document.createElement("li");
        liSend.className = "option-item";
        liSend.innerHTML = `<img src="${itm.image}" alt="${itm.name} flag" width="24"> <span>${itm.name}</span>`;
        liSend.addEventListener('click',()=>{
            spans.innerHTML = `<img src="${itm.image}" alt="${itm.name} flag" width="24">`;
            sendCurrencyDropdown.textContent = itm.name;
            sendListElement.classList.remove("show");
            calculateConversion();
        });
        sendListElement.appendChild(liSend);

        const liReceive = document.createElement("li");
        liReceive.className = "option-item";
        liReceive.innerHTML = `<img src="${itm.image}" alt="${itm.name} flag" width="24"> <span>${itm.name}</span>`;
        liReceive.addEventListener('click',()=>{
            spanss.innerHTML = `<img src="${itm.image}" alt="${itm.name} flag" width="24">`;
            receiveCurrencyDropdown.textContent = itm.name;
            receiveListElement.classList.remove("show");
            calculateConversion();
        });
        receiveListElement.appendChild(liReceive);
        })
        
        selectionSend.addEventListener("click", () => {
            sendListElement.classList.toggle("show");
            
        });
        receiveOption.addEventListener('click',()=>{
            receiveListElement.classList.toggle("show")
        })
        console.log(list);
    
    } 
    catch (error) {
        console.log("The error is ", error);
    }
}
displayCurrency();


const favBtn = document.getElementById("fav-btn");
const favImg = document.getElementById("fav-img");
const favSpan = document.getElementById("fav-span");


favBtn.addEventListener('click',()=>{
    favBtn.classList.toggle('active');
    
    if(favBtn.classList.contains('active')){
        favSpan.innerHTML = "Favorited";
        favImg.src = "assets/images/icon-star-filled.svg";
        favImg.alt = "star-filled";
    }else{
        favSpan.innerHTML = "Favorite";
        favImg.src = "assets/images/icon-star.svg";
        favImg.alt = "star";
    }
    console.log("Button is clicked");

})




const swapBtn = document.getElementById("swap-btn");

swapBtn.addEventListener('click',()=>{
    const temp = selectionSend.innerHTML;
    selectionSend.innerHTML = receiveOption.innerHTML;
    receiveOption.innerHTML = temp;
    console.log("The Swap button was clicked!");
});


const liveTicker = async () =>{
    try {
        const today = new Date().toISOString().split('T')[0];
        const yestedayDate = new Date();
        yestedayDate.setDate(yestedayDate.getDate() - 1);
        const yesterday = yestedayDate.toISOString().split('T')[0];

        const [latest,history] = await Promise.all([
            fetch(`https://api.frankfurter.dev/v1/${today}?base=USD`),
            fetch(`https://api.frankfurter.dev/v1/${yesterday}?base=USD`)
        ]);
        const latestResponse = await latest.json();
        const historyResponse = await history.json();
        const latestData = latestResponse.rates;
        const historyData = historyResponse.rates;


        const shelf = document.getElementById('ticker-shelf');
        if (!shelf) return;

        // Clear any existing content
        shelf.innerHTML = '';
        Object.keys(latestData).forEach(currency=>{
            const currentRate = latestData[currency];
            const previousRate = historyData[currency];

            if (!previousRate) return;
            const priceChange = currentRate - previousRate;
            const pricePercent = (priceChange / previousRate) * 100;
            const isPositive = priceChange >= 0;
            const status = isPositive ? 'up' : 'down';
            const arrow = isPositive ? '▲' : '▼';


            const tickerItem = document.createElement('div');
            tickerItem.className = `ticker-item ${status}`;
            tickerItem.innerHTML = `
                <span class="currency-pair">USD/${currency}</span>
                <span class="rate">${currentRate.toFixed(4)}</span>
                <span class="change">${arrow} ${Math.abs(pricePercent).toFixed(2)}%</span>
            `;

            // 6. Append to the shelf
            shelf.appendChild(tickerItem);
        })
    } catch (error) {
        console.log("The error is",error)
    }
    
}
liveTicker();
