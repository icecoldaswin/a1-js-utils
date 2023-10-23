function createStateSwitch(element, values, callback, defaultState) {
    // Create a link element for the CSS file
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://icecoldaswin.github.io/a1-js-utils/state-switch-comp/state-switch.css';
    // Append the link element to the head of the document
    document.head.appendChild(cssLink);

    cssLink.onload = function () {
        if (!(element instanceof HTMLElement)) {
            throw new Error('Invalid DOM element provided.');
        }

        if (!values || (typeof values !== 'object') || Object.keys(values).length < 2) {
            throw new Error('Invalid values provided.');
        }

        const valueKeys = Object.keys(values);

        if (valueKeys.length === 2) {
            // Create a rectangular switch with rounded edges
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
            switchLabel.textContent = values[valueKeys[0]]; // Set the initial label
            switchContainer.appendChild(switchLabel);

            element.appendChild(switchContainer);

            // Set the initial state based on the defaultState parameter
            let active = defaultState === valueKeys[1];
            switchToggle.classList.toggle('active', active);

            // Set the dot's initial position
            switchDot.style.left = active ? '8px' : '0';

            switchContainer.addEventListener('click', () => {
                active = !active;
                switchToggle.classList.toggle('active', active);

                // Move the dot left or right
                switchDot.style.left = active ? '8px' : '0';

                const currentValue = active ? valueKeys[1] : valueKeys[0];
                switchLabel.textContent = values[currentValue];
                callback(currentValue);
            });
        } else {
            // Create a circular dial
            const dialContainer = document.createElement('div');
            dialContainer.className = 'dial-container dial'; // Add a class

            // Set the dial size based on the aria-dial-size attribute or use default
            const dialSize = element.getAttribute('aria-dial-size') || '30px'; // Slightly larger size
            dialContainer.style.width = dialSize;
            dialContainer.style.height = dialSize;

            // Add a dot element inside the dial container
            const dialDot = document.createElement('div');
            dialDot.className = 'dial-dot';
            dialContainer.appendChild(dialDot);

            // Create an element to display the selected value underneath the dial
            const selectedValueElement = document.createElement('div');
            selectedValueElement.className = 'selected-value';
            dialContainer.appendChild(selectedValueElement);

            // Calculate the degree increment based on the number of stops
            const degreeIncrement = 360 / valueKeys.length;
            let currentDegree = 0;

            // Calculate the initial rotation position based on the default state
            currentIndex = valueKeys.indexOf(defaultState);

            // Update the dial rotation based on the current index
            const updateDialRotation = () => {
                const degrees = (currentIndex / max) * 360;
                dialContainer.style.transform = `rotate(${degrees}deg)`;

                // Move the dot 2px within the perimeter of the dial
                const radians = (degrees * Math.PI) / 180;
                const radius = (dialContainer.clientWidth - 10) / 2 - 2; // Move the dot 2px inside the circle
                const x = radius * Math.cos(radians);
                const y = radius * Math.sin(radians);
                dialDot.style.transform = `translate(${x}px, ${y}px)`;

                // Update the selected value text
                const currentValue = valueKeys[currentIndex];
                selectedValueElement.textContent = values[currentValue];
            };

            const rotateDial = (degrees) => {
                currentDegree += degrees;
                const transformValue = `rotate(${currentDegree}deg)`;
                dialContainer.style.transition = 'transform 0.3s ease'; // Add a transition effect
                dialContainer.style.transform = transformValue;
            };

            const rotateClockwise = () => {
                currentIndex = (currentIndex + 1) % valueKeys.length;
                updateDialRotation();
                const degrees = degreeIncrement;
                rotateDial(degrees);
                const currentValue = valueKeys[currentIndex];
                callback(currentValue);
            };

            const rotateCounterClockwise = () => {
                currentIndex = (currentIndex - 1 + valueKeys.length) % valueKeys.length;
                updateDialRotation();
                const degrees = -degreeIncrement;
                rotateDial(degrees);
                const currentValue = valueKeys[currentIndex];
                callback(currentValue);
            };

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
            element.appendChild(selectedValueElement);
            updateDialRotation();
        }
    };

    // Append the link element to the head of the document
    document.head.appendChild(cssLink);
}
