/**
 * Geolocation utilities
 * Functions for handling geolocation and distance calculations
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationResult extends Coordinates {
  accuracy: number;
}

/**
 * Get current user location using HTML5 Geolocation API with enhanced accuracy
 * @returns Promise with coordinates and accuracy
 */
export const getCurrentLocation = (): Promise<LocationResult> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const result = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        
        console.log('Location obtained:', {
          ...result,
          timestamp: new Date().toISOString()
        });
        
        resolve(result);
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please enable location access and try again.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information unavailable. Please check your GPS/network connection.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out. Please try again.'));
            break;
          default:
            reject(new Error('An unknown error occurred while getting your location.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // 30 seconds timeout
        maximumAge: 0, // Don't use cached position
      }
    );
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
  // Validate coordinates with more precision
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    throw new Error('Invalid coordinates provided - null or undefined values');
  }

  // Check if coordinates are within valid ranges
  if (Math.abs(lat1) > 90 || Math.abs(lat2) > 90) {
    throw new Error(`Invalid latitude values: lat1=${lat1}, lat2=${lat2}`);
  }
  if (Math.abs(lon1) > 180 || Math.abs(lon2) > 180) {
    throw new Error(`Invalid longitude values: lon1=${lon1}, lon2=${lon2}`);
  }

  // Use high-precision Earth radius
  const R = 6371008.8; // Earth's radius in meters (WGS84 ellipsoid mean radius)
  
  // Convert to radians with high precision
  const φ1 = lat1 * (Math.PI / 180);
  const φ2 = lat2 * (Math.PI / 180);
  const Δφ = (lat2 - lat1) * (Math.PI / 180);
  const Δλ = (lon2 - lon1) * (Math.PI / 180);

  // Haversine formula with high precision
  const sinΔφ2 = Math.sin(Δφ / 2);
  const sinΔλ2 = Math.sin(Δλ / 2);
  
  const a = sinΔφ2 * sinΔφ2 + 
            Math.cos(φ1) * Math.cos(φ2) * sinΔλ2 * sinΔλ2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c; // Distance in meters
  
  // Enhanced logging for debugging
  console.log('=== HIGH-PRECISION DISTANCE CALCULATION ===');
  console.log('Input coordinates:');
  console.log(`  Staff: ${lat1.toFixed(8)}, ${lon1.toFixed(8)}`);
  console.log(`  Student: ${lat2.toFixed(8)}, ${lon2.toFixed(8)}`);
  console.log('Coordinate differences:');
  console.log(`  Δφ (lat diff): ${(lat2 - lat1).toFixed(8)} degrees`);
  console.log(`  Δλ (lng diff): ${(lon2 - lon1).toFixed(8)} degrees`);
  console.log('Calculation steps:');
  console.log(`  a = ${a.toFixed(12)}`);
  console.log(`  c = ${c.toFixed(12)}`);
  console.log(`  Raw distance: ${distance.toFixed(6)} meters`);
  console.log(`  Final distance: ${Math.round(distance * 1000) / 1000} meters`);
  console.log('=== END CALCULATION ===');

  // Return with 3 decimal places precision (millimeter accuracy)
  return Math.round(distance * 1000) / 1000;
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
  // If distance is beyond 10 meters, show "Too far" instead of actual distance
  if (meters > 10) {
    return "Too far";
  }
  
  // For very small distances (< 1m), show millimeter precision
  if (meters < 1) {
    return `${(meters * 1000).toFixed(0)} mm`;
  }
  
  // For distances 1-10m, show centimeter precision
  return `${meters.toFixed(3)} m`;
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
      
      // Wait between attempts for GPS to stabilize
      if (i < attempts - 1) {
        console.log('Waiting 3 seconds for GPS to stabilize...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.warn(`❌ Location attempt ${i + 1} failed:`, error);
      if (i === attempts - 1 && locations.length === 0) {
        throw error;
      }
    }
  }
  
  if (locations.length === 0) {
    throw new Error('Failed to get any location readings');
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
