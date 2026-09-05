const CONFIG = {
  annualRate: 0.10,
  annualInflation: 0.04,
  calendly: "https://calendly.com/georgina-inviertemas/fondosindexados",
  whatsapp: "525572449150"
};

const $ = (id) => document.getElementById(id);
const money = (n) => new Intl.NumberFormat("es-MX", {style:"currency", currency:"MXN", maximumFractionDigits:0}).format(Math.round(n));

function calculate(){
  const age = Math.max(18, Number($("age").value)||38);
  const retireAge = Math.max(age+1, Number($("retireAge").value)||65);
  const monthly = Math.max(0, Number($("monthly").value)||0);
  const months = (retireAge-age)*12;
  const r = CONFIG.annualRate/12;

  const futureContrib = r === 0 ? monthly*months : monthly*((Math.pow(1+r,months)-1)/r);
  const futureValue = futureContrib;
  const totalContrib = monthly*months;
  const growth = Math.max(0, futureValue-totalContrib);
  const fiscalEnabled = document.querySelector("#taxChoices .choice.active")?.dataset.value !== "no";
  const fiscalBenefit = fiscalEnabled ? monthly * 12 * 0.20 : 0;

  $("futureValue").textContent = money(futureValue);
  $("cardMonthly").textContent = `${money(monthly)} MXN`;
  $("cardContrib").textContent = `${money(totalContrib)} MXN`;
  $("cardGrowth") && ($("cardGrowth").textContent = `${money(growth)} MXN`);
  $("summaryYears").textContent = `${retireAge-age} años`;
  $("summaryAge").textContent = `${retireAge} años`;
  $("summaryContrib").textContent = money(totalContrib);
  $("summaryGrowth").textContent = money(growth);
  $("fiscalValue").textContent = money(fiscalBenefit);
  renderSimpleProgress(totalContrib, growth);
  updateLeadPreview(age, retireAge, monthly);
}

function renderSimpleProgress(contrib, growth){
  const total = Math.max(1, contrib + growth);
  $("contribBar").style.width = `${(contrib/total)*100}%`;
  $("growthBar").style.width = `${(growth/total)*100}%`;
}

function updateLeadPreview(age, retireAge, monthly){
  if ($("leadScenarioValue")) $("leadScenarioValue").textContent = `${age} → ${retireAge} años`;
  if ($("leadMonthlyValue")) $("leadMonthlyValue").textContent = money(monthly);
  const savings = document.querySelector('#leadForm input[name="savings"]');
  if (savings && !savings.dataset.userEdited) savings.value = monthly || "";
}

function activateChoices(groupId){
  document.querySelectorAll(`#${groupId} .choice`).forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(`#${groupId} .choice`).forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      calculate();
    });
  });
}

$("calculate").addEventListener("click", () => {
  calculate();
  const leadSection = $("leadSection");
  if (leadSection) {
    leadSection.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => $("leadForm")?.querySelector('input[name="name"]')?.focus(), 550);
  }
});

["age","retireAge","income","monthly"].forEach(id => $(id).addEventListener("input", calculate));
$("leadForm")?.querySelector('input[name="savings"]')?.addEventListener("input", (e)=> e.target.dataset.userEdited="true");
activateChoices("taxChoices");

$("leadForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const lead = {
    name,
    whatsapp: String(form.get("whatsapp") || "").trim(),
    email,
    savings: String(form.get("savings") || "").trim(),
    profession: String(form.get("profession") || "").trim(),
    age: Number($("age").value)||0,
    retireAge: Number($("retireAge").value)||0,
    monthly: Number($("monthly").value)||0,
    futureValue: $("futureValue")?.textContent || "",
    fiscalBenefit: $("fiscalValue")?.textContent || "",
    createdAt: new Date().toISOString()
  };
  try { localStorage.setItem("tuRetiroLeadDraft", JSON.stringify(lead)); } catch (_) {}

  $("formMessage").textContent = "¡Listo! Tus datos quedaron preparados. Ahora elige día y hora para hablar conmigo.";
  const url = new URL(CONFIG.calendly);
  if (name) url.searchParams.set("name", name);
  if (email) url.searchParams.set("email", email);
  url.searchParams.set("utm_source", "tu_retiro_landing");
  url.searchParams.set("utm_medium", "lead_form");
  url.searchParams.set("utm_campaign", "retiro");
  const calendly = $("calendlyBtn");
  calendly.href = url.toString();
  setTimeout(() => window.open(url.toString(), "_blank", "noopener"), 350);
});

document.querySelectorAll('a[href="#"]').forEach(a=>{
  if(a.id !== "whatsappLink" && a.id !== "floatingWhatsApp") a.addEventListener("click",e=>e.preventDefault());
});

function setWhatsApp(){
  const number = CONFIG.whatsapp.replace(/\D/g,"");
  const links = [$('whatsappLink'), $('floatingWhatsApp')].filter(Boolean);
  const text = "Hola Georgina, quiero hablar sobre mi retiro.";
  if(number){
    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    links.forEach(a=>a.href=url);
  }
}
setWhatsApp();
if ($("year")) $("year").textContent = new Date().getFullYear();
calculate();
