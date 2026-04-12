const form = document.getElementById("job-form");
const submitButton = document.getElementById("submit-button");
const statusCard = document.getElementById("status-card");
const resultCard = document.getElementById("result-card");

let currentJobId = new URLSearchParams(window.location.search).get("job");
let pollTimer = null;

function renderStatus(job) {
  if (!job) {
    statusCard.className = "status-card empty";
    statusCard.innerHTML = "<p>还没有任务。上传文件后这里会显示 job id、运行状态和分享链接。</p>";
    return;
  }

  const statusClass = job.status || "queued";
  statusCard.className = "status-card";
  statusCard.innerHTML = `
    <div class="status-grid">
      <div class="status-row">
        <span class="status-pill ${statusClass}">${job.status}</span>
        <span class="status-pill">job: ${job.jobId}</span>
        <span class="status-pill">template ${job.fileCounts?.templateCount || 0}</span>
        <span class="status-pill">pdf ${job.fileCounts?.pdfCount || 0}</span>
        <span class="status-pill">assets ${job.fileCounts?.assetCount || 0}</span>
        <span class="status-pill">reference ${job.fileCounts?.referenceCount || 0}</span>
      </div>
      <div class="status-row">
        <span>创建时间：${new Date(job.createdAt).toLocaleString()}</span>
        ${job.startedAt ? `<span>开始时间：${new Date(job.startedAt).toLocaleString()}</span>` : ""}
        ${job.finishedAt ? `<span>完成时间：${new Date(job.finishedAt).toLocaleString()}</span>` : ""}
      </div>
      ${job.error ? `<div class="share-box">错误：${job.error}</div>` : ""}
      <div class="share-box">分享链接：${window.location.origin}/?job=${job.jobId}</div>
    </div>
  `;
}

function linkCard(label, href, note) {
  return `
    <a class="result-link" href="${href}" target="_blank" rel="noreferrer">
      <strong>${label}</strong>
      <span>${note}</span>
    </a>
  `;
}

function renderResults(job) {
  if (!job || !job.outputs) {
    resultCard.className = "result-card empty";
    resultCard.innerHTML = "<p>等待生成结果。</p>";
    return;
  }

  const links = [];
  if (job.outputs.finalHtmlUrl) links.push(linkCard("打开 final.html", job.outputs.finalHtmlUrl, "网页形式查看最终长图"));
  if (job.outputs.finalPngUrl) links.push(linkCard("下载 final.png", job.outputs.finalPngUrl, "最终 PNG 导出"));
  if (job.outputs.finalJpgUrl) links.push(linkCard("下载 final.jpg", job.outputs.finalJpgUrl, "额外 JPG 导出"));
  if (job.outputs.firstPreviewUrl) links.push(linkCard("查看 module_01", job.outputs.firstPreviewUrl, "首模块风格基准"));
  if (job.outputs.runtimeLogUrl) links.push(linkCard("运行日志", job.outputs.runtimeLogUrl, "生成过程 stdout / stderr"));

  (job.outputs.logUrls || []).forEach((url) => {
    const name = url.split("/").pop();
    links.push(linkCard(name, url, "结构化日志 / JSON / MD"));
  });

  const previewImages = [];
  if (job.outputs.finalPngUrl) {
    previewImages.push(`<img src="${job.outputs.finalPngUrl}" alt="final preview" />`);
  }
  if (job.outputs.firstPreviewUrl) {
    previewImages.push(`<img src="${job.outputs.firstPreviewUrl}" alt="module 01 preview" />`);
  }

  resultCard.className = "result-card";
  resultCard.innerHTML = `
    <div class="link-grid">${links.join("") || "<p>任务还在运行，结果链接会在完成后出现。</p>"}</div>
    ${previewImages.length ? `<div class="preview-stack">${previewImages.join("")}</div>` : ""}
  `;
}

async function fetchJob(jobId) {
  const response = await fetch(`/api/jobs/${jobId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch job");
  }
  return response.json();
}

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

async function pollJob(jobId) {
  stopPolling();

  try {
    const job = await fetchJob(jobId);
    renderStatus(job);
    renderResults(job);

    if (job.status === "queued" || job.status === "running") {
      pollTimer = setTimeout(() => pollJob(jobId), 2000);
    }
  } catch (error) {
    statusCard.className = "status-card";
    statusCard.innerHTML = `<div class="share-box">读取任务状态失败：${error.message}</div>`;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  submitButton.textContent = "生成中...";

  const data = new FormData(form);

  try {
    const response = await fetch("/api/jobs", {
      method: "POST",
      body: data
    });

    if (!response.ok) {
      throw new Error("任务创建失败");
    }

    const job = await response.json();
    currentJobId = job.jobId;
    window.history.replaceState({}, "", `/?job=${currentJobId}`);
    renderStatus(job);
    renderResults(job);
    pollJob(currentJobId);
  } catch (error) {
    statusCard.className = "status-card";
    statusCard.innerHTML = `<div class="share-box">提交失败：${error.message}</div>`;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "开始生成";
  }
});

if (currentJobId) {
  pollJob(currentJobId);
} else {
  renderStatus(null);
  renderResults(null);
}
