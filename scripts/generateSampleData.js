const fs = require('fs');

// Track definition (Silverstone-like circuit)
const track = {
  length: 5.891, // km
  corners: [
    { x: 100, y: 0, speed: 280 },    // Start/Finish
    { x: 200, y: -50, speed: 150 },  // Turn 1
    { x: 300, y: -100, speed: 90 },  // Turn 2
    { x: 400, y: -80, speed: 200 },  // Turn 3
    { x: 500, y: -120, speed: 160 }, // Turn 4
    { x: 600, y: -50, speed: 280 },  // Back straight
    { x: 700, y: -80, speed: 140 },  // Turn 5
    { x: 600, y: -150, speed: 180 }, // Turn 6
    { x: 500, y: -200, speed: 220 }, // Turn 7
    { x: 400, y: -180, speed: 260 }, // Turn 8
    { x: 300, y: -150, speed: 180 }, // Turn 9
    { x: 200, y: -100, speed: 140 }, // Turn 10
    { x: 100, y: -50, speed: 200 },  // Final turn
  ]
};

// Car specifications (F1-like car)
const car = {
  maxSpeed: 340,          // km/h
  maxAccel: 2.5,         // g
  maxBrake: 5.0,         // g
  maxRPM: 15000,
  idleRPM: 4000,
  gears: 8,
  optimalShiftRPM: 14500,
};

function interpolatePoints(p1, p2, steps) {
  const points = [];
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    points.push({
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
      speed: p1.speed + (p2.speed - p1.speed) * t
    });
  }
  return points;
}

function generateLapData(lapNumber, variability = 0.02) {
  const data = [];
  let time = lapNumber * 80; // Start time for this lap
  const baseInterval = 0.1; // Data points every 0.1 seconds

  // Generate detailed track points
  let allPoints = [];
  for (let i = 0; i < track.corners.length; i++) {
    const p1 = track.corners[i];
    const p2 = track.corners[(i + 1) % track.corners.length];
    allPoints = [...allPoints, ...interpolatePoints(p1, p2, 20)];
  }

  // Generate data points
  allPoints.forEach((point, index) => {
    // Add some variability to make it realistic
    const variation = 1 + (Math.random() * 2 - 1) * variability;
    const speed = Math.max(0, Math.min(car.maxSpeed, point.speed * variation));
    
    // Calculate throttle and brake based on next corner
    const nextPoint = allPoints[(index + 1) % allPoints.length];
    const speedDiff = nextPoint.speed - speed;
    const throttle = speedDiff > 0 ? Math.min(1, Math.max(0, speedDiff / 50)) : 0;
    const brake = speedDiff < 0 ? Math.min(1, Math.max(0, -speedDiff / 50)) : 0;

    // Calculate RPM and gear
    const gear = Math.min(car.gears, Math.max(1, Math.ceil(speed / car.maxSpeed * car.gears)));
    const rpm = car.idleRPM + (car.maxRPM - car.idleRPM) * (speed / car.maxSpeed);

    // Generate tire data
    const tireTempBase = 80 + (speed / car.maxSpeed) * 20;
    const tirePressureBase = 26 + (speed / car.maxSpeed) * 2;

    data.push({
      Time: time.toFixed(3),
      Lap: lapNumber,
      Speed: speed.toFixed(1),
      X: point.x.toFixed(1),
      Y: point.y.toFixed(1),
      Throttle: throttle.toFixed(3),
      Brake: brake.toFixed(3),
      Gear: gear,
      RPM: Math.round(rpm),
      TireTempFL: (tireTempBase + Math.random() * 5).toFixed(1),
      TireTempFR: (tireTempBase + Math.random() * 5).toFixed(1),
      TireTempRL: (tireTempBase + Math.random() * 5).toFixed(1),
      TireTempRR: (tireTempBase + Math.random() * 5).toFixed(1),
      TirePressureFL: (tirePressureBase + Math.random() * 0.5).toFixed(2),
      TirePressureFR: (tirePressureBase + Math.random() * 0.5).toFixed(2),
      TirePressureRL: (tirePressureBase + Math.random() * 0.5).toFixed(2),
      TirePressureRR: (tirePressureBase + Math.random() * 0.5).toFixed(2),
    });

    time += baseInterval;
  });

  return data;
}

// Generate 5 laps of data
const allData = [];
for (let lap = 1; lap <= 5; lap++) {
  // Add more variability to first lap (cold tires) and less to later laps
  const variability = lap === 1 ? 0.05 : 0.02;
  allData.push(...generateLapData(lap, variability));
}

// Convert to CSV
const headers = Object.keys(allData[0]);
const csv = [
  headers.join(','),
  ...allData.map(row => headers.map(header => row[header]).join(','))
].join('\n');

// Write to file
fs.writeFileSync('sample_telemetry.csv', csv);
console.log('Generated sample telemetry data!'); 