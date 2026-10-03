# Soundwave Studio

A local-first audio-reactive 3D studio built with Next.js, React, Three.js, and the Web Audio API.

## Run

Use Node.js 18.17 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000. For production, run `npm run build` then `npm start`.

## Create

- Select one of three original, synthesized 24-second demos.
- Upload audio by browsing or dragging a file onto the dashboard (50 MB maximum).
- Play, pause, seek, and adjust volume.
- Choose Liquid Bloom, Neon Knot, or Prism Garden, six colors, sensitivity, motion speed, wireframe, and particles. Bass expands the sculptures, mids drive surface motion, and treble animates orbiting details.
- Drag the preview to rotate the shape, or open the preview fullscreen.
- Export the animated 3D scene with audio as a video.

## Export behavior

Export restarts the current track and records the canvas at 30 FPS with audio. Recording takes the duration of the track. Keep the tab visible; background tabs may throttle rendering. Stop early to download a shorter clip.

The browser chooses a supported WebM or MP4 format. Chrome and Edge are recommended for capture support. Export requires WebGL, canvas capture, and MediaRecorder. Output dimensions match the preview canvas at the device pixel ratio (capped at 2). Export is a rendered video, not an editable 3D model. Visual settings and playback controls are locked during recording.

Audio decoding supports the formats available in your browser. MP3 and WAV are the most broadly compatible. Audio is processed on your device and is never uploaded to a server. Refreshing the page resets the session.

## Verification

`npm run build` checks compilation, TypeScript, and lint. Browser smoke checks during implementation covered WebGL rendering, demo selection, play/pause, upload decoding and errors, natural playback completion, video downloads, and mobile overflow.

The old components remain in `app/components` for reference; the dashboard uses `Visualizer.tsx` and `audio.ts`.
