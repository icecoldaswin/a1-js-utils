function createStateSwitch(element, values, callback, defaultState) {
    const cssHref = 'https://icecoldaswin.github.io/a1-js-utils/state-switch-comp/state-switch.css';

    /**
     * Helper: Build the switch UI once CSS is ready
     */
    const initSwitch = () => {
        // Validate input element
        if (!(element instanceof HTMLElement)) {
            throw new Error('Invalid DOM element provided.');
        }

        // Validate values object
        if (!values || (typeof values !== 'object') || Object.keys(values).length < 2) {
            throw new Error('Invalid values provided.');
        }

        const valueKeys = Object.keys(values);

        if (valueKeys.length === 2) {
            /**
             * Case: Two values → rectangular switch (toggle)
             */
            const switchContainer = document.createElement('div');
            switchContainer.className = 'switch-container';

            const switchToggle = document.createElement('div');
            switchToggle.className = 'switch-toggle';
            switchContainer.appendChild(switchToggle);

            const switchDot = document.createElement('div');
            switchDot.className = 'switch-dot';
            switchToggle.appendChild(switchDot);

            const switchLabel = document.createElement('div');
            switchLabel.className = 'switch-label';
            switchLabel.innerHTML = values[defaultState]; // Set label based on default state
            switchContainer.appendChild(switchLabel);

            element.appendChild(switchContainer);

            // Initial state
            let active = defaultState === valueKeys[1];
            switchToggle.classList.toggle('active', active);

            // Dot position (support optional aria-dial-size)
            const dialSize = element.getAttribute('aria-dial-size');
            if (dialSize) {
                const dotPosition = active ? `calc(${dialSize} - 8px)` : '0';
                switchDot.style.left = dotPosition;
            } else {
                switchDot.style.left = active ? '8px' : '0';
            }

            // Handle click to toggle state
            switchContainer.addEventListener('click', () => {
                active = !active;
                switchToggle.classList.toggle('active', active);

                // Update dot position dynamically
                if (dialSize) {
                    const dotPosition = active ? `calc(${dialSize} - 8px)` : '0';
                    switchDot.style.left = dotPosition;
                } else {
                    switchDot.style.left = active ? '8px' : '0';
                }

                // Update label + trigger callback
                const currentValue = active ? valueKeys[1] : valueKeys[0];
                switchLabel.innerHTML = values[currentValue];
                callback(currentValue);
            });
        } else {
            /**
             * Case: More than two values → circular dial
             */
            const dialContainer = document.createElement('div');
            dialContainer.className = 'dial-container dial';

            // Size from aria-dial-size or default
            const dialSize = element.getAttribute('aria-dial-size') || '30px';
            dialContainer.style.width = dialSize;
            dialContainer.style.height = dialSize;

            // Dot inside the dial
            const dialDot = document.createElement('div');
            dialDot.className = 'dial-dot';
            dialContainer.appendChild(dialDot);

            // Display current value under the dial
            const selectedValueElement = document.createElement('div');
            selectedValueElement.className = 'selected-value';
            dialContainer.appendChild(selectedValueElement);

            // Rotation math
            const degreeIncrement = 360 / valueKeys.length;
            let currentDegree = 0;
            let currentIndex = valueKeys.indexOf(defaultState);

            // Helper: update rotation and label
            const updateDialRotation = () => {
                const degrees = (currentIndex / valueKeys.length) * 360;
                dialContainer.style.transform = `rotate(${degrees}deg)`;

                // Move dot slightly inside the perimeter
                const radians = (degrees * Math.PI) / 180;
                const radius = (dialContainer.clientWidth - 10) / 2 - 2;
                const x = radius * Math.cos(radians);
                const y = radius * Math.sin(radians);
                dialDot.style.transform = `translate(${x}px, ${y}px)`;

                // Update text label
                const currentValue = valueKeys[currentIndex];
                selectedValueElement.textContent = values[currentValue];
            };

            // Helper: smooth rotation effect
            const rotateDial = (degrees) => {
                currentDegree += degrees;
                dialContainer.style.transition = 'transform 0.3s ease';
                dialContainer.style.transform = `rotate(${currentDegree}deg)`;
            };

            // Move to next value (clockwise)
            const rotateClockwise = () => {
                currentIndex = (currentIndex + 1) % valueKeys.length;
                updateDialRotation();
                rotateDial(degreeIncrement);
                callback(valueKeys[currentIndex]);
            };

            // Move to previous value (counter-clockwise)
            const rotateCounterClockwise = () => {
                currentIndex = (currentIndex - 1 + valueKeys.length) % valueKeys.length;
                updateDialRotation();
                rotateDial(-degreeIncrement);
                callback(valueKeys[currentIndex]);
            };

            // Click left/right half of dial
            dialContainer.addEventListener('click', (event) => {
                const { clientX } = event;
                const { left, width } = dialContainer.getBoundingClientRect();
                if (clientX < left + width / 2) {
                    rotateCounterClockwise();
                } else {
                    rotateClockwise();
                }
            });

            element.appendChild(dialContainer);
            updateDialRotation();
        }
    };

    /**
     * Ensure CSS is loaded (safe check without touching cssRules)
     */
    let cssLink = document.querySelector(`link[rel="stylesheet"][href="${cssHref}"]`);

    if (!cssLink) {
        // Not in DOM yet → create it and wait for load
        cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = cssHref;
        cssLink.addEventListener('load', initSwitch, { once: true });
        document.head.appendChild(cssLink);
    } else {
        // Already present
        if (cssLink.sheet) {
            // Loaded → init immediately
            initSwitch();
        } else {
            // Still loading → wait
            cssLink.addEventListener('load', initSwitch, { once: true });
        }
    }
}
