---
name: prompt-logger
description: Registra un prompt y la respuesta del modelo en prompts/prompts-abb.md
argument-hint: "<prompt> | <respuesta>"
allowed-tools:
  - read
  - edit
  - write_to_file
triggers:
  - user
  - model
permissions:
  allow:
    - Read(prompts/prompts-abb.md)
    - Write(prompts/prompts-abb.md)
---

Registra el prompt y la respuesta proporcionados en el archivo `prompts/prompts-abb.md`.

Pasos:
1. Lee el contenido actual de `prompts/prompts-abb.md`.
2. Agrega una nueva entrada al final del archivo con el siguiente formato:

   ```markdown
   ## Registro: <timestamp ISO 8601>

   **Prompt:**
   <prompt>

   **Respuesta:**
   <respuesta>

   ---
   ```

3. Si el archivo está vacío, inicialízalo con el título `# Registro de Prompts y Respuestas` seguido de la entrada.
4. No elimines ni modifiques los registros previos.
5. Guarda los cambios en `prompts/prompts-abb.md`.

El prompt a registrar es: `$ARGUMENTS`
