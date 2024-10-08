// Function to convert cents to SOL based on SOL price
export const convertCentsToSOL = (cents: number, solPriceInUSD: number) => {
  const usd = cents / 100; // Convert cents to USD
  const sol = usd / solPriceInUSD; // Convert USD to SOL
  return sol;
};
