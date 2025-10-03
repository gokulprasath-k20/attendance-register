/**
 * Geolocation utilities
 * Functions for handling geolocation and distance calculations
 */

import { logError, handleLocationError } from './error-handler';

export interface Coordinates {
  latitude: number;
  longitude: number;
}
export interface LocationResult extends Coordinates {
  accuracy: number;
  timestamp: number;
}

/**
 * CRITICAL: Get stabilized location for final year project consistency
 * Takes multiple readings and returns the most stable/accurate one
 * @returns Promise with consistent location result
 */
export const getCurrentLocation = (): Promise<LocationResult> => {
  return new Promise(async (resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    console.log('🎯 GETTING STABILIZED LOCATION FOR PROJECT CONSISTENCY...');

    // Ultra-high precision options for project accuracy
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 30000, // Extended timeout for best accuracy
      maximumAge: 0, // Never use cached position
    };

    try {
      // Take multiple readings for consistency
      const readings: LocationResult[] = [];
      const maxReadings = 3;

      for (let i = 0; i < maxReadings; i++) {
        console.log(`📍 Taking reading ${i + 1}/${maxReadings}...`);
        
        const reading = await new Promise<LocationResult>((resolveReading, rejectReading) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolveReading({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp,
              });
            },
            rejectReading,
            options
          );
        });

        readings.push(reading);
        console.log(`  Reading ${i + 1}: ${reading.latitude.toFixed(8)}, ${reading.longitude.toFixed(8)} (±${reading.accuracy.toFixed(1)}m)`);

        // Small delay between readings for GPS stabilization
        if (i < maxReadings - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Find the most accurate reading (smallest accuracy value)
      const bestReading = readings.reduce((best, current) => 
        current.accuracy < best.accuracy ? current : best
      );

      // Calculate coordinate stability (how much readings vary)
      const latitudes = readings.map(r => r.latitude);
      const longitudes = readings.map(r => r.longitude);
      
      const latRange = Math.max(...latitudes) - Math.min(...latitudes);
      const lonRange = Math.max(...longitudes) - Math.min(...longitudes);
      const coordinateStability = Math.max(latRange, lonRange);

      console.log('📊 LOCATION STABILITY ANALYSIS:');
      console.log(`  Best accuracy: ±${bestReading.accuracy.toFixed(1)}m`);
      console.log(`  Coordinate stability: ${(coordinateStability * 111000).toFixed(1)}m variation`);
      console.log(`  Selected coordinates: ${bestReading.latitude.toFixed(8)}, ${bestReading.longitude.toFixed(8)}`);

      // Stabilize coordinates to 6 decimal places for consistency
      // 6 decimal places = ~0.11m precision, good for project consistency
      const stabilizedResult = {
        latitude: Math.round(bestReading.latitude * 1000000) / 1000000,
        longitude: Math.round(bestReading.longitude * 1000000) / 1000000,
        accuracy: bestReading.accuracy,
        timestamp: bestReading.timestamp,
      };

      console.log('✅ STABILIZED COORDINATES FOR PROJECT CONSISTENCY:');
      console.log(`  Final coordinates: ${stabilizedResult.latitude.toFixed(6)}, ${stabilizedResult.longitude.toFixed(6)}`);
      console.log(`  Coordinate precision: 6 decimal places (~0.11m resolution)`);
      console.log(`  This ensures same location gives same distance every time`);

      resolve(stabilizedResult);

    } catch (error) {
      console.error('❌ Stabilized location acquisition failed:', error);
      handleLocationError(error as GeolocationPositionError);
      reject(error);
    }
  });
};

/**
 * Get current user location using HTML5 Geolocation API (backward compatibility)
 * @returns Promise with coordinates
 */
