export const getRandomPrice = (min: number, max: number): number => {
  const randomNumber = Math.random() * (max - min) + min;
  return Math.floor(randomNumber * 100) / 100;
};
