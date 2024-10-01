# Voice Diary

[Hosted Link](https://voice.tempel-alpha.ts.net)
 - User: `test`, Pass: `test`

The goal of this project was to recreate the IOS Voice Recorder tool, such that
it can be self-hosted! I also wanted to organize it into a calendar and start
diaring my life with voice. I really wanted to add whisper speech-to-text, but
unfortunately I ran out of time for this project after rewriting it so many
times (will be added in the future tho).

- __Challenges__: I again attempted and failed making this project in Rust (Leptos), rewrote it in SolidJS, and then finally scrapped everything and did it in Templ (Golang) again 🥰
 - Even though this has been an annoying process, it has taught me a lot about Rust and I feel
 much more confident making different types of webapps in Rust.
- __Authentication__: session cookies + SQL DB storage
- __CSS Framework__: DaisyUI (Tailwind)

## Technical Achievements
- Password hashing and salting
- Self hosted via Tailscale Funnel
- Authentication middleware, preventing unauthenticated users from accessing the service
- Restricted resource access: users can only see and modify their own recordings

## Screenshots

![Login](screenshots/login.png | width=100)
![Month](screenshots/month.png | width=100)
![Empty Day](screenshots/day_empty.png | width=100)
![Recording](screenshots/day_recording.png | width=100)
![Full Day](screenshots/day_full.png | width=100)

## Development

 1. Run Tailwind and Go serve processes (simultaneously):
```bash
npx tailwindcss -i ./assets/input.css -o ./assets/output.css --watch
cd src
templ generate && go run .
```
 2. Navigate to [http://localhost:8080](http://localhost:8080)
