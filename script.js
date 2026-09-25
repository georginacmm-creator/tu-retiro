const CONFIG = {
  annualRate: 0.10,
  annualInflation: 0.04,
  calendly: "https://calendly.com/georgina-inviertemas/fondosindexados",
  whatsapp: "525572449150",
  googleSheetsUrl: "https://script.google.com/macros/s/AKfycbxfPqfnSDF2Kl8dkdRHWn0QM9WPrvuC15mITAY4sdwJkmQr-jZ8hQd7rknMsfd1woqy8w/exec"
};

const $ = (id) => document.getElementById(id);

const money = (n) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(Math.round(n));

function calculate() {
  const age = Math.max(18, Number($("age")?.value || 38));
  const retireAge = Math.max(
    age + 1,
    Number($("retireAge")?.value || 65)
  );

  const monthly = Math.max(
    0,
    Number($("monthly")?.value || 0)
  );

  const months = (retireAge - age) * 12;
  const r = CONFIG.annualRate / 12;

  const futureContrib =
    r === 0
      ? monthly * months
      : monthly * ((Math.pow(1 + r, months) - 1) / r);

  const futureValue = futureContrib;
  const totalContrib = monthly * months;
  const growth = Math.max(0, futureValue - totalContrib);

  const fiscalEnabled =
    document.querySelector("#taxChoices .choice.active")?.dataset.value !== "no";

  const fiscalBenefit = fiscalEnabled
    ? monthly * 12 * 0.20
    : 0;

  // Resultado
  if ($("summaryYears")) {
    $("summaryYears").textContent = `${retireAge - age} años`;
  }

  if ($("summaryAge")) {
    $("summaryAge").textContent = `${retireAge} años`;
  }

  if ($("summaryContrib")) {
    $("summaryContrib").textContent = money(totalContrib);
  }

  if ($("summaryGrowth")) {
    $("summaryGrowth").textContent = money(growth);
  }

  if ($("futureValue")) {
    $("futureValue").textContent = money(futureValue);
  }

  if ($("fiscalValue")) {
    $("fiscalValue").textContent = money(fiscalBenefit);
  }

  // Gráfica simple
  renderSimpleProgress(totalContrib, growth);

  // Escenario del formulario
  if ($("leadScenarioValue")) {
    $("leadScenarioValue").textContent =
      `${age} años → ${retireAge} años`;
  }

  if ($("leadMonthlyValue")) {
    $("leadMonthlyValue").textContent = money(monthly);
  }

  
  // Llenar automáticamente el ahorro mensual
  const savingsInput = document.querySelector(
    '#leadForm input[name="savings"]'
  );

  if (
    savingsInput &&
    !savingsInput.dataset.userEdited
  ) {
    savingsInput.value = monthly || "";
  }
}

const downloadProjection = document.getElementById("downloadProjection");

