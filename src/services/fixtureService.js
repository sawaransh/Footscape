export async function getFixtures() {
  const response = await fetch(
    "http://localhost:8000/api/fixtures"
  );

  const data = await response.json();

  return data;
}