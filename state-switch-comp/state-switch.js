function createStateSwitch(element, values, callback, defaultState) {
    // Create a link element for the CSS file
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'state-switch-comp/state-switch.css';
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

        const min = 0;
        const max = valueKeys.length - 1;
        let currentIndex = 0;

        if (typeof callback !== 'function') {
            throw Error('Invalid callback function provided.');
        }

        element.innerHTML = ''; // Clear any previous content

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
        // dialContainer.appendChild(selectedValueElement);

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
    };

    // Append the link element to the head of the document
    document.head.appendChild(cssLink);
}
