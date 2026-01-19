const error: string = "Missing element.";
const message: string = "MOD Player Demystified - Demo runner booted.";

const application = document.getElementById("application");
if (!application) throw new Error(error);

application.textContent = message;
console.log(message);