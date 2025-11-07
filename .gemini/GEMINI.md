## Gemini Added Memories
- After every code modification, I must run a build or test command in the shell. Then, I must ask the user to manually test the application and provide the logcat results.
- The project uses a single application.properties file for all configurations, including secrets. This file is listed in .gitignore and is not committed to the repository. The application-local.properties file is not used.
- **Do not arbitrarily import things you think are missing. Explicitly check for the existence of files before importing them.**