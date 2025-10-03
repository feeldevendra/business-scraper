(function(){
  function extractData(){
    const data = {};
    // Name
    const nameSel = document.querySelector('[data-attrid="title"]') || document.querySelector("#rhs h2, #rhs h1");
    if(nameSel) data.name = nameSel.innerText.trim();

    // Phone
    const phoneSel = document.querySelector('a[href^="tel:"]');
    if(phoneSel) data.phone = phoneSel.href.replace("tel:","");

    // Website
    const webSel = document.querySelector('a[data-attrid="website"]');
    if(webSel) data.website = webSel.href;

    // Email (rarely shown directly, but sometimes in snippet)
    const bodyText = document.body.innerText;
    const emailMatch = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
    if(emailMatch) data.email = emailMatch[0];

    // Country (fallback: search query keyword)
    const country = document.querySelector('[data-attrid="kc:/location/location:address"]');
    if(country) data.country = country.innerText;

    return data;
  }

  setTimeout(()=>{
    const extracted = extractData();
    chrome.runtime.sendMessage({type:"extracted", data:extracted});
  }, 2000);
})();
