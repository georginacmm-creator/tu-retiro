const CONFIG = {
  annualRate: 0.10, // illustrative only
  annualInflation: 0.04, // illustrative only
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
}

function renderSimpleProgress(contrib, growth){
  const total = Math.max(1, contrib + growth);
  $("contribBar").style.width = `${(contrib/total)*100}%`;
  $("growthBar").style.width = `${(growth/total)*100}%`;
}

function activateChoices(groupId){
  document.querySelectorAll(`#${groupId} .choice`).forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(`#${groupId} .choice`).forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
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
activateChoices("taxChoices");

$("leadForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  $("formMessage").textContent = "¡Listo! Ahora elige el día y horario que mejor te funcione.";
  setTimeout(() => {
    window.location.href = CONFIG.calendly;
  }, 350);
});

document.querySelectorAll('a[href="#"]').forEach(a=>{
  if(a.id !== "whatsappLink" && a.id !== "floatingWhatsApp") a.addEventListener("click",e=>e.preventDefault());
});

function setWhatsApp(){
  const number = CONFIG.whatsapp.replace(/\D/g,"");
  const links = [$("whatsappLink"), $("floatingWhatsApp")];
  if(number){
    const url = `https://wa.me/${number}?text=${encodeURIComponent("Hola Georgina, quiero hablar sobre mi retiro.")}`;
    links.forEach(a=>a.href=url);
  } else {
    links.forEach(a=>a.addEventListener("click",e=>{
      e.preventDefault();
      alert("Agrega tu número de WhatsApp en CONFIG.whatsapp dentro de script.js para activar este botón.");
    }));
  }
}
setWhatsApp();
$("year").textContent = new Date().getFullYear();
calculate();
