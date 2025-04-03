let model;
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const startButton = document.getElementById('startButton');
        const title = document.getElementById('title');

        const hurrayAudio = document.getElementById('hurrayAudio'); // Get the audio element

        const port = document.getElementById('portal')
        const port1 = document.getElementById('portal1')

        const overlay = document.getElementById('overlay');

        // Variables for person detection alerting.
        let lastPersonTime = Date.now();
        let personInView = false;
        let alarmInterval = null;

        const itemsToFind = ["person", "remote", "cell phone"];
        let currentItems = [];
        let currentIndex = 0;

        function updateTitle() {
            currentIndex = Math.min(currentIndex + 1, itemsToFind.length);
            currentItems = itemsToFind.slice(0, currentIndex);
            title.innerText = `FIND ${currentItems.join(', ')}!`;
        }

        function startItemSequence() {
            updateTitle();
            let interval = setInterval(() => {
                if (currentIndex < itemsToFind.length) {
                    updateTitle();
                } else {
                    clearInterval(interval);
                }
            }, 30000);
        }

        // Set up the webcam feed with improved resolution constraints.
        async function setupCamera() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: false
                });
                video.srcObject = stream;
                return new Promise(resolve => {
                    video.onloadedmetadata = () => resolve(video);
                });
            } else {
                alert("Webcam not available.");
            }
        }

        // Adjust canvas size to fill the window and set the proper drawing scale.
        function adjustCanvasSize() {
            const dpr = window.devicePixelRatio || 1;
            const width = window.innerWidth;
            const height = window.innerHeight;
            [canvas].forEach(c => {
                c.width = width * dpr;
                c.height = height * dpr;
                c.style.width = width + "px";
                c.style.height = height + "px";
            });
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            //glitchCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        // 2 seconds cooldown
        const lastPlayedMap = new Map(); // Stores last played timestamp for each object
        function getRandomCooldown() {
            return Math.floor(Math.random() * (3000 - 800 + 1)) + 1500; // Random between 800-2000 ms
        }

        function playAudioForObject(objectClass) {
            if (audioDisabled) {
                console.warn("Audio playback is disabled.");
                return;
            }
            const now = Date.now();
            const cooldown = getRandomCooldown(); // Generate a new cooldown on each detection

            if (!lastPlayedMap.has(objectClass) || now - lastPlayedMap.get(objectClass) > cooldown) {
                if (audioPool.length === 0) {
                    console.warn("No audios available to play.");
                    return;
                }
                // getRandomInt returns a number from 0 (inclusive) to audioPool.length (exclusive)
                let randomIndex = getRandomInt(0, audioPool.length);
                console.log("Random index:", randomIndex);
                const audio = new Audio(audioPool[randomIndex]);
                audio.play();
                lastPlayedMap.set(objectClass, now); // Update last played time
                console.log("Audio played for", objectClass);

                // Show the overlay momentarily
                overlay.style.display = "block";
                setTimeout(() => overlay.style.display = "none", 300);
            }
        }

        // Draw the video feed using a "cover" crop and draw bounding boxes.
        function drawFrame(predictions) {
            if (!video.videoWidth || !video.videoHeight) return;
            const canvasWidth = window.innerWidth;
            const canvasHeight = window.innerHeight;
            const videoAspect = video.videoWidth / video.videoHeight;
            const canvasAspect = canvasWidth / canvasHeight;
            let sx, sy, sWidth, sHeight;

            let foundItems = [];

            // Determine crop region from the video for "cover" style:
            if (canvasAspect > videoAspect) {
                // The canvas is wider than the video:
                sWidth = video.videoWidth;
                sHeight = video.videoWidth / canvasAspect;
                sx = 0;
                sy = (video.videoHeight - sHeight) / 2;
            } else {
                // The canvas is taller than the video:
                sHeight = video.videoHeight;
                sWidth = video.videoHeight * canvasAspect;
                sy = 0;
                sx = (video.videoWidth - sWidth) / 2;
            }
            // Draw the cropped video feed to fill the entire canvas.
            ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);

            // Draw bounding boxes:
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.font = "18px Arial";
            predictions.forEach(prediction => {
                if (prediction.score < 0.5) return;
                if (currentItems.includes(prediction.class) && !foundItems.includes(prediction.class)) {
                    // foundItems.push(prediction.class);
                    // console.log(`Hurray! Found: ${prediction.class}`);
                    // // hurrayAudio.play();
                    // const sound = new Audio('ding-101492.mp3');
                    // sound.play();

                    if (currentItems.includes(prediction.class)) {
                        playAudioForObject(prediction.class); // Play sound with cooldown check
                    }
                }
                // Get box coordinates relative to the video.
                const [x, y, width, height] = prediction.bbox;
                // Adjust coordinates relative to the crop.
                const adjX = x - sx;
                const adjY = y - sy;
                // Scale factors from video crop to canvas.
                const scaleX = canvasWidth / sWidth;
                const scaleY = canvasHeight / sHeight;
                // Transformed bounding box on the canvas.
                const boxX = adjX * scaleX;
                const boxY = adjY * scaleY;
                const boxWidth = width * scaleX;
                const boxHeight = height * scaleY;
                ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
                ctx.fillStyle = 'red';
                ctx.fillText(
                    `${prediction.class} ${(prediction.score * 100).toFixed(1)}%`,
                    boxX,
                    boxY > 10 ? boxY - 5 : 10
                );
            });
        }

        // Check predictions for a person.
        function checkPersonDetection(predictions) {
            const personDetected = predictions.some(prediction =>
                prediction.class === 'person' && prediction.score > 0.5
            );
            const now = Date.now();
            if (personDetected) {
                if (!personInView) console.log("Person In view!");
                personInView = true;
                lastPersonTime = now;
            }
        }

        // Run object detection and drawing on each frame.
        async function detectFrame() {
            const predictions = await model.detect(video);
            drawFrame(predictions);
            checkPersonDetection(predictions);
            requestAnimationFrame(detectFrame);
        }

        // Main function: set up camera, canvas, load model, and start detection.
        async function main() {
            await setupCamera();
            adjustCanvasSize();
            video.play();
            video.onloadedmetadata = () => {
                //adjustCanvasSize();
            };
            window.addEventListener('resize', adjustCanvasSize);
            model = await cocoSsd.load();
            console.log('COCO-SSD model loaded.');
            detectFrame();
            startItemSequence();
        }

        // Start detection on user click.
        startButton.addEventListener('click', () => {
            startButton.style.display = 'none';
            port.style.display = 'none';
            port1.style.display = 'none';
            title.style.display = 'flex';
            main();
        });

        // Global audio lists
        let baseAudios = [
            "ding.mp3",
            "discord extra slow.mp3",
            "Discord ping slow.mp3",
            "Discord Ping Sound Effect.mp3",
            "sharp ping.mp3"
        ];
        let extraAudios = [
            "Distored Discord.mp3",
            "long distored discord.mp3"
        ];

        // The pool used by the function – initially only base audios.
        let audioPool = [...baseAudios];

        let audioDisabled = false;

        // Utility function to generate a random integer in [min, max)
        function getRandomInt(min, max) {
            const minCeiled = Math.ceil(min);
            const maxFloored = Math.floor(max);
            return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
        }

        // Function to remove a specific audio file from the audioPool
        function removeAudioFile(fileName) {
            const index = audioPool.indexOf(fileName);
            if (index > -1) {
                audioPool.splice(index, 1);
                console.log(`Removed ${fileName} from the pool.`);
            }
        }

        // Schedule adding the extra audios at 1 minute (60000 ms)
        setTimeout(() => {
            audioPool.push(...extraAudios);
            console.log("Extra audios added:", extraAudios);
        }, 60000);

        // Schedule gradual removal of base audios over time.
        // Adjust the times (in milliseconds) and filenames as needed.
        setTimeout(() => removeAudioFile("discord extra slow.mp3"), 30000);                   // at 30 seconds
        setTimeout(() => removeAudioFile("Discord ping slow.mp3"), 50000);       // at 80 seconds
        setTimeout(() => removeAudioFile("Discord Ping Sound Effect.mp3"), 80000);         // at 100 seconds
        setTimeout(() => removeAudioFile("sharp ping.mp3"), 110000); // at 140 seconds
        setTimeout(() => removeAudioFile("ding.mp3"), 120000);                // at 120 seconds

        // After 3 minutes (180000 ms), only extra audios should remain (if all removals worked as planned)
        setTimeout(() => {
            console.log("Final audio pool:", audioPool);
        }, 121000);

        setTimeout(() => {
            audioDisabled = true;
            console.log("Audio playback disabled.");
            document.getElementById("errorOverlay").style.display = "block";
        }, 150000);

        setTimeout(() => {
            function flashMoreText() {
                const moreText = document.getElementById("moreText");
                moreText.style.display = "block"; // Show text
                setTimeout(() => {
                    moreText.style.display = "none"; // Hide after 0.4s
                }, 400);
            }

            function startFlashing() {
                flashMoreText();
                const nextInterval = getRandomInt(8000, 10000); // Random 8-10s
                setTimeout(startFlashing, nextInterval); // Schedule next flash
            }

            startFlashing(); // Begin flashing "MORE"
        }, 80000); // Start after 2 minutes