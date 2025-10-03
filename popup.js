let companies = [];
let results = [];

document.getElementById("fileInput").addEventListener("change", function(e){
  const file = e.target.files[0];
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(output) {
      companies = output.data;
      document.getElementById("status").innerText = `Loaded ${companies.length} companies`;
    }
  });
});

document.getElementById("startScraping").addEventListener("click", async ()=>{
  if(companies.length === 0){ alert("Upload a CSV first!"); return; }

  results = [];
  document.getElementById("status").innerText = "Scraping started...";

  for(let i=0; i<companies.length; i++){
    const row = companies[i];
    const query = `${row.company} ${row.country}`;
    const url = "https://www.google.com/search?q=" + encodeURIComponent(query);

    await new Promise(resolve=>{
      chrome.tabs.create({ url, active: false }, tab=>{
        chrome.runtime.onMessage.addListener(function listener(msg){
          if(msg.type === "extracted" && msg.data){
            results.push(Object.assign({}, row, msg.data));
            chrome.tabs.remove(tab.id);
            chrome.runtime.onMessage.removeListener(listener);
            resolve();
          }
        });
      });
    });

    document.getElementById("status").innerText = `Processed ${i+1}/${companies.length}`;
  }

  chrome.storage.local.set({finalResults: results}, ()=>{
    document.getElementById("status").innerText = "Scraping complete!";
  });
});

document.getElementById("downloadResults").addEventListener("click", ()=>{
  chrome.storage.local.get("finalResults", (res)=>{
    if(!res.finalResults || res.finalResults.length === 0){ alert("No results yet!"); return; }
    const keys = Object.keys(res.finalResults[0]);
    const csv = [keys.join(",")].concat(
      res.finalResults.map(r=>keys.map(k=> `"${(r[k]||"").toString().replace(/"/g,'""')}"`).join(","))
    ).join("\n");
    const blobUrl = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    chrome.downloads.download({ url: blobUrl, filename: "business-scrape.csv" });
  });
});
