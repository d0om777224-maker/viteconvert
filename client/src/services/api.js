const API_BASE_URL = "http://localhost:3001";

export async function startConversion(url, format, quality) {
  const response = await fetch(`${API_BASE_URL}/api/convert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url, format, quality })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to start conversion");
  }

  return response.json(); // returns { jobId }
}

export function subscribeToProgress(jobId, onUpdate, onError) {
  const eventSource = new EventSource(`${API_BASE_URL}/api/progress/${jobId}`);

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