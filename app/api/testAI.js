fetch("http://localhost:3000/api/ai-summary", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    water_name: "Cuyahoga R at Lower Harvard Brdg in Cleveland OH",
    risk_label: "LOW",
    metrics: { turbidity: null, temperature: null, dissolved_oxygen: null, pH: null },
    user_zip: "44102"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));