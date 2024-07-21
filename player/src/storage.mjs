// Function to write an object to localStorage
 function writeToLocalStorage(key, object) {
  try {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(object);
    
    // Save the JSON string to localStorage
    localStorage.setItem(key, jsonString);
    
    console.log(`Object saved to localStorage with key: ${key} ${jsonString}` );
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
}

// Function to read an object from localStorage
 function readFromLocalStorage(key) {
  try {
    // Retrieve the JSON string from localStorage
    const jsonString = localStorage.getItem(key);
    
    if (jsonString === null) {
      console.log(`No data found in localStorage for key: ${key} ${jsonString}`);
      return null;
    }
    
    // Parse the JSON string back to an object
    const object = JSON.parse(jsonString);
    
    console.log(`Object retrieved from localStorage with key: ${key}`);
    return object;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

export {writeToLocalStorage,readFromLocalStorage};