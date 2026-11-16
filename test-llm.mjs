import { complete } from "./src/model-client.mjs";

try {
  const result = await complete([
    {
      role: "user",
      content: "Привет! Представься как AI Financial Assistant."
    }
  ]);

  console.log("Ответ модели:");
  console.log(result.text);
} catch (error) {
  console.error("Ошибка:", error.message);
}