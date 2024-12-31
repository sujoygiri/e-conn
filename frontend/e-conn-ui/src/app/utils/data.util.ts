const currentEnvironment = window.location.hostname;
export const configData = {
    // hostURL: currentEnvironment === "localhost" ? "http://localhost:6969" : "https://e-conn-production.up.railway.app",
    hostURL: "https://e-conn-production.up.railway.app",
};

export const getUUID = () => {
    let uuid = window.crypto.randomUUID();
    return uuid;
};