if (downloadProjection) {
  downloadProjection.addEventListener("click", async () => {
    if (!window.jspdf) {
      alert("No se pudo cargar el generador de PDF. Recarga la página e inténtalo de nuevo.");
      return;
    }

    downloadProjection.disabled = true;

    try {
      const { jsPDF } = window.jspdf;

      const age = Math.max(18, Number($("age")?.value || 38));
      const retireAge = Math.max(
        age + 1,
        Number($("retireAge")?.value || 65)
      );
      const monthly = Math.max(
        0,
        Number($("monthly")?.value || 0)
      );
      const income = Math.max(
        0,
        Number($("income")?.value || 0)
      );

      const years = retireAge - age;
      const months = years * 12;
      const r = CONFIG.annualRate / 12;

      const futureValue =
        r === 0
          ? monthly * months
          : monthly * ((Math.pow(1 + r, months) - 1) / r);

      const totalContrib = monthly * months;
      const growth = Math.max(0, futureValue - totalContrib);

      const fiscalEnabled =
        document.querySelector("#taxChoices .choice.active")?.dataset.value !== "no";

      const fiscalBenefit = fiscalEnabled
        ? monthly * 12 * 0.20
        : 0;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const blue = [0, 64, 140];
      const darkBlue = [0, 49, 112];
      const teal = [18, 166, 178];
      const orange = [245, 128, 48];
      const dark = [32, 42, 52];
      const muted = [92, 105, 120];
      const line = [218, 223, 228];
      const soft = [247, 249, 251];
      const softBlue = [239, 246, 252];
      const white = [255, 255, 255];

      const moneyPDF = (value) =>
        new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
          maximumFractionDigits: 0
        }).format(Math.round(value));

      const dateText = new Intl.DateTimeFormat("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(new Date());

      const loadImage = (src, format = "JPEG") =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth || img.width;
              canvas.height = img.naturalHeight || img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
              resolve({
                data: canvas.toDataURL(
                  format === "PNG" ? "image/png" : "image/jpeg",
                  0.9
                ),
                format
              });
            } catch (error) {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = src;
        });

      const [logoImage, heroImage] = await Promise.all([
        loadImage("assets/allianz-distribuidor.png", "PNG"),
        loadImage("assets/hero-couple-generated.jpg", "JPEG")
      ]);

      const addPageBackground = () => {
        pdf.setFillColor(...white);
        pdf.rect(0, 0, 210, 297, "F");
      };

      const addHeader = () => {
        pdf.setDrawColor(...line);
        pdf.setLineWidth(0.35);
        pdf.line(12, 27, 198, 27);

        if (logoImage) {
          pdf.addImage(logoImage.data, logoImage.format, 13, 8, 45, 14);
        } else {
          pdf.setTextColor(...blue);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(14);
          pdf.text("Allianz", 13, 17);
        }

        pdf.setTextColor(...darkBlue);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(15);
        pdf.text("OptiMaxx", 77, 16);

        pdf.setTextColor(...orange);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(15);
        pdf.text("plus", 108, 16);

        pdf.setTextColor(...muted);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.text(dateText, 82, 23);

        pdf.setTextColor(...dark);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.text("Agente: Georgina Martinez Martinez", 126, 10);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.text("55 7244 9150", 143, 16);
        pdf.text("georgina@inviertemas.com.mx", 126, 22);
      };

      const addFooter = (pageNumber) => {
        pdf.setTextColor(...muted);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.text("Proyección ilustrativa • Tu Retiro • Invierte+", 12, 291);
        pdf.text("Página " + pageNumber + " de 3", 198, 291, {
          align: "right"
        });
      };

      const roundedCard = (x, y, w, h, fill = white, stroke = line) => {
        pdf.setFillColor(...fill);
        pdf.setDrawColor(...stroke);
        pdf.setLineWidth(0.35);
        pdf.roundedRect(x, y, w, h, 4, 4, "FD");
      };

      const metric = (x, label, value, suffix = "", valueSize = 10) => {
        pdf.setTextColor(...muted);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.text(label, x, 111);

        pdf.setTextColor(...blue);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(valueSize);
        pdf.text(String(value), x, 119);

        if (suffix) {
          pdf.setTextColor(...muted);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(6.5);
          pdf.text(suffix, x, 124);
        }
      };

      // =========================================================
      // PÁGINA 1 — RESUMEN VISUAL, inspirado en la ilustración adjunta
      // =========================================================
      addPageBackground();
      addHeader();

      if (heroImage) {
        pdf.addImage(heroImage.data, heroImage.format, 105, 29, 93, 69);
        pdf.setFillColor(255, 255, 255);
        pdf.setGState(new pdf.GState({ opacity: 0.78 }));
        pdf.rect(96, 29, 42, 69, "F");
        pdf.setGState(new pdf.GState({ opacity: 1 }));
      }

      pdf.setTextColor(...darkBlue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("TU RETIRO PROYECTADO", 14, 40);

      pdf.setTextColor(...dark);
      pdf.setFontSize(17);
      pdf.text("Tu retiro proyectado", 14, 51);
      pdf.text("puede alcanzar", 14, 59);

      pdf.setTextColor(...blue);
      pdf.setFontSize(27);
      pdf.text(moneyPDF(futureValue), 14, 78);

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.text(
        "Con una aportación mensual de " + moneyPDF(monthly) +
        " y una proyección de crecimiento anual del " +
        Math.round(CONFIG.annualRate * 100) + "%.",
        14,
        87,
        { maxWidth: 82 }
      );

      roundedCard(12, 103, 186, 26, white, line);

      metric(17, "Edad actual", age + " años");
      metric(53, "Edad retiro", retireAge + " años");
      metric(89, "Aportación mensual", moneyPDF(monthly), "", monthly >= 100000 ? 8 : 9);
      metric(132, "Inflación considerada", Math.round(CONFIG.annualInflation * 100) + "%");
      metric(169, "Tasa anual proyectada", Math.round(CONFIG.annualRate * 100) + "%", "", 9);

      pdf.setDrawColor(...line);
      [48, 84, 127, 164].forEach((x) => pdf.line(x, 107, x, 125));

      pdf.setTextColor(...darkBlue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("ESTRUCTURA DE TU PATRIMONIO", 92, 145);

      // Mini dona: composición matemática del resultado.
      const total = Math.max(1, totalContrib + growth);
      const contribPct = totalContrib / total;
      const growthPct = growth / total;

      pdf.setFillColor(...softBlue);
      pdf.circle(42, 180, 24, "F");
      pdf.setFillColor(...blue);
      pdf.circle(42, 180, 24, "F");

      // Arcos simulados con líneas radiales para mantener compatibilidad con jsPDF.
      const segments = 48;
      for (let i = 0; i < segments; i++) {
        const startAngle = -Math.PI / 2 + (i / segments) * Math.PI * 2;
        const endAngle = -Math.PI / 2 + ((i + 1) / segments) * Math.PI * 2;
        const mid = (i + 0.5) / segments;
        const isGrowth = mid > contribPct;
        pdf.setDrawColor(...(isGrowth ? teal : blue));
        pdf.setLineWidth(6);
        const x1 = 42 + 20 * Math.cos(startAngle);
        const y1 = 180 + 20 * Math.sin(startAngle);
        const x2 = 42 + 20 * Math.cos(endAngle);
        const y2 = 180 + 20 * Math.sin(endAngle);
        pdf.line(x1, y1, x2, y2);
      }

      pdf.setFillColor(...white);
      pdf.circle(42, 180, 11, "F");
      pdf.setTextColor(...darkBlue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text("TU", 42, 179, { align: "center" });
      pdf.text("PLAN", 42, 184, { align: "center" });

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.text("Aportaciones", 16, 212);
      pdf.setTextColor(...blue);
      pdf.setFont("helvetica", "bold");
      pdf.text(Math.round(contribPct * 100) + "%", 48, 212);

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.text("Crecimiento", 16, 219);
      pdf.setTextColor(...teal);
      pdf.setFont("helvetica", "bold");
      pdf.text(Math.round(growthPct * 100) + "%", 48, 219);

      const cards = [
        {
          x: 67,
          title: "TÚ APORTAS",
          value: moneyPDF(totalContrib),
          desc: "Suma de tus aportaciones durante la duración de tu plan.",
          fill: white,
          color: blue
        },
        {
          x: 127,
          title: "TU INVERSIÓN CRECE",
          value: moneyPDF(growth),
          desc: "Crecimiento estimado de tu inversión en el tiempo.",
          fill: white,
          color: teal
        }
      ];

      cards.forEach((card) => {
        roundedCard(card.x, 155, 55, 73, card.fill, line);
        pdf.setTextColor(...card.color);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.text(card.title, card.x + 27.5, 167, { align: "center" });

        pdf.setFontSize(13);
        pdf.text(card.value, card.x + 27.5, 181, { align: "center" });

        pdf.setTextColor(...muted);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.3);
        const lines = pdf.splitTextToSize(card.desc, 43);
        pdf.text(lines, card.x + 6, 193);
      });

      pdf.setFillColor(...darkBlue);
      pdf.roundedRect(127, 232, 55, 35, 4, 4, "F");
      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.text("TU FUTURO RECIBE", 154.5, 242, { align: "center" });
      pdf.setFontSize(15);
      pdf.text(moneyPDF(futureValue), 154.5, 253, { align: "center" });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.3);
      pdf.text(
        "Suma de aportaciones y crecimiento proyectado.",
        154.5,
        262,
        { align: "center", maxWidth: 45 }
      );

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.text(
        "Esta primera página resume tu escenario. La proyección es ilustrativa y depende de los supuestos indicados.",
        12,
        277,
        { maxWidth: 186 }
      );

      addFooter(1);

      // =========================================================
      // PÁGINA 2 — TABLA ANUAL
      // =========================================================
      pdf.addPage();
      addPageBackground();
      addHeader();

      pdf.setTextColor(...darkBlue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Proyección año por año", 13, 40);

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.text(
        "Escenario calculado con la aportación mensual actual y la tasa anual proyectada de " +
        Math.round(CONFIG.annualRate * 100) + "%.",
        13,
        48
      );

      const tableX = 10;
      const tableY = 57;
      const rowH = years > 35 ? 5.2 : 7;
      const headerH = 10;
      const cols = [
        { label: "Edad", w: 18 },
        { label: "Aportación anual", w: 29 },
        { label: "Aportación acumulada", w: 32 },
        { label: "Rendimiento", w: 29 },
        { label: "Saldo proyectado", w: 34 },
        { label: "Saldo disponible", w: 32 }
      ];

      let cx = tableX;
      pdf.setFillColor(...darkBlue);
      pdf.rect(tableX, tableY, 174, headerH, "F");

      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.2);

      cols.forEach((col) => {
        pdf.text(col.label, cx + col.w / 2, tableY + 6.5, {
          align: "center",
          maxWidth: col.w - 2
        });
        cx += col.w;
      });

      let cumulative = 0;
      let balance = 0;
      const availableRows = Math.min(years, Math.floor((260 - tableY - headerH) / rowH));

      for (let i = 1; i <= availableRows; i++) {
        const currentAge = age + i;
        const annualContribution = monthly * 12;
        cumulative += annualContribution;
        const yearlyStart = balance;
        balance = yearlyStart * Math.pow(1 + r, 12) +
          annualContribution * ((Math.pow(1 + r, 12) - 1) / r);
        const annualGrowth = Math.max(0, balance - yearlyStart - annualContribution);

        const y = tableY + headerH + (i - 1) * rowH;

        pdf.setFillColor(
          i % 2 === 0 ? 248 : 255,
          i % 2 === 0 ? 250 : 255,
          i % 2 === 0 ? 252 : 255
        );
        pdf.rect(tableX, y, 174, rowH, "F");

        if (currentAge === retireAge) {
          pdf.setFillColor(...teal);
          pdf.rect(tableX, y, 174, rowH, "F");
        }

        pdf.setTextColor(currentAge === retireAge ? white[0] : dark[0], currentAge === retireAge ? white[1] : dark[1], currentAge === retireAge ? white[2] : dark[2]);
        pdf.setFont("helvetica", currentAge === retireAge ? "bold" : "normal");
        pdf.setFontSize(6.2);

        const values = [
          String(currentAge),
          moneyPDF(annualContribution),
          moneyPDF(cumulative),
          moneyPDF(annualGrowth),
          moneyPDF(balance),
          moneyPDF(balance)
        ];

        let x = tableX;
        values.forEach((value, idx) => {
          const col = cols[idx];
          pdf.text(value, x + col.w / 2, y + rowH - 1.8, {
            align: "center"
          });
          x += col.w;
        });
      }

      // Si el horizonte es muy largo, indicamos que la tabla continúa conceptualmente.
      if (years > availableRows) {
        pdf.setTextColor(...muted);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.text(
          "La tabla muestra las primeras " + availableRows +
          " edades para conservar una lectura cómoda. El saldo final de la página 1 corresponde al horizonte completo.",
          12,
          248,
          { maxWidth: 185 }
        );
      }

      roundedCard(12, 258, 58, 22, white, line);
      roundedCard(76, 258, 58, 22, white, line);
      roundedCard(140, 258, 58, 22, softBlue, [190, 215, 235]);

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.2);
      pdf.text("Aportaciones acumuladas", 41, 266, { align: "center" });
      pdf.text("Crecimiento estimado", 105, 266, { align: "center" });
      pdf.text("Saldo proyectado", 169, 266, { align: "center" });

      pdf.setTextColor(...blue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(moneyPDF(totalContrib), 41, 275, { align: "center" });
      pdf.text(moneyPDF(growth), 105, 275, { align: "center" });
      pdf.text(moneyPDF(futureValue), 169, 275, { align: "center" });

      addFooter(2);

      // =========================================================
      // PÁGINA 3 — ESTRUCTURA, SUPUESTOS Y CTA
      // =========================================================
      pdf.addPage();
      addPageBackground();
      addHeader();

      pdf.setTextColor(...darkBlue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Estructura de tu plan", 13, 40);

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.text("Inicio", 13, 49);
      pdf.setTextColor(...darkBlue);
      pdf.setFont("helvetica", "bold");
      pdf.text(age + " años", 13, 55);

      pdf.setTextColor(...darkBlue);
      pdf.text(retireAge + " años", 185, 55, { align: "right" });

      pdf.setDrawColor(...line);
      pdf.setLineWidth(2);
      pdf.line(17, 67, 193, 67);
      pdf.setDrawColor(...teal);
      pdf.setLineWidth(2);
      pdf.line(17, 67, 17 + 176 * Math.min(1, 18 / Math.max(18, years)), 67);

      pdf.setFillColor(...teal);
      pdf.circle(17, 67, 2.3, "F");
      pdf.setFillColor(...darkBlue);
      pdf.circle(193, 67, 2.3, "F");

      pdf.setTextColor(...darkBlue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text("ESCENARIO DE RETIRO", 105, 83, { align: "center" });

      roundedCard(12, 90, 89, 66, soft, line);
      roundedCard(109, 90, 89, 66, soft, line);

      pdf.setTextColor(...blue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("LO QUE ESTÁS APORTANDO", 18, 102);
      pdf.text("LO QUE ESTÁS PROYECTANDO", 115, 102);

      pdf.setTextColor(...dark);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(
        [
          "• Aportación mensual: " + moneyPDF(monthly),
          "• Aportación anual: " + moneyPDF(monthly * 12),
          "• Horizonte: " + years + " años",
          "• Aportaciones totales: " + moneyPDF(totalContrib)
        ],
        18,
        113,
        { lineHeightFactor: 1.7 }
      );

      pdf.text(
        [
          "• Tasa anual proyectada: " + Math.round(CONFIG.annualRate * 100) + "%",
          "• Inflación considerada: " + Math.round(CONFIG.annualInflation * 100) + "%",
          "• Crecimiento estimado: " + moneyPDF(growth),
          "• Saldo proyectado: " + moneyPDF(futureValue)
        ],
        115,
        113,
        { lineHeightFactor: 1.7 }
      );

      if (fiscalEnabled) {
        roundedCard(12, 166, 186, 30, softBlue, [190, 215, 235]);
        pdf.setTextColor(...blue);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text("Beneficio fiscal estimado", 19, 177);
        pdf.setFontSize(14);
        pdf.text(moneyPDF(fiscalBenefit), 19, 188);
        pdf.setTextColor(...muted);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.text(
          "Estimación anual equivalente al 20% de las aportaciones consideradas en la calculadora. La aplicación real depende de tu situación fiscal y de la legislación vigente.",
          67,
          177,
          { maxWidth: 123 }
        );
      } else {
        roundedCard(12, 166, 186, 30, soft, line);
        pdf.setTextColor(...muted);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        pdf.text(
          "En este escenario no se está considerando beneficio fiscal.",
          19,
          182
        );
      }

      roundedCard(12, 205, 186, 51, white, line);
      pdf.setTextColor(...darkBlue);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Importante sobre esta proyección", 19, 217);

      pdf.setTextColor(...muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.8);
      const legalText =
        "Las tasas de crecimiento utilizadas tienen fines ilustrativos. Una proyección no garantiza rendimientos futuros. " +
        "El resultado real puede ser distinto y dependerá de las condiciones del mercado, aportaciones realizadas, comisiones, impuestos y demás condiciones del producto que se contrate. " +
        "Esta ilustración es una herramienta informativa para conversar sobre tu estrategia de retiro y no constituye un contrato ni una oferta vinculante.";
      pdf.text(pdf.splitTextToSize(legalText, 168), 19, 228, {
        lineHeightFactor: 1.45
      });

      pdf.setFillColor(...darkBlue);
      pdf.roundedRect(12, 263, 186, 19, 4, 4, "F");
      pdf.setTextColor(...white);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text("¿Quieres revisar este escenario conmigo?", 19, 275);

      pdf.setTextColor(...orange);
      pdf.setFontSize(8);
      pdf.text("AGENDA TU ASESORÍA PERSONALIZADA →", 126, 275);

      pdf.link(124, 267, 69, 10, {
        url: CONFIG.calendly
      });

      addFooter(3);

      pdf.save("Proyeccion-Retiro-Georgina.pdf");

      const postDownloadCta = $("postDownloadCta");
      if (postDownloadCta) {
        postDownloadCta.hidden = false;
        postDownloadCta.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    } catch (error) {
      console.error("Error generando la proyección PDF:", error);
      alert("No se pudo generar el PDF. Inténtalo nuevamente.");
    } finally {
      downloadProjection.disabled = false;
    }
  });
}

function renderSimpleProgress(contrib, growth) {
  const contribBar = $("contribBar");
  const growthBar = $("growthBar");

  const contribValue = $("contribLegendValue");
  const growthValue = $("growthLegendValue");

  const total = contrib + growth;

  if (!total) {
    if (contribBar) {
      contribBar.style.width = "0%";
      contribBar.style.flexBasis = "0%";
    }

    if (growthBar) {
      growthBar.style.width = "0%";
      growthBar.style.flexBasis = "0%";
    }

    return;
  }

  const contribPercent = (contrib / total) * 100;
  const growthPercent = (growth / total) * 100;

  if (contribBar) {
    contribBar.style.width = `${contribPercent}%`;
    contribBar.style.flexBasis = `${contribPercent}%`;
  }

  if (growthBar) {
    growthBar.style.width = `${growthPercent}%`;
    growthBar.style.flexBasis = `${growthPercent}%`;
  }

  if (contribValue) {
    contribValue.textContent = money(contrib);
  }

  if (growthValue) {
    growthValue.textContent = money(growth);
  }
}

// Recalcular cuando cambien los datos
["age", "retireAge", "income", "monthly"].forEach((id) => {
  const input = $(id);

  if (input) {
    input.addEventListener("input", calculate);
    input.addEventListener("change", calculate);
  }
});

// Deducción fiscal Sí / No
document.querySelectorAll("#taxChoices .choice").forEach((choice) => {
  choice.addEventListener("click", () => {
    document
      .querySelectorAll("#taxChoices .choice")
      .forEach((item) => item.classList.remove("active"));

    choice.classList.add("active");
    calculate();
  });
});

// Botón CALCULA TU RETIRO
const calculateButton = Array.from(document.querySelectorAll("button, a"))
  .find(el => el.textContent.trim().includes("CALCULA TU RETIRO"));

if (calculateButton) {
  calculateButton.addEventListener("click", (event) => {
    event.preventDefault();

    calculate();

    const resultSection = document.querySelector(".calc-result");

    if (resultSection) {
      resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
}

// Si la persona modifica manualmente el ahorro,
// ya no lo reemplazamos con el valor de la calculadora
const savingsInput = document.querySelector(
  '#leadForm input[name="savings"]'
);

if (savingsInput) {
  savingsInput.addEventListener("input", () => {
    savingsInput.dataset.userEdited = "true";
  });
}

// Formulario de prospectos
const leadForm = $("leadForm");

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    calculate();

    const formData = new FormData(leadForm);

    const age = Number($("age")?.value || 0);
    const retireAge = Number($("retireAge")?.value || 0);
    const monthly = Number($("monthly")?.value || 0);

    const months = Math.max(0, (retireAge - age) * 12);
    const r = CONFIG.annualRate / 12;

    const futureValue =
      r === 0
        ? monthly * months
        : monthly * ((Math.pow(1 + r, months) - 1) / r);

    const totalContrib = monthly * months;
    const growth = Math.max(0, futureValue - totalContrib);

    const fiscalEnabled =
      document.querySelector("#taxChoices .choice.active")?.dataset.value !== "no";

    const fiscalBenefit = fiscalEnabled
      ? monthly * 12 * 0.20
      : 0;

    const lead = {
      name: formData.get("name") || "",
      whatsapp: formData.get("whatsapp") || "",
      email: formData.get("email") || "",
      savings: formData.get("savings") || "",
      profession: formData.get("profession") || "",
      age: age,
      retireAge: retireAge,
      years: Math.max(0, retireAge - age),
      totalContrib: totalContrib,
      growth: growth,
      futureValue: futureValue,
      fiscalBenefit: fiscalBenefit
    };

    // Guardar una copia local
    try {
      localStorage.setItem(
        "tuRetiroLeadDraft",
        JSON.stringify(lead)
      );
    } catch (error) {
      console.log("No se pudo guardar copia local", error);
    }

    const message = $("formMessage");

    if (message) {
      message.textContent =
        "Perfecto. Tus datos fueron enviados. Ahora podrás elegir fecha y hora para hablar conmigo.";
    }

    // Enviar prospecto a Google Sheets
    try {
      await fetch(CONFIG.googleSheetsUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(lead)
      });
    } catch (error) {
      console.log("No se pudo enviar a Google Sheets", error);
    }

    // Preparar Calendly
    const calendlyUrl = new URL(CONFIG.calendly);

    if (lead.name) {
      calendlyUrl.searchParams.set("name", lead.name);
    }

    if (lead.email) {
      calendlyUrl.searchParams.set("email", lead.email);
    }

    calendlyUrl.searchParams.set(
      "utm_source",
      "tu_retiro_landing"
    );

    calendlyUrl.searchParams.set(
      "utm_medium",
      "lead_form"
    );

    calendlyUrl.searchParams.set(
      "utm_campaign",
      "retiro"
    );

    // Abrir Calendly
    window.open(
      calendlyUrl.toString(),
      "_blank",
      "noopener"
    );
  });
}
// Botones de WhatsApp
const whatsappUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(
  "Hola Georgina, quiero hablar sobre mi retiro."
)}`;

const whatsappLinks = [
  document.getElementById("whatsappLink"),
  document.getElementById("floatingWhatsApp")
].filter(Boolean);

whatsappLinks.forEach((link) => {
  link.href = whatsappUrl;
  link.target = "_blank";
  link.rel = "noopener";

  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.open(whatsappUrl, "_blank", "noopener");
  });
});

// Ejecutar cálculo al cargar
calculate();