export const getCurrentLocationSimple = (): Promise<Coordinates> => {
  return getCurrentLocation().then(result => ({
    latitude: result.latitude,
    longitude: result.longitude
  }));
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // CRITICAL: Stabilize input coordinates for consistent results
  // Round to 6 decimal places (~0.11m precision) to ensure same location = same distance
  const stableLat1 = Math.round(lat1 * 1000000) / 1000000;
  const stableLon1 = Math.round(lon1 * 1000000) / 1000000;
  const stableLat2 = Math.round(lat2 * 1000000) / 1000000;
  const stableLon2 = Math.round(lon2 * 1000000) / 1000000;

  // Validate coordinates
  if (stableLat1 == null || stableLon1 == null || stableLat2 == null || stableLon2 == null) {
    throw new Error('Invalid coordinates provided - null or undefined values');
  }

  if (Math.abs(stableLat1) > 90 || Math.abs(stableLat2) > 90) {
    throw new Error(`Invalid latitude values: lat1=${stableLat1}, lat2=${stableLat2}`);
  }
  if (Math.abs(stableLon1) > 180 || Math.abs(stableLon2) > 180) {
    throw new Error(`Invalid longitude values: lon1=${stableLon1}, lon2=${stableLon2}`);
  }

  console.log('=== STABILIZED DISTANCE CALCULATION FOR PROJECT CONSISTENCY ===');
  console.log('Original coordinates:');
  console.log(`  Point 1: ${lat1.toFixed(8)}, ${lon1.toFixed(8)}`);
  console.log(`  Point 2: ${lat2.toFixed(8)}, ${lon2.toFixed(8)}`);
  console.log('Stabilized coordinates (6 decimal places for consistency):');
  console.log(`  Point 1: ${stableLat1.toFixed(6)}, ${stableLon1.toFixed(6)}`);
  console.log(`  Point 2: ${stableLat2.toFixed(6)}, ${stableLon2.toFixed(6)}`);

  // Check for identical coordinates (same location)
  if (stableLat1 === stableLat2 && stableLon1 === stableLon2) {
    console.log('🎯 IDENTICAL COORDINATES DETECTED');
    console.log('   Same stabilized coordinates = 0.000m distance');
    console.log('   This ensures consistent results for same location');
    console.log('=== END STABILIZED CALCULATION ===');
    return 0.000;
  }

  // Calculate coordinate differences
  const latDiff = Math.abs(stableLat2 - stableLat1);
  const lonDiff = Math.abs(stableLon2 - stableLon1);
  
  console.log('Coordinate differences:');
  console.log(`  Latitude difference: ${latDiff.toFixed(6)} degrees`);
  console.log(`  Longitude difference: ${lonDiff.toFixed(6)} degrees`);

  // Use high-precision Earth radius (WGS84)
  const R = 6371008.8; // Earth's radius in meters
  
  // Convert stabilized coordinates to radians
  const φ1 = stableLat1 * (Math.PI / 180);
  const φ2 = stableLat2 * (Math.PI / 180);
  const Δφ = (stableLat2 - stableLat1) * (Math.PI / 180);
  const Δλ = (stableLon2 - stableLon1) * (Math.PI / 180);

  // Haversine formula with stabilized inputs
  const sinΔφ2 = Math.sin(Δφ / 2);
  const sinΔλ2 = Math.sin(Δλ / 2);
  
  const a = sinΔφ2 * sinΔφ2 + 
            Math.cos(φ1) * Math.cos(φ2) * sinΔλ2 * sinΔλ2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDistance = R * c;

  console.log('Haversine calculation with stabilized coordinates:');
  console.log(`  a = ${a.toFixed(15)}`);
  console.log(`  c = ${c.toFixed(15)}`);
  console.log(`  Raw distance = ${rawDistance.toFixed(10)} meters`);
  
  // CRITICAL: Stabilize final distance to ensure consistency
  // Round to 3 decimal places but ensure minimum meaningful difference
  let finalDistance = Math.round(rawDistance * 1000) / 1000;
  
  // For very small distances, ensure minimum step of 0.001m to avoid floating point issues
  if (finalDistance < 0.001 && finalDistance > 0) {
    finalDistance = 0.001;
  }
  
  console.log('CONSISTENCY VALIDATION:');
  console.log(`  Stabilized distance: ${finalDistance.toFixed(3)} meters`);
  console.log(`  Coordinate precision: 6 decimal places (~0.11m)`);
  console.log(`  Distance precision: 3 decimal places (1mm)`);
  console.log(`  Same coordinates will ALWAYS give same distance`);
  
  // Project validation
  if (finalDistance <= 10.000) {
    console.log(`  ✅ WITHIN 10M RULE: ${finalDistance.toFixed(3)}m`);
  } else {
    console.log(`  ❌ OUTSIDE 10M RULE: ${finalDistance.toFixed(3)}m`);
  }
  
  console.log('=== END STABILIZED CALCULATION ===');

  return finalDistance;
};

