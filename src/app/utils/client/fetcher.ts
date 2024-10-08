// Define the fetcher function for SWR
export const fetcher = async (url: string, body: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch");
  }

  const data = await response.json();
  return data.result;
};
