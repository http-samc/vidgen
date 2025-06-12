# TODO:

- Create Hono API
  Allow either uuid for auth OR api key

Preset = Character[] & backgroundVideo (url) & backgroundBlur & delay (table)

Character: (img, name, voiceId, position = "left" | "right", width, role = "teacher" | "student")

- /jobs :POST
  - PresetId/Name, Prompt (string)
- /jobs/:uuid
  - Progress
  - Status
  - Name?
  - URL
