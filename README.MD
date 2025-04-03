# Creativity and Aesthetics of Data and AI

This repository contains some of the tools used during the aesthetic experience presentation presented on 03/04/2025 for the course "Creativity and Aesthetics of Data and AI. It contains 2 prototypes used by the audience and a third tool(Soundboard) used by the presenters during the presentation. See the descriptions below for a more detailled explanation.

### How to use:
Simply download the code and open the html file in your browser for any of the three prototypes. Or if you have the VSCode live server plugin installed, right click the html file and click 'Open with live server'.

# Descriptions:
This document contains a brief description of the prototypes made for the experience
___
Prototype 1:
This prototype is presented as a software piece of the AiBPO solutions company. It is a real-time object detection interface that uses TensorFlow.js and the COCO-SSD model to identify objects in a live video feed. The interface features a minimal design with a full-screen detection canvas and a glitch effect that intensifies over time when no person is detected. If a person is absent for a set duration, the system triggers an alert using visual distortions and, if supported, device vibrations. This prototype is presented as part of the attention (FIX)ation procedure, and intents for people to focus on the presentation while glitching and vibrating when looking away. 
___
Prototype 2:
This prototype is presented as an emergency software piece of the AiBPO solutions company. This prototype is an **interactive real-time object detection experience** that progressively **degrades over time**, creating an unsettling transformation from a normal task into a corrupted system failure.

Core Features
- **Real-Time Object Detection:** Uses a webcam and TensorFlow's COCO-SSD model to identify objects in the environment.
- **Item Collection Challenge:** The user is prompted to find specific objects, starting with "person," "remote," and "cell phone."
- **Dynamic Instructions & Progression:** The challenge updates over time, introducing new objects to find.

Visual & Audio Transformation
The experience begins as a simple detection task but soon **descends into chaos**:
1. **Initial State – Orderly & Functional**
    - The interface welcomes the user and prompts them to start the challenge -> Inspired by old computer terminals. 
    - The webcam feed is displayed in full-screen mode, with detected objects outlined in **red bounding boxes**.
    - The UI provides feedback (in the form of a white flash on the screen), and **normal notification sounds** (dings and pings) play when an object is found.
2. **Gradual Corruption – Subtle Distortions Appear** _(~30s–2 min)_
    - Normal sounds **begin disappearing one by one**.
    - **Glitchy and distorted sounds** are introduced.
    - Intermittent **"MORE"** messages flashes on the screen.
3. **System Breakdown – Full Corruption** _(~2–3 min)_
    - All normal sounds are **gone**, leaving only distorted and eerie notification noises.
    - The UI starts malfunctioning, ending with the **error overlay appearing**:
        - _“SYSTEM ERROR – A fatal error has occurred.”_    
    - Audio is completely **disabled** (~2.5 min), reinforcing the sense of collapse.
___
Prototype 3 - Sound board:
To make the aesthetic experience a smooth exercise, we also developed a soundboard for the presentation. It allows us to set the time, the individual volume of each audio and reset audios. This control was nice to emphasize certain sounds and play others at the same time. The sounds included are error messages, phone calls, corporate music, etc. 



___
Footnote: Safari browser on iPhone does not function so well with the prototypes, safari likes to be safe, so vibration from a website is not possible, and it also appeared to block the audio in some devices unfortunately.