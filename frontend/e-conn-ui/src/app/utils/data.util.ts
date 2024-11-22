const currentEnvironment = window.location.hostname;

const configData = {
    hostURL: currentEnvironment === "localhost" ? "http://localhost:6969" : "https://e-conn-production.up.railway.app",
};

export default configData;