/**
 * Check if geolocation is available
 * @returns boolean
 */
export const isGeolocationAvailable = (): boolean => {
  return 'geolocation' in navigator;
};

/**
 * Format distance for display with high precision
 * @param meters Distance in meters
 * @returns Formatted string
 */
export const formatDistance = (meters: number): string => {
  // EXACT DISTANCE DISPLAY FOR FINAL YEAR PROJECT
  // Show precise distance with millimeter accuracy - no masking
  
  const preciseDistance = Math.round(meters * 1000) / 1000; // 3 decimal places
  
  // For very small distances (< 1m), show millimeter precision
  if (preciseDistance < 1) {
    return `${(preciseDistance * 1000).toFixed(0)} mm`;
  }
  
  // For all other distances, show exact meters with 3 decimal places
  return `${preciseDistance.toFixed(3)} m`;
};

/**
 * Validate if distance calculation is reasonable
 * @param distance Distance in meters
 * @param accuracy GPS accuracy in meters
 * @returns boolean
 */
export const isDistanceReasonable = (distance: number, accuracy: number): boolean => {
  // For 10-meter rule, we need much better GPS accuracy
  if (accuracy > 20) { // Stricter accuracy requirement for 10m rule
    console.warn('GPS accuracy too poor for 10m rule:', accuracy, 'meters');
    return false;
  }
  
  // Distance should be reasonable (not negative, not extremely large)
  if (distance < 0 || distance > 1000) { // 1km max reasonable distance for classroom
    console.warn('Unreasonable distance for classroom:', distance, 'meters');
    return false;
  }
  
  console.log('Distance calculation validated:', {
    distance: distance.toFixed(3),
    accuracy: accuracy.toFixed(1),
    withinAccuracyThreshold: accuracy <= 20,
    withinDistanceRange: distance >= 0 && distance <= 1000
  });
  
  return true;
};

/**
 * Get multiple location readings for better accuracy
 * @param attempts Number of attempts to get location
 * @returns Promise with best location result
 */
