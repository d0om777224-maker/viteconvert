const API_BASE_URL = "";
const API_KEY = "dev-local-key";

export async function startConversion(url, format, quality) {
  const response = await fetch(`${API_BASE_URL}/api/convert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY
    },
    body: JSON.stringify({ url, format, quality })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to start conversion");
  }

  return response.json(); // returns { jobId }
}

export async function uploadAndConvert(file, format) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('format', format);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { "x-api-key": API_KEY },
    body: formData
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to start upload conversion");
  }

  return response.json(); // returns { jobId }
}

export function subscribeToProgress(jobId, onUpdate, onError) {
  const eventSource = new EventSource(`${API_BASE_URL}/api/progress/${jobId}?x-api-key=${API_KEY}`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onUpdate(data);
    if (data.complete || data.error) {
      eventSource.close();
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE Error:", err);
    onError("Lost connection to server");
    eventSource.close();
  };

  return () => eventSource.close();
}