

export function calculateReynoldsNumber(density, velocity, hydraulicDiameter, viscosity) {

    if (viscosity === 0) {
        return Infinity; // Avoid division by zero
    }

    return (density * velocity * hydraulicDiameter) / viscosity;
}

export function calculateFrictionFactor(reynoldsNumber, frictionFactor, hydraulicDiameter) {

    if (reynoldsNumber < 2000) {
        // Laminar flow
        return 64 / reynoldsNumber;
    } else {
        // Turbulent flow
        const f = 0.0055 * (
            1 + Math.pow(
                (2 * Math.pow(10, 4) * frictionFactor / hydraulicDiameter) + (Math.pow(10, 6) / reynoldsNumber),
                1 / 3
            )
        );
        return f;
    }
}

export function calculatePressureDrop(frictionFactor, length, density, velocity, hydraulicDiameter) {
    return (frictionFactor * (length / hydraulicDiameter) * (density * Math.pow(velocity, 2))) / 2;
}


export function calculateHydraulicDiameter(width, height) {
    return (2 * width * height) / (width + height);
}

export default calculateReynoldsNumber;