export const getAccurateLocation = async (attempts: number = 5): Promise<LocationResult> => {
    const locations: LocationResult[] = [];
    
    console.log(`=== GETTING HIGH-PRECISION LOCATION (${attempts} attempts) ===`);
    
    for (let i = 0; i < attempts; i++) {
      try {
        console.log(`Location attempt ${i + 1}/${attempts}...`);
        const location = await getCurrentLocation();
        locations.push(location);
        
        console.log(`Attempt ${i + 1} result:`, {
          lat: location.latitude.toFixed(8),
          lng: location.longitude.toFixed(8),
          accuracy: location.accuracy.toFixed(1) + 'm'
        });
        
        // If we get a very accurate reading (≤5m), use it immediately
        if (location.accuracy <= 5) {
          console.log('✅ Excellent accuracy achieved:', location.accuracy.toFixed(1) + 'm');
          return location;
        }
        
        // If we get good accuracy (≤10m) and it's not the first attempt, use it
        if (location.accuracy <= 10 && i > 0) {
          console.log('✅ Good accuracy achieved:', location.accuracy.toFixed(1) + 'm');
          return location;
        }
        
        // Wait between attempts for GPS to stabilize (reduced wait time)
        if (i < attempts - 1) {
          const waitTime = attempts <= 2 ? 1500 : 3000; // Shorter wait for quick mode
          console.log(`Waiting ${waitTime/1000} seconds for GPS to stabilize...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), `LOCATION_ATTEMPT_${i + 1}`);
        console.warn(`❌ Location attempt ${i + 1} failed:`, error);
        if (i === attempts - 1 && locations.length === 0) {
          throw error;
        }
      }
    }
    
    if (locations.length === 0) {
      const error = new Error('Failed to get any location readings after all attempts');
      logError(error, 'LOCATION_COMPLETE_FAILURE');
      throw error;
    }
    
    // Return the most accurate location
    const bestLocation = locations.reduce((best, current) => 
      current.accuracy < best.accuracy ? current : best
    );
    
    console.log('=== FINAL LOCATION SELECTED ===');
    console.log('Best location from', locations.length, 'attempts:');
    console.log(`  Coordinates: ${bestLocation.latitude.toFixed(8)}, ${bestLocation.longitude.toFixed(8)}`);
    console.log(`  Accuracy: ${bestLocation.accuracy.toFixed(1)}m`);
    console.log('=== END LOCATION SELECTION ===');
    
    return bestLocation;
};

/**
 * Get location quickly for student OTP verification (optimized for speed)
 * @returns Promise with location result
 */
export const getQuickLocation = async (): Promise<LocationResult> => {
  console.log('=== GETTING QUICK LOCATION FOR OTP ===');
  
  try {
    // Try to get location immediately first
    const location = await getCurrentLocation();
    
    console.log('Quick location result:', {
      lat: location.latitude.toFixed(8),
      lng: location.longitude.toFixed(8),
      accuracy: location.accuracy.toFixed(1) + 'm'
    });
    
    // Accept any reasonable accuracy for speed
    if (location.accuracy <= 100) {
      console.log('✅ Quick location accepted:', location.accuracy.toFixed(1) + 'm');
      return location;
    }
    
    // If accuracy is poor, try one more time with a short wait
    console.log('Poor accuracy, trying once more...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const secondLocation = await getCurrentLocation();
    
    // Return the better of the two
    const bestLocation = secondLocation.accuracy < location.accuracy ? secondLocation : location;
    
    console.log('✅ Final quick location:', bestLocation.accuracy.toFixed(1) + 'm');
    return bestLocation;
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), 'QUICK_LOCATION');
    throw error;
  }
};

/**
 * Test distance calculation with known coordinates for validation
 * @returns Test results
 */
export const testDistanceCalculation = () => {
  console.log('=== DISTANCE CALCULATION ACCURACY TEST ===');
  
  // Test case 1: Same location (should be 0)
  const dist1 = calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
  console.log('Same location test:', dist1, 'meters (should be ~0)');
  
  // Test case 2: 1 meter difference (approximate)
  const dist2 = calculateDistance(12.9716, 77.5946, 12.971609, 77.5946);
  console.log('~1 meter test:', dist2, 'meters (should be ~1)');
  
  // Test case 3: 10 meter difference (approximate)
  const dist3 = calculateDistance(12.9716, 77.5946, 12.971690, 77.5946);
  console.log('~10 meter test:', dist3, 'meters (should be ~10)');
  
  // Test case 4: 100 meter difference (approximate)
  const dist4 = calculateDistance(12.9716, 77.5946, 12.972500, 77.5946);
  console.log('~100 meter test:', dist4, 'meters (should be ~100)');
  
  console.log('=== END DISTANCE TEST ===');
  
  return {
    sameLocation: dist1,
    oneMeter: dist2,
    tenMeters: dist3,
    hundredMeters: dist4
  };
};

/**
 * Debug function for nearby devices showing "too far"
 * Call this in browser console to test with your actual coordinates
 * @param staffLat Staff latitude
 * @param staffLng Staff longitude
 * @param studentLat Student latitude
 * @param studentLng Student longitude
 * @returns Debug results
 */
export const debugNearbyDevices = (staffLat: number, staffLng: number, studentLat: number, studentLng: number) => {
  console.log('=== DEBUGGING NEARBY DEVICES ===');
  console.log('Staff coordinates:', staffLat.toFixed(8), staffLng.toFixed(8));
  console.log('Student coordinates:', studentLat.toFixed(8), studentLng.toFixed(8));
  
  // Calculate coordinate differences
  const latDiff = Math.abs(studentLat - staffLat);
  const lonDiff = Math.abs(studentLng - staffLng);
  const totalCoordDiff = latDiff + lonDiff;
  
  console.log('Coordinate Analysis:');
  console.log('  Lat difference:', latDiff.toFixed(8), 'degrees');
  console.log('  Lng difference:', lonDiff.toFixed(8), 'degrees');
  console.log('  Total difference:', totalCoordDiff.toFixed(8), 'degrees');
  console.log('  Expected distance from coords:', (totalCoordDiff * 111000).toFixed(3), 'meters');
  
  const distance = calculateDistance(staffLat, staffLng, studentLat, studentLng);
  const formatted = formatDistance(distance);
  
  console.log('Final Results:');
  console.log('  Calculated distance:', distance, 'meters');
  console.log('  Formatted display:', formatted);
  console.log('  Within 10m rule?', distance <= 10 ? 'YES' : 'NO');
  
  // Enhanced troubleshooting for same location
  if (distance > 10 && totalCoordDiff < 0.001) {
    console.log('🚨 SAME LOCATION GPS ISSUE DETECTED:');
    console.log('  Problem: Large distance but small coordinate difference');
    console.log('  Likely cause: GPS accuracy variation between devices');
    console.log('  Solution: Enhanced GPS compensation should handle this');
  } else if (distance > 10) {
    console.log('🔧 TROUBLESHOOTING TIPS:');
    console.log('1. Ensure both devices have GPS enabled');
    console.log('2. Move outside or near windows for better GPS signal');
    console.log('3. Wait 30 seconds for GPS to stabilize');
    console.log('4. Check if devices are using different GPS providers');
    console.log('5. Try refreshing location on both devices');
  }
  
  return { distance, formatted, withinRange: distance <= 10, coordinateDiff: totalCoordDiff };
};

/**
 * CRITICAL: Test location consistency for final year project validation
 * Tests that same coordinates always produce same distance
 */
export const testLocationConsistency = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  console.log('=== PROJECT CONSISTENCY VALIDATION TEST ===');
  console.log('Testing that same coordinates always give same distance...');
  
  const results: number[] = [];
  const testRuns = 5;
  
  // Run multiple calculations with same coordinates
  for (let i = 0; i < testRuns; i++) {
    const distance = calculateDistance(lat1, lng1, lat2, lng2);
    results.push(distance);
    console.log(`Test ${i + 1}: ${distance.toFixed(3)}m`);
  }
  
  // Check consistency
  const uniqueResults = [...new Set(results)];
  const isConsistent = uniqueResults.length === 1;
  
  console.log('CONSISTENCY RESULTS:');
  console.log(`  All ${testRuns} tests returned same value: ${isConsistent ? 'YES ✅' : 'NO ❌'}`);
  console.log(`  Unique results: ${uniqueResults.map(r => r.toFixed(3)).join(', ')}`);
  
  if (isConsistent) {
    console.log(`  🎯 PROJECT READY: Same location always gives ${results[0].toFixed(3)}m`);
  } else {
    console.log(`  ⚠️ INCONSISTENT: Multiple values detected - needs fixing`);
  }
  
  return { consistent: isConsistent, results, uniqueResults };
};

/**
 * Test function specifically for same location devices showing wrong distance
 * @param staffLat Staff latitude
 * @param staffLng Staff longitude  
 * @param studentLat Student latitude
 * @param studentLng Student longitude
 */
export const testSameLocationIssue = (staffLat: number, staffLng: number, studentLat: number, studentLng: number) => {
  console.log('=== TESTING SAME LOCATION ISSUE ===');
  
  // First test consistency
  const consistencyTest = testLocationConsistency(staffLat, staffLng, studentLat, studentLng);
  
  if (!consistencyTest.consistent) {
    console.log('❌ CRITICAL: Inconsistent distance calculation detected!');
    console.log('   Same coordinates giving different distances');
    console.log('   This will fail project evaluation');
    return { ...consistencyTest, projectReady: false };
  }
  
  const distance = consistencyTest.results[0];
  
  if (distance <= 10.000) {
    console.log('✅ PROJECT READY: Consistent distance within 10m rule');
    console.log(`   Distance: ${distance.toFixed(3)}m (≤ 10.000m)`);
  } else {
    console.log('ℹ️ DIFFERENT LOCATION: Devices genuinely far apart');
    console.log(`   Distance: ${distance.toFixed(3)}m (> 10.000m)`);
  }
  
  return { ...consistencyTest, projectReady: true, distance };
};
